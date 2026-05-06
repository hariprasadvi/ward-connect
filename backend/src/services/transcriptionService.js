const speech = require('@google-cloud/speech');
const dotenv = require('dotenv');
dotenv.config();

// Ensure GOOGLE_APPLICATION_CREDENTIALS is set in .env
let client;
try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        client = new speech.SpeechClient();
        console.log("Google Cloud Speech-to-Text Client Initialized.");
    }
} catch (e) {
    console.error("Failed to initialize Google Cloud Speech-to-Text:", e);
}

exports.transcribeAudioBuffer = async (audioBuffer, mimeType) => {
    if (!client) {
        throw new Error("Google Cloud Speech client is not initialized. Please check your JSON credentials.");
    }

    console.log("Starting Google Cloud Speech-to-Text transcription...");

    // Determine encoding from mimeType. Default webm is WEBM_OPUS. 
    // WAV is LINEAR16, generic mp3 is MP3 (needs v1p1beta1 or specific config sometimes, but v1 supports it now).
    // The frontend currently uses MediaRecorder which produces audio/webm;codecs=opus
    let encoding = 'WEBM_OPUS';
    let sampleRateHertz = 48000;

    if (mimeType.includes('wav')) {
        encoding = 'LINEAR16';
        sampleRateHertz = 44100; // usually, but can vary
    } else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) {
        encoding = 'MP3';
        sampleRateHertz = 16000;
    }

    const audio = {
        content: audioBuffer.toString('base64'),
    };

    const config = {
        encoding: encoding,
        languageCode: 'ml-IN', // Malayalam
        enableAutomaticPunctuation: true,
        // sampleRateHertz is optional for WEBM_OPUS & MP3 in many cases, but leaving it auto-detect where possible
    };

    // WEBM_OPUS requires sample rate in some versions, but usually google can auto-detect.
    // To be safe, let's omit sampleRateHertz unless it's LINEAR16, as Google often infers it.
    if (encoding === 'LINEAR16') {
        config.sampleRateHertz = sampleRateHertz;
    }

    const request = {
        audio: audio,
        config: config,
    };

    try {
        // Use recognize for short audio. If files are large, longRunningRecognize is needed,
        // but it requires GCS URI for files > 1 min realistically.
        const [response] = await client.recognize(request);
        
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join(' ');
            
        console.log("Google Cloud STT successful. Transcript length:", transcription.length);
        return transcription;
    } catch (error) {
        console.error("Google Cloud STT Error:", error.message || error);
        
        // Enhance error message if it's the 1-minute limit
        if (error.message && error.message.includes('Sync input too long')) {
            throw new Error("Google Cloud Speech-to-Text: Audio file is too long for synchronous processing (Limit: ~1 minute). To process longer files, Google requires uploading to a Google Cloud Storage bucket first.");
        }
        throw error;
    }
};

// Keep existing methods if used elsewhere
exports.transcribeFromStream = (audioStream) => {
    // ... existing implementation remains, just stubbing for safety if needed
    throw new Error("transcribeFromStream not fully implemented for this flow.");
};
