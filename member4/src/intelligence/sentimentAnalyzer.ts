import { LLMClient } from '../agent/llmClient';

export type SentimentLabel = 'CALM' | 'COOPERATIVE' | 'ANXIOUS' | 'FRUSTRATED' | 'HOSTILE' | 'NEUTRAL';

export interface SentimentResult {
  overall: SentimentLabel;
  score: number; // -1.0 (hostile) to 1.0 (cooperative)
  escalationUrgency: number; // 0-10
  shouldEscalateToHuman: boolean;
  turnBySentiment: TurnSentiment[];
  reasoning: string;
}

export interface TurnSentiment {
  speaker: string;
  text: string;
  sentiment: SentimentLabel;
  score: number;
}

const SENTIMENT_PROMPT = `You are a customer service sentiment analyst for a rental operations company.

Analyze the following call transcript and evaluate the customer's sentiment throughout the call.

Respond in this exact JSON format:
{
  "overall": "<CALM|COOPERATIVE|ANXIOUS|FRUSTRATED|HOSTILE|NEUTRAL>",
  "score": <-1.0 to 1.0, where -1=hostile, 0=neutral, 1=cooperative>,
  "escalationUrgency": <0-10, where 0=no escalation, 10=immediate human intervention>,
  "shouldEscalateToHuman": <true/false>,
  "reasoning": "<brief explanation of sentiment assessment>"
}`;

export class SentimentAnalyzer {
  private llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    this.llmClient = llmClient || new LLMClient();
  }

  async analyze(transcript: string): Promise<SentimentResult> {
    try {
      const messages: any[] = [
        { role: 'system', content: SENTIMENT_PROMPT },
        { role: 'user', content: `TRANSCRIPT:\n${transcript}` },
      ];

      const result = await this.llmClient.chat(messages);
      const rawText = typeof result === 'string' ? result : (result?.content || '');
      const parsed = this.parseLLMResponse(rawText);
      const turnBySentiment = this.analyzeTurns(transcript);

      return {
        overall: parsed.overall || 'NEUTRAL',
        score: parsed.score ?? 0,
        escalationUrgency: parsed.escalationUrgency ?? 0,
        shouldEscalateToHuman: parsed.shouldEscalateToHuman ?? false,
        turnBySentiment,
        reasoning: parsed.reasoning || 'No reasoning provided.',
      };
    } catch (error: any) {
      console.error('SentimentAnalyzer error:', error.message);
      return this.fallbackAnalysis(transcript);
    }
  }

  private parseLLMResponse(raw: string): any {
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}
    return {};
  }

  private analyzeTurns(transcript: string): TurnSentiment[] {
    const lines = transcript.split('\n').filter(l => l.trim());
    return lines.map(line => {
      const speakerMatch = line.match(/^\[?(CUSTOMER|AI|AGENT)\]?:?\s*/i);
      const speaker = speakerMatch ? speakerMatch[1].toUpperCase() : 'UNKNOWN';
      const text = speakerMatch ? line.slice(speakerMatch[0].length) : line;
      const { sentiment, score } = this.keywordSentiment(text);
      return { speaker, text, sentiment, score };
    });
  }

  private keywordSentiment(text: string): { sentiment: SentimentLabel; score: number } {
    const lower = text.toLowerCase();
    const hostileWords = ['angry', 'furious', 'ridiculous', 'scam', 'lawsuit', 'terrible', 'worst', 'horrible', 'unacceptable', 'threatening'];
    const frustratedWords = ['frustrated', 'annoyed', 'disappointed', 'unfair', 'wrong', 'problem', 'issue', 'complaint'];
    const anxiousWords = ['worried', 'concerned', 'nervous', 'afraid', 'urgent', 'scared', 'panic'];
    const cooperativeWords = ['thank', 'thanks', 'appreciate', 'great', 'perfect', 'sure', 'absolutely', 'happy', 'wonderful', 'agree'];

    const hostileCount = hostileWords.filter(w => lower.includes(w)).length;
    const frustratedCount = frustratedWords.filter(w => lower.includes(w)).length;
    const anxiousCount = anxiousWords.filter(w => lower.includes(w)).length;
    const cooperativeCount = cooperativeWords.filter(w => lower.includes(w)).length;

    if (hostileCount >= 2) return { sentiment: 'HOSTILE', score: -0.9 };
    if (hostileCount >= 1) return { sentiment: 'HOSTILE', score: -0.7 };
    if (frustratedCount >= 2) return { sentiment: 'FRUSTRATED', score: -0.5 };
    if (frustratedCount >= 1) return { sentiment: 'FRUSTRATED', score: -0.3 };
    if (anxiousCount >= 1) return { sentiment: 'ANXIOUS', score: -0.1 };
    if (cooperativeCount >= 2) return { sentiment: 'COOPERATIVE', score: 0.8 };
    if (cooperativeCount >= 1) return { sentiment: 'CALM', score: 0.5 };
    return { sentiment: 'NEUTRAL', score: 0 };
  }

  private fallbackAnalysis(transcript: string): SentimentResult {
    const turns = this.analyzeTurns(transcript);
    const customerTurns = turns.filter(t => t.speaker === 'CUSTOMER');
    const avgScore = customerTurns.length > 0
      ? customerTurns.reduce((sum, t) => sum + t.score, 0) / customerTurns.length
      : 0;

    let overall: SentimentLabel = 'NEUTRAL';
    if (avgScore >= 0.5) overall = 'COOPERATIVE';
    else if (avgScore >= 0.2) overall = 'CALM';
    else if (avgScore >= -0.2) overall = 'NEUTRAL';
    else if (avgScore >= -0.5) overall = 'FRUSTRATED';
    else overall = 'HOSTILE';

    const escalationUrgency = Math.max(0, Math.min(10, Math.round((1 - avgScore) * 5)));

    return {
      overall,
      score: Math.round(avgScore * 100) / 100,
      escalationUrgency,
      shouldEscalateToHuman: escalationUrgency >= 7,
      turnBySentiment: turns,
      reasoning: `Fallback keyword analysis. Average customer sentiment score: ${avgScore.toFixed(2)}.`,
    };
  }
}
