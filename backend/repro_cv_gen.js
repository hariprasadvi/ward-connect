const { generateCV } = require("./src/services/gemini.service");
const dotenv = require("dotenv");
dotenv.config();

async function testCVGen() {
    const userData = {
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        jobTitle: "Software Developer",
        experience: "Internship at Google, 3 months. Built a react app.",
        projects: "Personal Portfolio website using Angular.",
        skills: "JavaScript, Angular, Node.js",
        education: "B.Tech Computer Science",
        location: "Kerala, India",
        linkedin: "linkedin.com/in/test",
        github: "github.com/test",
        certifications: "AWS Certified",
        languages: "English, Malayalam"
    };

    console.log("--- Testing CV Generation ---");
    try {
        const cv = await generateCV(userData);
        console.log("SUCCESS: CV Generated");
        console.log(JSON.stringify(cv, null, 2));
    } catch (e) {
        console.error("FAILURE:", e.message);
    }
}

testCVGen();
