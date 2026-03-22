const WebSocket = require('ws');
const speech = require('@google-cloud/speech');

function initializeWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/api/kudumbashree/meeting/livestream' });
  const speechClient = new speech.SpeechClient(); // Will use GOOGLE_APPLICATION_CREDENTIALS from env

  wss.on('connection', (ws) => {
    console.log('Client connected to Live Speech translation');
    
    let recognizeStream = null;

    ws.on('message', (message) => {
        // If message is a string, it might be a JSON command (like "start" or "stop")
        if (typeof message === 'string') {
            try {
                const data = JSON.parse(message);
                if (data.action === 'start') {
                    console.log('Starting Google Cloud Speech recognition stream');
                    if (recognizeStream) {
                        recognizeStream.end();
                    }
                    
                    const request = {
                        config: {
                          encoding: data.encoding || 'WEBM_OPUS', // Default encoding from MediaRecorder
                          sampleRateHertz: data.sampleRate || 48000,
                          languageCode: 'ml-IN',
                          enableAutomaticPunctuation: true,
                        },
                        interimResults: true, // Get live streaming results
                    };
                    
                    recognizeStream = speechClient
                        .streamingRecognize(request)
                        .on('error', (err) => {
                           console.error('Google Speech API Error:', err);
                           ws.send(JSON.stringify({ error: err.message || 'API Error' }));
                        })
                        .on('data', data => {
                            if (data.results[0] && data.results[0].alternatives[0]) {
                                const transcriptData = {
                                    transcript: data.results[0].alternatives[0].transcript,
                                    isFinal: data.results[0].isFinal
                                };
                                ws.send(JSON.stringify(transcriptData));
                            }
                        });
                } else if (data.action === 'stop') {
                    console.log('Stopping Google Cloud Speech recognition stream');
                    if (recognizeStream) {
                        recognizeStream.end();
                        recognizeStream = null;
                    }
                }
            } catch (error) {
                console.error('Websocket message parsing error:', error);
            }
        } else if (Buffer.isBuffer(message)) {
            // Audio data stream
            if (recognizeStream) {
                recognizeStream.write(message);
            }
        }
    });

    ws.on('close', () => {
      console.log('Client disconnected from Live Speech translation');
      if (recognizeStream) {
          recognizeStream.end();
          recognizeStream = null;
      }
    });
    
    ws.on('error', (err) => {
        console.error('WebSocket Error:', err);
        if (recognizeStream) {
            recognizeStream.end();
            recognizeStream = null;
        }
    });
  });

  return wss;
}

module.exports = initializeWebSocket;
