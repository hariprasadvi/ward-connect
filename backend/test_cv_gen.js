const geminiService = require('./src/services/gemini.service');
const dotenv = require('dotenv');
dotenv.config();

const dummyUser = {
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    jobTitle: "Software Engineer",
    location: "New York, USA",
    skills: "JavaScript, Node.js, Angular, Python",
    experience: "Software Developer at Tech Corp (2 years)",
    education: "B.Tech in Computer Science",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    certifications: "AWS Certified Developer",
    languages: "English, Spanish"
};

console.log("Starting CV Generation Test...");
geminiService.generateCV(dummyUser)
    .then(cv => {
        console.log("SUCCESS! Generated Summary:");
        console.log(cv.summary);
        console.log("Header Name:", cv.header.name);
    })
    .catch(err => {
        console.error("FAILURE! Error Details:");
        console.error(err);
    });
