import { EventEmitter } from 'eventemitter3';
import { SpeechToText } from './stt';
import { TextToSpeech } from './tts';
import { AgentOrchestrator } from '../agent/orchestrator';
import { TranscriptLogger } from './transcription';

export class ConversationLoop extends EventEmitter {
  private stt: SpeechToText;
  private tts: TextToSpeech;
  private orchestrator: AgentOrchestrator;
  public sessionId: string;
  private logger: TranscriptLogger;
  private isRunning: boolean = false;

  constructor(stt: SpeechToText, tts: TextToSpeech, orchestrator: AgentOrchestrator, sessionId: string) {
    super();
    this.stt = stt;
    this.tts = tts;
    this.orchestrator = orchestrator;
    this.sessionId = sessionId;
    this.logger = new TranscriptLogger();
  }

  async start(initialContext?: string): Promise<void> {
    this.isRunning = true;
    this.emit('turn_start');
    
    if (initialContext) {
      // In outbound, AI speaks first based on context
      const result = await this.orchestrator.processUserMessage(this.sessionId, initialContext);
      const response = result.response;
      this.logger.logUtterance('AI', response);
      this.emit('ai_response', response);
      
      const audio = await this.tts.synthesize(response);
      this.emit('turn_end', audio);
    }
  }

  async processAudioInput(audioBuffer: Buffer): Promise<Buffer> {
    if (!this.isRunning) throw new Error('Loop is stopped');
    
    this.emit('turn_start');
    try {
      const text = await this.stt.transcribe(audioBuffer);
      this.logger.logUtterance('CUSTOMER', text);
      this.emit('transcription', text);

      const result = await this.orchestrator.processUserMessage(this.sessionId, text);
      const responseText = result.response;
      this.logger.logUtterance('AI', responseText);
      this.emit('ai_response', responseText);

      const responseAudio = await this.tts.synthesize(responseText);
      this.emit('turn_end');
      return responseAudio;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async processTextInput(text: string): Promise<string> {
    if (!this.isRunning) throw new Error('Loop is stopped');
    this.emit('turn_start');
    try {
      this.logger.logUtterance('CUSTOMER', text);
      const result = await this.orchestrator.processUserMessage(this.sessionId, text);
      const response = result.response;
      this.logger.logUtterance('AI', response);
      this.emit('turn_end');
      return response;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  stop(): void {
    this.isRunning = false;
    this.emit('call_end');
  }
  
  getTranscriptLogger(): TranscriptLogger {
    return this.logger;
  }
}
