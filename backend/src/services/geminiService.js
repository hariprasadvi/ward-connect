const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const { VertexAI } = require('@google-cloud/vertexai');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const getGenAI = () => {
    if (!process.env.GEMINI_API_KEY) return null;
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const getVertexAI = () => {
    // Only attempt to initialize if they provided Google Cloud Credentials
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) return null;
    try {
        return new VertexAI({
            project: 'gen-lang-client-0064140177', // Extracting from the JSON file you provided
            location: 'us-central1' // Vertex AI default generative location
        });
    } catch (e) {
        console.error("Vertex AI Initialization Failed:", e);
        return null;
    }
}

/**
 * Helper to call AI with a chain of fallback models (Claude -> Gemini -> OpenAI) and retry logic
 */
async function callAI(payload, isReport = false) {
    const isTextOnly = typeof payload === 'string' || (Array.isArray(payload) && typeof payload[0] === 'string' && payload.length === 1);
    
    // 1. PRIMARY: Claude API (Anthropic) - The requested provider for generating minutes
    if (process.env.CLAUDE_API_KEY && isTextOnly) {
        console.log("Using Claude API (Anthropic) for text generation...");
        try {
            const prompt = Array.isArray(payload) ? payload[0] : payload;
            const response = await axios.post('https://api.anthropic.com/v1/messages', {
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 2048,
                messages: [{ role: "user", content: prompt }]
            }, {
                headers: {
                    'x-api-key': process.env.CLAUDE_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                }
            });

            const text = response.data.content[0].text;
            if (isReport) return text;

            let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                console.log("Success with Claude API!");
                return JSON.parse(cleanedText);
            } catch (e) {
                return { rawText: text };
            }
        } catch (claudeError) {
            console.error("Claude API failed:", claudeError.response?.data || claudeError.message);
            console.log("Falling back to Gemini...");
        }
    }

    // 2. PRIMARY 2 / FALLBACK 1: Google Cloud Vertex AI (Using provided JSON Key)
    const vertexAI = getVertexAI();
    let vertexSucceeded = false;
    
    // For Vertex, we append -001 to model names or use the latest supported flash models
    const vertexModels = ["gemini-1.5-flash-001", "gemini-1.5-pro-001"];
    const MAX_RETRIES = 2;
    const BASE_DELAY_MS = 10000;

    if (vertexAI) {
        for (const modelName of vertexModels) {
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    console.log(`Trying Vertex AI (Cloud AI) model: ${modelName} (attempt ${attempt}/${MAX_RETRIES})...`);
                    const model = vertexAI.getGenerativeModel({ model: modelName });
                    
                    // Vertex generativeContent handles payloads identically to Gemini Studio!
                    const result = await model.generateContent(payload);
                    const response = await result.response;
                    const text = response.text();

                    if (isReport) return text;

                    let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                    try {
                        console.log(`Success with Vertex AI model: ${modelName}`);
                        return JSON.parse(cleanedText);
                    } catch (e) {
                        return { rawText: text };
                    }
                } catch (error) {
                    const status = error.status || (error.response && error.response.status);
                    const isRateLimited = status === 429 || (error.message && error.message.includes('429'));
                    const isQuotaExhausted = error.message && (error.message.includes('quota') || error.message.includes('Quota'));
                    
                    if (isRateLimited && attempt < MAX_RETRIES) {
                        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } else if (isRateLimited || isQuotaExhausted || status === 404 || (error.message && error.message.includes('not found'))) {
                        console.warn(`Vertex model ${modelName} exhausted, missing, or unavailable. Trying next...`);
                        break; 
                    } else {
                        console.error(`Vertex Error (${modelName}):`, error.message);
                        break; 
                    }
                }
            }
        }
    }

    // 3. FALLBACK 2: Standard Gemini API (AI Studio)
    const genAI = getGenAI();
    // Added newest 2.5 models at the top to bypass exhausted 2.0/1.5 tier quotas
    // Standard stable models
    const geminiModels = ["gemini-1.5-flash", "gemini-1.5-pro"];

    if (genAI) {
        for (const modelName of geminiModels) {
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    console.log(`Trying Gemini model: ${modelName} (attempt ${attempt}/${MAX_RETRIES})...`);
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent(payload);
                    const response = await result.response;
                    const text = response.text();

                    if (isReport) return text;

                    let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                    try {
                        console.log(`Success with Gemini model: ${modelName}`);
                        return JSON.parse(cleanedText);
                    } catch (e) {
                        return { rawText: text };
                    }
                } catch (error) {
                    const status = error.status || (error.response && error.response.status);
                    const isRateLimited = status === 429 || (error.message && error.message.includes('429'));
                    const isQuotaExhausted = error.message && (error.message.includes('quota') || error.message.includes('Quota'));
                    
                    if (isRateLimited && attempt < MAX_RETRIES) {
                        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } else if (isRateLimited || isQuotaExhausted || status === 404) {
                        console.warn(`Gemini model ${modelName} failed (${status || 'Quota/404'}). Trying next...`);
                        break; 
                    } else {
                        console.error(`Gemini Error (${modelName}):`, error.message);
                        break; 
                    }
                }
            }
        }
    }

    // 3. FINAL FALLBACK: OpenAI
    if (process.env.OPENAI_API_KEY && isTextOnly) {
        console.log("Gemini failed. Falling back to OpenAI (GPT-4o-mini)...");
        try {
            const prompt = Array.isArray(payload) ? payload[0] : payload;
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const text = response.data.choices[0].message.content;
            if (isReport) return text;

            let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                console.log("Success with OpenAI fallback!");
                return JSON.parse(cleanedText);
            } catch (e) {
                return { rawText: text };
            }
        } catch (openaiError) {
            console.error("OpenAI Fallback also failed:", openaiError.response?.data || openaiError.message);
        }
    }

    const finalError = new Error('AI Services (Claude, Gemini & OpenAI) are currently unavailable or quotas are exhausted.');
    finalError.isQuotaError = true;
    throw finalError;
}

exports.processMeetingAudio = async (audioBuffer, mimeType) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

        const genAI = new GoogleGenerativeAI(apiKey);
        const fileManager = new GoogleAIFileManager(apiKey);
        
        // Decide whether to use inlineData (small files < 20MB) or File API (larger files)
        const fileSizeMB = audioBuffer.length / (1024 * 1024);
        console.log(`Processing audio file of size: ${fileSizeMB.toFixed(2)} MB`);

        let audioSource;
        let tempFilePath;

        if (fileSizeMB < 15) { // Use inline for small files
            console.log("Using inlineData for small audio file...");
            audioSource = {
                inlineData: {
                    mimeType: mimeType || 'audio/webm',
                    data: audioBuffer.toString('base64')
                }
            };
        } else {
            // Use File API for larger files
            console.log("Using Gemini File API for large audio file...");
            const fs = require('fs');
            const path = require('path');
            const os = require('os');
            
            tempFilePath = path.join(os.tmpdir(), `meeting-audio-${Date.now()}.webm`);
            fs.writeFileSync(tempFilePath, audioBuffer);
            
            const uploadResult = await fileManager.uploadFile(tempFilePath, {
                mimeType: mimeType || 'audio/webm',
                displayName: "Meeting Audio",
            });
            
            console.log(`Uploaded file success: ${uploadResult.file.uri}`);
            
            // Wait for file to be processed if necessary (for very large files)
            // For audio usually fast, but let's just use it
            audioSource = {
                fileData: {
                    mimeType: uploadResult.file.mimeType,
                    fileUri: uploadResult.file.uri
                }
            };
        }

        const prompt = `
        You are an expert assistant for Kudumbashree (neighborhood groups in Kerala). 
        You will be provided with an audio recording of a meeting.
        
        TASKS:
        1. **Transcribe**: Listen carefully and provide a complete, accurate transcription of the conversation in **Malayalam (മലയാളം)**.
        2. **Summarize**: Create a professional "Meeting Minutes" summary in **Malayalam (മലയാളം)**.
        
        The summary must include:
        - യോഗത്തിന്റെ തലക്കെട്ട് (Meeting Title)
        - പ്രധാന ചർച്ചാ വിഷയങ്ങൾ (Key Discussion Points)
        - എടുത്ത തീരുമാനങ്ങൾ (Decisions Taken)
        - തുടർനടപടികൾ (Action Items)
        
        RESPONSE FORMAT:
        You MUST return the output ONLY as a valid JSON object with exactly these two keys:
        {
            "transcript": "...",
            "summary": "..."
        }
        
        IMPORTANT: Ensure the transcription and summary are entirely in Malayalam. Use proper Malayalam grammar and vocabulary.
        `;

        // Try models with fallback logic
        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro"];
        let text = "";
        let success = false;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting generation with model: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent([prompt, audioSource]);
                const response = await result.response;
                text = response.text();
                success = true;
                break;
            } catch (err) {
                console.warn(`Model ${modelName} failed:`, err.message);
                continue;
            }
        }

        if (!success) throw new Error("All Gemini models failed to process audio.");

        // Cleanup temp file if created
        if (tempFilePath) {
            try { require('fs').unlinkSync(tempFilePath); } catch (e) {}
        }

        let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            return JSON.parse(cleanedText);
        } catch (e) {
            console.warn("Gemini returned non-JSON response, attempting to extract fields...");
            // Basic extraction if JSON fails
            return {
                transcript: text,
                summary: "Could not parse structured summary. Please check the full transcript above."
            };
        }
    } catch (error) {
        console.error("Gemini processMeetingAudio error:", error);
        throw error;
    }
};

exports.summarizeMeetingTranscript = async (transcript) => {
    const prompt = `
    You are an expert assistant for Kudumbashree (neighborhood groups in Kerala).
    Given the following Malayalam meeting transcript, generate a professional and structured "Meeting Minutes" summary in **Malayalam (മലയാളം)**.
    
    The summary should include:
    - ചർച്ചാ വിഷയങ്ങൾ (Discussion Topics)
    - പ്രധാന തീരുമാനങ്ങൾ (Key Decisions)
    - തുടർനടപടികൾ (Action Items)
    
    Format your response as a JSON object strictly like this:
    {
        "summary": "Structured Malayalam summary here..."
    }

    Transcript:
    ${transcript}
    `;

    try {
        const result = await callAI(prompt);
        if (result.rawText) {
            return { transcript, summary: result.rawText };
        }
        return {
            transcript: transcript,
            summary: result.summary
        };
    } catch (error) {
        console.error("Gemini summarizeMeetingTranscript error:", error);
        throw error;
    }
};

exports.generateReport = async (data, type) => {
    const prompt = `
You are an expert financial and administrative analyst for Kudumbashree (കുടുംബശ്രീ — neighborhood groups in Kerala).
Please generate a professional, detailed ${type} report **entirely in Malayalam (മലയാളം)** based on the following JSON data.

The report should include:
- ഒരു എക്സിക്യൂട്ടീവ് സമ്മറി (Executive Summary)
- ഡാറ്റ വിശകലനം (Data Analysis — trends, key metrics like total loans, outstanding amounts, or attendance rates)
- ശുപാർശകൾ (Bullet-point Recommendations)

Here is the raw data in JSON format:
${JSON.stringify(data, null, 2)}

IMPORTANT: The ENTIRE report must be written in Malayalam. Use Markdown format for structure (headers, tables, bold, lists). Keep numbers and currency (₹) as-is. Be concise, precise, and professional.
`;

    try {
        return await callAI(prompt, true);
    } catch (error) {
        console.warn("Gemini generateReport failed, using fallback:", error.message);
        return generateFallbackReport(data, type);
    }
};

/**
 * Generates a professional fallback report in Malayalam from actual data when Gemini API is unavailable.
 */
function generateFallbackReport(data, type) {
    const now = new Date().toLocaleDateString('ml-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    if (type === 'Loan') {
        const s = data.summary || {};
        let report = `# കുടുംബശ്രീ വായ്പ വിശകലന റിപ്പോർട്ട്\n\n`;
        report += `**തീയതി:** ${now}\n\n---\n\n`;
        report += `## എക്സിക്യൂട്ടീവ് സമ്മറി\n\n`;
        report += `കുടുംബശ്രീ ഗ്രൂപ്പിലെ എല്ലാ വായ്പ പ്രവർത്തനങ്ങളുടെയും സമഗ്രമായ ഒരു അവലോകനം ഈ റിപ്പോർട്ട് നൽകുന്നു. `;
        report += `ആകെ **${s.totalLoans || 0} വായ്പകൾ** പ്രോസസ്സ് ചെയ്തിട്ടുണ്ട്, ആകെ **₹${(s.totalAmountDisbursed || 0).toLocaleString('en-IN')}** വിതരണം ചെയ്തു.\n\n`;
        report += `## പ്രധാന അളവുകൾ\n\n`;
        report += `| അളവ് | മൂല്യം |\n|---|---|\n`;
        report += `| ആകെ വായ്പകൾ | ${s.totalLoans || 0} |\n`;
        report += `| ആകെ വിതരണം ചെയ്തത് | ₹${(s.totalAmountDisbursed || 0).toLocaleString('en-IN')} |\n`;
        report += `| ആകെ തിരിച്ചടച്ചത് | ₹${(s.totalRepaid || 0).toLocaleString('en-IN')} |\n`;
        report += `| കുടിശ്ശിക ബാക്കി | ₹${(s.totalOutstanding || 0).toLocaleString('en-IN')} |\n`;
        report += `| കാലഹരണപ്പെട്ട തുക | ₹${(s.totalOverdue || 0).toLocaleString('en-IN')} |\n`;
        report += `| വസൂൽ നിരക്ക് | ${s.recoveryRate || 0}% |\n\n`;
        report += `## വായ്പ സ്ഥിതി വിവരം\n\n`;
        report += `| സ്ഥിതി | എണ്ണം |\n|---|---|\n`;
        report += `| സജീവം | ${s.activeLoans || 0} |\n`;
        report += `| തീർപ്പുകൽപ്പിക്കാത്തത് | ${s.pendingLoans || 0} |\n`;
        report += `| അടച്ചുതീർത്തത് | ${s.closedLoans || 0} |\n`;
        report += `| നിരസിച്ചത് | ${s.rejectedLoans || 0} |\n\n`;

        if (data.loanDetails && data.loanDetails.length > 0) {
            report += `## വ്യക്തിഗത വായ്പ വിവരങ്ങൾ\n\n`;
            report += `| അംഗം | തുക | തിരിച്ചടവ് | കുടിശ്ശിക | സ്ഥിതി | പലിശ നിരക്ക് |\n|---|---|---|---|---|---|\n`;
            data.loanDetails.forEach(l => {
                report += `| ${l.member} | ₹${l.amount.toLocaleString('en-IN')} | ₹${l.repaid.toLocaleString('en-IN')} | ₹${l.overdue.toLocaleString('en-IN')} | ${l.status} | ${l.interestRate}% |\n`;
            });
            report += '\n';
        }

        report += `## ശുപാർശകൾ\n\n`;
        report += `- ${s.recoveryRate >= 80 ? 'മികച്ച വസൂൽ നിരക്ക്. നിലവിലെ തിരിച്ചടവ് നിരീക്ഷണ രീതികൾ തുടരുക.' : 'വസൂൽ നിരക്ക് മെച്ചപ്പെടുത്തേണ്ടതുണ്ട്. കൂടുതൽ കർശനമായ ഫോളോ-അപ്പ് ഷെഡ്യൂളുകൾ നടപ്പിലാക്കുക.'}\n`;
        report += `- ${s.totalOverdue > 0 ? `₹${(s.totalOverdue).toLocaleString('en-IN')} കുടിശ്ശിക തുക അംഗങ്ങളുമായി ചർച്ച ചെയ്തും പേയ്‌മെന്റ് റിമൈൻഡറുകൾ അയച്ചും പരിഹരിക്കുക.` : 'കുടിശ്ശിക തുക ഇല്ല — മികച്ച സാമ്പത്തിക അച്ചടക്കം.'}\n`;
        report += `- ${s.pendingLoans > 0 ? `${s.pendingLoans} തീർപ്പുകൽപ്പിക്കാത്ത വായ്പ അപേക്ഷ(കൾ) ഉടനടി പരിശോധിക്കുക.` : 'എല്ലാ വായ്പ അപേക്ഷകളും പ്രോസസ്സ് ചെയ്തു.'}\n`;
        return report;

    } else if (type === 'Attendance') {
        const s = data.summary || {};
        let report = `# കുടുംബശ്രീ ഹാജർനില അവലോകന റിപ്പോർട്ട്\n\n`;
        report += `**തീയതി:** ${now}\n\n---\n\n`;
        report += `## എക്സിക്യൂട്ടീവ് സമ്മറി\n\n`;
        report += `കുടുംബശ്രീ ഗ്രൂപ്പ് നടത്തിയ **${s.totalMeetings || 0} യോഗങ്ങളിലെ** അംഗങ്ങളുടെ ഹാജർനില ഈ റിപ്പോർട്ട് വിശകലനം ചെയ്യുന്നു. `;
        report += `മൊത്തത്തിലുള്ള ഹാജർനില നിരക്ക് **${s.overallAttendanceRate || 0}%** ആണ്.\n\n`;
        report += `## മൊത്തം സ്ഥിതിവിവരക്കണക്കുകൾ\n\n`;
        report += `| അളവ് | മൂല്യം |\n|---|---|\n`;
        report += `| ആകെ യോഗങ്ങൾ | ${s.totalMeetings || 0} |\n`;
        report += `| ഹാജരായവർ | ${s.totalPresent || 0} |\n`;
        report += `| ഹാജരാകാത്തവർ | ${s.totalAbsent || 0} |\n`;
        report += `| മൊത്തം ഹാജർനില നിരക്ക് | ${s.overallAttendanceRate || 0}% |\n\n`;

        if (data.memberWiseAttendance && data.memberWiseAttendance.length > 0) {
            report += `## അംഗം തിരിച്ചുള്ള ഹാജർനില\n\n`;
            report += `| അംഗം | ഹാജർ | അസാന്നിധ്യം | നിരക്ക് |\n|---|---|---|---|\n`;
            data.memberWiseAttendance.forEach(m => {
                report += `| ${m.member} | ${m.present} | ${m.absent} | ${m.attendanceRate}% |\n`;
            });
            report += '\n';
        }

        if (data.recentMeetings && data.recentMeetings.length > 0) {
            report += `## സമീപകാല യോഗങ്ങൾ\n\n`;
            report += `| തലക്കെട്ട് | തീയതി | സ്ഥിതി |\n|---|---|---|\n`;
            data.recentMeetings.forEach(m => {
                report += `| ${m.title} | ${new Date(m.date).toLocaleDateString('ml-IN')} | ${m.status} |\n`;
            });
            report += '\n';
        }

        report += `## ശുപാർശകൾ\n\n`;
        report += `- ${s.overallAttendanceRate >= 75 ? 'നല്ല ഹാജർനില നിരക്ക്. ഈ പങ്കാളിത്തം നിലനിർത്തുക.' : 'ഹാജർനില 75%-ൽ താഴെയാണ്. കൂടുതൽ സൗകര്യപ്രദമായ സമയങ്ങളിൽ യോഗങ്ങൾ ഷെഡ്യൂൾ ചെയ്യുകയും റിമൈൻഡറുകൾ അയയ്ക്കുകയും ചെയ്യുക.'}\n`;
        report += `- തുടർച്ചയായി ഹാജരാകാത്ത അംഗങ്ങളെ കണ്ടെത്തി വ്യക്തിഗതമായി ബന്ധപ്പെടുക.\n`;
        report += `- മെച്ചപ്പെട്ട പങ്കാളിത്തത്തിനായി ഹാജർനില പ്രോത്സാഹനങ്ങൾ നടപ്പിലാക്കുന്നത് പരിഗണിക്കുക.\n`;
        return report;

    } else if (type === 'Financial') {
        const s = data.financialSummary || {};
        let report = `# കുടുംബശ്രീ സാമ്പത്തിക ആരോഗ്യ റിപ്പോർട്ട്\n\n`;
        report += `**തീയതി:** ${now}\n\n---\n\n`;
        report += `## എക്സിക്യൂട്ടീവ് സമ്മറി\n\n`;
        report += `വായ്പ വിതരണം, തിരിച്ചടവുകൾ, കുടിശ്ശിക ബാലൻസുകൾ എന്നിവ ഉൾക്കൊള്ളുന്ന കുടുംബശ്രീ ഗ്രൂപ്പിന്റെ സാമ്പത്തിക ആരോഗ്യ സ്ഥിതി ഈ റിപ്പോർട്ട് അവതരിപ്പിക്കുന്നു.\n\n`;
        report += `## സാമ്പത്തിക അവലോകനം\n\n`;
        report += `| അളവ് | മൂല്യം |\n|---|---|\n`;
        report += `| ആകെ വായ്പ വിതരണം | ₹${(s.totalLoansDisbursed || 0).toLocaleString('en-IN')} |\n`;
        report += `| ആകെ തിരിച്ചടവുകൾ | ₹${(s.totalRepayments || 0).toLocaleString('en-IN')} |\n`;
        report += `| കുടിശ്ശിക ബാക്കി | ₹${(s.outstandingBalance || 0).toLocaleString('en-IN')} |\n`;
        report += `| കാലഹരണപ്പെട്ട തുക | ₹${(s.totalOverdue || 0).toLocaleString('en-IN')} |\n`;
        report += `| വസൂൽ നിരക്ക് | ${s.recoveryRate || 0}% |\n\n`;

        if (data.loanBreakdown) {
            report += `## വായ്പ സ്ഥിതി വിവരം\n\n`;
            report += `| സ്ഥിതി | എണ്ണം |\n|---|---|\n`;
            report += `| സജീവം | ${data.loanBreakdown.active || 0} |\n`;
            report += `| അടച്ചുതീർത്തത് | ${data.loanBreakdown.closed || 0} |\n`;
            report += `| തീർപ്പുകൽപ്പിക്കാത്തത് | ${data.loanBreakdown.pending || 0} |\n\n`;
        }

        report += `## ശുപാർശകൾ\n\n`;
        report += `- ${s.recoveryRate >= 80 ? 'ശക്തമായ സാമ്പത്തിക ആരോഗ്യം, നല്ല വസൂൽ നിരക്ക്.' : 'ഘടനാപരമായ ഫോളോ-അപ്പുകളിലൂടെ വായ്പ വസൂൽ നിരക്ക് മെച്ചപ്പെടുത്തുന്നതിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുക.'}\n`;
        report += `- ${s.totalOverdue > 0 ? 'പണമൊഴുക്ക് മെച്ചപ്പെടുത്തുന്നതിന് കുടിശ്ശിക തുകകളുടെ ശേഖരണത്തിന് മുൻഗണന നൽകുക.' : 'കുടിശ്ശിക തുകകൾ ഇല്ല — മികച്ച സാമ്പത്തിക മാനേജ്‌മെന്റ്.'}\n`;
        report += `- അടിയന്തര വായ്പയ്ക്കായി ആകെ വിതരണത്തിന്റെ 20% എങ്കിലും കരുതൽ ധനമായി സൂക്ഷിക്കുക.\n`;
        return report;
    }

    return `# ${type} റിപ്പോർട്ട്\n\n**തീയതി:** ${now}\n\nഈ റിപ്പോർട്ട് തരത്തിന് ഡാറ്റ ലഭ്യമല്ല.`;
}
