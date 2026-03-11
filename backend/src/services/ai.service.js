// const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
// Initialize Gemini only if API key is present
const genAI = null; // apiKey ? new GoogleGenerativeAI(apiKey) : null;

exports.assessLoanRisk = async (user, loanDetails, groupData) => {
    // Fallback if no API key
    if (!genAI) {
        console.warn('Gemini API Key missing. Returning mock AI assessment.');
        return {
            riskScore: 85,
            confidence: 0.9,
            explanation: "Mock Assessment: APIs key missing. User has good standing based on local data."
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Act as a Financial Risk Assessor for a community micro-finance group (Kudumbashree).
        Assess the risk of the following loan application.

        Applicant: ${user.full_name}
        - Age: ${user.age || 'N/A'}
        - Job: ${user.job || 'N/A'}
        
        Loan Details:
        - Amount: ${loanDetails.amount}
        - Purpose: ${loanDetails.purpose}
        - Tenure: ${loanDetails.tenure_months} months

        Group Context:
        - Group Name: ${groupData.name}
        - Total Group Funds: ${groupData.total_funds}

        Provide a response in strict JSON format:
        {
            "riskScore": number (0-100, where 100 is safe, 0 is high risk),
            "confidence": number (0-1),
            "explanation": "Short summary of why this score was given (max 2 sentences)."
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Basic cleanup to ensure JSON parsing works
        const jsonBlock = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonBlock);

    } catch (error) {
        console.error("AI Risk Assessment Failed:", error);
        // Fail gracefully
        return {
            riskScore: 50,
            confidence: 0.5,
            explanation: "AI Service unavailable. Manual review recommended."
        };
    }
};
