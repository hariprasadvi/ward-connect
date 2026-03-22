const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

// Ensure GEMINI_API_KEY is set in .env
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGenAI = () => {
    if (!process.env.GEMINI_API_KEY) return null;
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

exports.processMeetingAudio = async (audioBuffer, mimeType) => {
    try {
        const genAI = getGenAI();
        if (!genAI) {
            console.warn("Gemini API Key missing. Returning mock data.");
            return { transcript: "Mock Transcript: API Key Missing", summary: "Mock Summary: API Key Missing" };
        }
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Convert buffer to base64
        const audioBase64 = audioBuffer.toString('base64');

        const prompt = `
        You are an intelligent assistant for Kudumbashree (neighborhood groups in Kerala).
        Please listen to this Malayalam meeting audio and perform the following TWO tasks:
        
        1. **Transcribe**: Provide a full Malayalam transcription of the audio.
        2. **Summarize**: Provide a structured "Meeting Minutes" summary in **Malayalam**, including Key Decisions and Action Items.
        
        Format your response as a JSON object strictly like this:
        {
            "transcript": "Full Malayalam transcript here...",
            "summary": "Structured Malayalam summary here..."
        }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: mimeType || 'audio/webm', // dependent on what frontend sends
                    data: audioBase64
                }
            }
        ]);

        const response = await result.response;
        let text = response.text();

        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini:", text);
            // Fallback: return raw text as transcript
            return {
                transcript: text,
                summary: "Could not parse structured summary. See transcript."
            };
        }

    } catch (error) {
        console.error("Gemini AI API Error:", error);
        throw error;
    }
};

exports.summarizeMeetingTranscript = async (transcript) => {
    try {
        const genAI = getGenAI();
        if (!genAI) {
            console.warn("Gemini API Key missing. Returning mock data.");
            return { transcript: transcript, summary: "Mock Summary: Gemini API Key Missing" };
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are an intelligent assistant for Kudumbashree (neighborhood groups in Kerala).
        Given the following Malayalam meeting transcript, generate a structured "Meeting Minutes" summary in **Malayalam**, including Key Decisions and Action Items.
        
        Format your response as a JSON object strictly like this:
        {
            "summary": "Structured Malayalam summary here..."
        }

        Transcript:
        ${transcript}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const parsed = JSON.parse(text);
            return {
                transcript: transcript,
                summary: parsed.summary
            };
        } catch (e) {
            console.error("Failed to parse JSON from Gemini:", text);
            return {
                transcript: transcript,
                summary: "Could not parse structured summary. Generated text: " + text
            };
        }

    } catch (error) {
        console.error("Gemini AI API Error in summarization:", error);
        throw error;
    }
};

exports.generateReport = async (data, type) => {
    const genAI = getGenAI();
    if (!genAI) {
        console.warn("Gemini API Key missing. Returning fallback report.");
        return generateFallbackReport(data, type);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

    // Retry logic for rate limiting (429)
    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 10000; // 10 seconds

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            const isRateLimited = error.status === 429 || (error.message && error.message.includes('429'));
            if (isRateLimited && attempt < MAX_RETRIES) {
                const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1); // 10s, 20s, 40s
                console.warn(`Gemini rate limited (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else if (isRateLimited) {
                console.warn("Gemini quota exhausted after retries. Using fallback report.");
                return generateFallbackReport(data, type);
            } else {
                console.error("Gemini AI Report Error:", error);
                throw error;
            }
        }
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
