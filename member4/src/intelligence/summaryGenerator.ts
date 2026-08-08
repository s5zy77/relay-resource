import { LLMClient } from '../agent/llmClient';

export interface CallSummary {
  callId: string;
  duration: string;
  scenario: string;
  executiveSummary: string;
  keyPoints: string[];
  customerMood: string;
  actionsTaken: string[];
  followUpRequired: boolean;
  followUpActions: string[];
  riskFlags: string[];
  timestamp: Date;
}

const SUMMARY_PROMPT = `You are a rental operations manager reviewing an AI-assisted call. Produce a concise executive summary.

Respond in this exact JSON format:
{
  "executiveSummary": "<2-3 sentence summary of the entire call>",
  "keyPoints": ["<point1>", "<point2>"],
  "customerMood": "<one word: Cooperative/Frustrated/Anxious/Hostile/Neutral>",
  "actionsTaken": ["<action1>", "<action2>"],
  "followUpRequired": <true/false>,
  "followUpActions": ["<action if followup needed>"],
  "riskFlags": ["<any risk flags identified>"]
}`;

export class SummaryGenerator {
  private llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    this.llmClient = llmClient || new LLMClient();
  }

  async generate(callId: string, scenario: string, transcript: string, toolCalls?: string[]): Promise<CallSummary> {
    try {
      const context = `CALL ID: ${callId}\nSCENARIO: ${scenario}\nTOOL CALLS: ${(toolCalls || []).join(', ')}\n\nTRANSCRIPT:\n${transcript}`;

      const messages: any[] = [
        { role: 'system', content: SUMMARY_PROMPT },
        { role: 'user', content: context },
      ];

      const result = await this.llmClient.chat(messages);
      const rawText = typeof result === 'string' ? result : (result?.content || '');
      const parsed = this.parseResponse(rawText);

      return {
        callId,
        duration: this.estimateDuration(transcript),
        scenario,
        executiveSummary: parsed.executiveSummary || 'Call completed.',
        keyPoints: parsed.keyPoints || [],
        customerMood: parsed.customerMood || 'Neutral',
        actionsTaken: parsed.actionsTaken || toolCalls || [],
        followUpRequired: parsed.followUpRequired ?? false,
        followUpActions: parsed.followUpActions || [],
        riskFlags: parsed.riskFlags || [],
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error('SummaryGenerator error:', error.message);
      return this.fallbackSummary(callId, scenario, transcript, toolCalls);
    }
  }

  private parseResponse(raw: string): any {
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}
    return { executiveSummary: raw };
  }

  private estimateDuration(transcript: string): string {
    const lines = transcript.split('\n').filter(l => l.trim()).length;
    const estimatedSeconds = lines * 8;
    const minutes = Math.floor(estimatedSeconds / 60);
    const seconds = estimatedSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }

  private fallbackSummary(callId: string, scenario: string, transcript: string, toolCalls?: string[]): CallSummary {
    const lineCount = transcript.split('\n').filter(l => l.trim()).length;
    return {
      callId,
      duration: this.estimateDuration(transcript),
      scenario,
      executiveSummary: `Automated ${scenario} call completed with ${lineCount} conversation turns. ${(toolCalls || []).length} tool actions were executed.`,
      keyPoints: [`Call type: ${scenario}`, `Total turns: ${lineCount}`],
      customerMood: 'Neutral',
      actionsTaken: toolCalls || [],
      followUpRequired: false,
      followUpActions: [],
      riskFlags: [],
      timestamp: new Date(),
    };
  }
}
