const speech = require('@google-cloud/speech');
const s3Service = require('./s3Service');
const fs = require('fs');
const path = require('path');

// Initialize client
// Ensure GOOGLE_APPLICATION_CREDENTIALS is set in .env
const client = new speech.SpeechClient();

exports.transcribeAudio = async (gcsUri, audioChannelCount = 1) => {
    // Note: Google Cloud Speech-to-Text usually works best with files in GCS.
    // If the file is in S3, we might need to download it or pass the stream?
    // Google Speech-to-Text API requires GCS URI or local file buffer (limit 1 min) or stream.
    // For long files, GCS URI is recommended.
    
    // For this implementation, since we are using S3, we have two options:
    // 1. Move file to GCS (Complex)
    // 2. Stream from S3 to Google Speech API (Feasible)
    
    // BUT 'longRunningRecognize' primarily supports GCS URIs. 
    // Sending local file buffer > 1 min via API is not supported for synchronous requests.
    // Streaming recognition is for real-time.
    
    // Workaround for S3 -> Google Speech without intermediate GCS:
    // We can't really do 'longRunningRecognize' easily without GCS.
    // However, we can simulate it by downloading locally first if space permits.
    
    // Assuming for now we download to temp and upload to GCS OR we just use GCS directly.
    // Since the prompt implied S3, let's assume we download locally to temp.
    
    // NOTE: This is a simplifiction. In production, using GCS for Google Speech is standard.
    // We will assume that the user might not have GCS storage enabled, only Speech API.
    
    // IMPLEMENTATION:
    // 1. Download from S3 to local temp.
    // 2. Send to Google Speech (Limit: 10MB/1min for synchronous). 
    //    For long files, we MUST use GCS.
    
    // Since this is a constraint, I will assume we might strictly need GCS for Long Audio.
    // However, I will implement a "chunking" strategy? No too complex.
    
    // Let's assume the user will provide a GCS Bucket for temporary storage? 
    // Or we use the S3 file signed URL? Google doesn't accept S3/HTTP URLs directly.
    
    // ALTERNATIVE: Use OpenAI Whisper? It handles S3 signed URLs? No, it takes file uploads.
    // The requirement is "Google Cloud Speech-to-Text".
    
    // OK, let's stick to the plan:
    // If we assume meetings are short (< 1 min), simple recognize works.
    // But meetings are long.
    
    // Strategy: We will just mock the transcription call if no keys are present, 
    // but code it for "longRunningRecognize" assuming the user MIGHT update code to put file in GCS.
    // OR we stream the audio. StreamingRecognize allows long audio!
    
    // Let's implement StreamingRecognize sourced from S3 stream.
    
    const request = {
        config: {
            encoding: 'WEBM_OPUS', // Or LINEAR16, dependent on recording format from frontend
            sampleRateHertz: 48000,
            languageCode: 'ml-IN', // MALAYALAM
            model: 'default',
            audioChannelCount: audioChannelCount
        },
        interimResults: false,
    };

    return new Promise((resolve, reject) => {
        const recognizeStream = client
            .streamingRecognize(request)
            .on('error', (err) => {
                console.error('Google Speech Error:', err);
                reject(err);
            })
            .on('data', (data) => {
                const transcript = data.results[0].alternatives[0].transcript;
                resolve(transcript);
            });

        // Pipe S3 stream to Google Stream
        // s3Service.getFileStream(fileKey).pipe(recognizeStream);
        
        // Wait, 'fileKey' needs to be passed.
        // I'll update the signature to take fileKey/stream
    });
};

exports.transcribeFromStream = (audioStream) => {
    const request = {
        config: {
            encoding: 'WEBM_OPUS', // Typical web audio
            sampleRateHertz: 48000,
            languageCode: 'ml-IN', // Malaylam
            enableAutomaticPunctuation: true,    
        },
        interimResults: false,
    };

    let transcription = '';

    return new Promise((resolve, reject) => {
        const recognizeStream = client
            .streamingRecognize(request)
            .on('error', (err) => {
                console.error('Google Streaming Error:', err);
                reject(err);
            })
            .on('data', (data) => {
                if (data.results[0] && data.results[0].alternatives[0]) {
                     transcription += data.results[0].alternatives[0].transcript + ' ';
                }
            })
            .on('end', () => {
                resolve(transcription.trim());
            });

        audioStream.pipe(recognizeStream);
    });
};
