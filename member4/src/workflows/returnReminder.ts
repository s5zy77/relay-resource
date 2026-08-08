import member3Client from '../integrations/member3Client';
import { TelephonyBridge } from '../voice/telephonyBridge';
import { ConversationLoop } from '../voice/conversationLoop';
import { SpeechToText } from '../voice/stt';
import { TextToSpeech } from '../voice/tts';
import { AgentOrchestrator } from '../agent/orchestrator';
import { LLMClient } from '../agent/llmClient';
import toolRegistry from '../tools/registry';
import { SessionMemory } from '../memory/sessionMemory';
import { CallbackHandler } from '../integrations/callbackHandler';
import { RETURN_REMINDER_CONTEXT } from '../prompts/scenarioPrompts';

export interface WorkflowResult {
  success: boolean;
  callId?: string;
  duration?: number;
  transcript?: any;
  summary?: string;
  actionsExecuted?: string[];
  errors?: string[];
}

export class ReturnReminderWorkflow {
  private bridge = new TelephonyBridge();
  private callbackHandler = new CallbackHandler();

  async execute(rentalId: string, phoneNumber: string): Promise<WorkflowResult> {
    try {
      const rentalDetails: any = await member3Client.getRental(rentalId);
      this.bridge.validateDestination(phoneNumber);
      
      const session = await this.bridge.initiateCall(phoneNumber, 'http://localhost/webhook');
      
      const stt = new SpeechToText();
      const tts = new TextToSpeech();
      const llmClient = new LLMClient();
      const memory = new SessionMemory();
      const orchestrator = new AgentOrchestrator(llmClient, toolRegistry as any, memory);
      
      const loop = new ConversationLoop(stt, tts, orchestrator, session.callId);
      const context = RETURN_REMINDER_CONTEXT(rentalDetails);
      
      await loop.start(context);
      
      await this.bridge.endCall(session.callId);
      loop.stop();

      const logger = loop.getTranscriptLogger();
      
      const postResult = this.callbackHandler.buildPostCallResult(
        { callId: session.callId, rentalId, customerId: rentalDetails.customerId },
        logger.toJSON(),
        []
      );
      
      await this.callbackHandler.submitCallResult(session.callId, postResult);

      return {
        success: true,
        callId: session.callId,
        transcript: logger.toJSON(),
        summary: postResult.summary,
        actionsExecuted: postResult.actions
      };
    } catch (err: any) {
      return { success: false, errors: [err.message] };
    }
  }
}
