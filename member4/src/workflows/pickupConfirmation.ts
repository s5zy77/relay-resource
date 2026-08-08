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
import { PICKUP_CONFIRMATION_CONTEXT } from '../prompts/scenarioPrompts';

export class PickupConfirmationWorkflow {
  private bridge = new TelephonyBridge();
  private callbackHandler = new CallbackHandler();

  async execute(rentalId: string, phoneNumber: string): Promise<any> {
    try {
      const pickupInfo: any = await member3Client.getPickupInformation(rentalId);
      
      this.bridge.validateDestination(phoneNumber);
      const session = await this.bridge.initiateCall(phoneNumber, 'http://localhost/webhook');
      
      const stt = new SpeechToText();
      const tts = new TextToSpeech();
      const llmClient = new LLMClient();
      const memory = new SessionMemory();
      const orchestrator = new AgentOrchestrator(llmClient, toolRegistry as any, memory);
      
      const loop = new ConversationLoop(stt, tts, orchestrator, session.callId);
      const context = PICKUP_CONFIRMATION_CONTEXT(pickupInfo);
      
      await loop.start(context);
      
      await this.bridge.endCall(session.callId);
      loop.stop();

      const logger = loop.getTranscriptLogger();
      const postResult = this.callbackHandler.buildPostCallResult(
        { callId: session.callId, rentalId, customerId: pickupInfo.customerId },
        logger.toJSON(),
        []
      );
      await this.callbackHandler.submitCallResult(session.callId, postResult);

      return { success: true, callId: session.callId, summary: postResult.summary };
    } catch (err: any) {
      return { success: false, errors: [err.message] };
    }
  }
}
