import member3Client from './member3Client';

export interface PostCallResult {
  callId: string;
  rentalId: string;
  customerId: string;
  intent: string;
  outcome: string;
  sentiment: string;
  commitment?: string;
  actions: string[];
  transcript: any;
  summary: string;
  followUp: boolean;
  timestamp: Date;
}

export class CallbackHandler {
  async submitCallResult(callId: string, result: PostCallResult): Promise<void> {
    try {
      await member3Client.submitCallResult(callId, result);
      console.log(`Successfully submitted call result for call ${callId}`);
    } catch (error) {
      console.error(`Failed to submit call result for call ${callId}`, error);
      throw error;
    }
  }

  buildPostCallResult(session: any, transcript: any, toolCalls: any[]): PostCallResult {
    // Basic extraction logic; in a real app, an LLM might summarize this
    return {
      callId: session.callId,
      rentalId: session.rentalId,
      customerId: session.customerId,
      intent: 'unknown',
      outcome: 'completed',
      sentiment: 'neutral',
      actions: toolCalls.map(tc => tc.name),
      transcript: transcript,
      summary: 'Automated summary of call.',
      followUp: false,
      timestamp: new Date()
    };
  }
}
