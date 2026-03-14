try {
    const aiService = require('./src/services/ai.service');
    console.log('AI Service loaded successfully');
} catch (error) {
    console.error('AI Service load failed:', error);
}
