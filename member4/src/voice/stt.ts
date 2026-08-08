import axios from 'axios';
import { EventEmitter } from 'eventemitter3';
import { CONFIG } from '../../config/env';

export interface TranscriptionStream extends EventEmitter {
  write(chunk: Buffer): void;
  end(): void;
}

export class SpeechToText {
  async transcribe(audioBuffer: Buffer, language?: string): Promise<string> {
    try {
      if (CONFIG.STT_PROVIDER === 'whisper-local') {
        const response = await axios.post('http://localhost:9000/transcribe', audioBuffer, {
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          params: { language },
        });
        return response.data.text || '';
      } else if (CONFIG.STT_PROVIDER === 'web-speech') {
        console.warn('web-speech API runs client-side. This is a server stub.');
        return '[Web Speech client-side transcription placeholder]';
      } else {
        throw new Error(`Unsupported STT_PROVIDER: ${CONFIG.STT_PROVIDER}`);
      }
    } catch (error) {
      console.error('Error during transcription:', error);
      throw error;
    }
  }

  createStream(): TranscriptionStream {
    const stream = new EventEmitter() as TranscriptionStream;
    let buffer = Buffer.alloc(0);

    stream.write = (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);
      // In a real implementation, we would send chunks to a streaming API
      stream.emit('partial', '[Processing audio chunk...]');
    };

    stream.end = async () => {
      try {
        const text = await this.transcribe(buffer);
        stream.emit('final', text);
      } catch (err) {
        stream.emit('error', err);
      }
    };

    return stream;
  }
}
