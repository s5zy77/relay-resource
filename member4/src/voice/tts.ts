import axios from 'axios';
import { EventEmitter } from 'eventemitter3';
import { CONFIG } from '../../config/env';

export interface TTSStream extends EventEmitter {
  on(event: 'data', listener: (chunk: Buffer) => void): this;
  on(event: 'end', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
}

export class TextToSpeech {
  async synthesize(text: string, voice?: string): Promise<Buffer> {
    try {
      if (CONFIG.TTS_PROVIDER === 'piper-local') {
        const response = await axios.post('http://localhost:9001/synthesize', { text, voice }, {
          responseType: 'arraybuffer'
        });
        return Buffer.from(response.data);
      } else if (CONFIG.TTS_PROVIDER === 'elevenlabs') {
        if (!CONFIG.ELEVENLABS_API_KEY) {
          throw new Error('ELEVENLABS_API_KEY is required for ElevenLabs TTS');
        }
        const voiceId = voice || '21m00Tcm4TlvDq8ikWAM';
        const response = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          { text },
          {
            headers: {
              'xi-api-key': CONFIG.ELEVENLABS_API_KEY,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
          }
        );
        return Buffer.from(response.data);
      } else if (CONFIG.TTS_PROVIDER === 'web-speech') {
        console.warn('web-speech runs client-side. Returning empty buffer.');
        return Buffer.alloc(0);
      } else {
        throw new Error(`Unsupported TTS_PROVIDER: ${CONFIG.TTS_PROVIDER}`);
      }
    } catch (error) {
      console.error('Error during TTS synthesis:', error);
      throw error;
    }
  }

  createStream(text: string): TTSStream {
    const stream = new EventEmitter() as TTSStream;
    
    // Simulate streaming by synthesizing the whole text and emitting in chunks
    this.synthesize(text).then(buffer => {
      const chunkSize = 4096;
      for (let i = 0; i < buffer.length; i += chunkSize) {
        stream.emit('data', buffer.subarray(i, Math.min(i + chunkSize, buffer.length)));
      }
      stream.emit('end');
    }).catch(err => {
      stream.emit('error', err);
    });

    return stream;
  }
}
