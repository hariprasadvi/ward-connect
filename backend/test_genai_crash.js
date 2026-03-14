const { GoogleGenerativeAI } = require('@google/generative-ai');

try {
    console.log('Attempting to init with dummy key...');
    const genAI = new GoogleGenerativeAI('dummy_key_for_now');
    console.log('Init success!');
} catch (error) {
    console.error('Init crashed:', error);
}

try {
    console.log('Attempting to init with undefined...');
    const genAI2 = new GoogleGenerativeAI(undefined);
    console.log('Init undefined success!');
} catch (error) {
    console.error('Init undefined crashed:', error);
}
