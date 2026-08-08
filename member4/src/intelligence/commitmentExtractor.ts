import { LLMClient } from '../agent/llmClient';

export interface Commitment {
  type: 'RETURN_DATE' | 'PAYMENT' | 'EXTENSION_REQUEST' | 'PICKUP_CONFIRMATION' | 'DISPUTE' | 'CALLBACK_REQUEST' | 'OTHER';
  description: string;
  extractedValue?: string;
  confidence: number;
  utterance: string;
}

export interface CommitmentExtractionResult {
  commitments: Commitment[];
  hasActionableCommitments: boolean;
  summary: string;
  rawTranscript: string;
}

const EXTRACTION_PROMPT = `You are a rental operations analyst. Analyze the following call transcript between an AI agent and a customer.

Extract ALL customer commitments, promises, and actionable statements.

For each commitment found, classify it as one of:
- RETURN_DATE: Customer promised to return item by a specific date/time
- PAYMENT: Customer promised to pay a fee or outstanding amount
- EXTENSION_REQUEST: Customer requested to extend the rental period
- PICKUP_CONFIRMATION: Customer confirmed they will pick up item
- DISPUTE: Customer disputed a charge or raised a complaint
- CALLBACK_REQUEST: Customer requested to be called back later
- OTHER: Any other actionable commitment

Respond in this exact JSON format:
{
  "commitments": [
    {
      "type": "<type>",
      "description": "<what the customer committed to>",
      "extractedValue": "<specific date, amount, or detail if mentioned>",
      "confidence": <0.0-1.0>,
      "utterance": "<exact quote from transcript>"
    }
  ],
  "summary": "<one paragraph executive summary of the call outcome>"
}

If no commitments found, return empty commitments array.`;

export class CommitmentExtractor {
  private llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    this.llmClient = llmClient || new LLMClient();
  }

  async extract(transcript: string): Promise<CommitmentExtractionResult> {
    try {
      const messages: any[] = [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: `TRANSCRIPT:\n${transcript}` }
      ];

      const result = await this.llmClient.chat(messages);
      const rawText = typeof result === 'string' ? result : (result?.content || '');
      const parsed = this.parseResponse(rawText);

      return {
        commitments: parsed.commitments || [],
        hasActionableCommitments: (parsed.commitments || []).length > 0,
        summary: parsed.summary || 'No summary available.',
        rawTranscript: transcript,
      };
    } catch (error: any) {
      console.error('CommitmentExtractor error:', error.message);
      return this.fallbackExtraction(transcript);
    }
  }

  private parseResponse(raw: string): any {
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}
    return { commitments: [], summary: raw };
  }

  private fallbackExtraction(transcript: string): CommitmentExtractionResult {
    const commitments: Commitment[] = [];
    const lower = transcript.toLowerCase();

    const returnPatterns = [
      /i(?:'ll| will) (?:return|bring back|drop off).*?(?:by|on|before|tomorrow|today|tonight)/gi,
      /(?:return|bring).*?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
    ];
    for (const pattern of returnPatterns) {
      const match = lower.match(pattern);
      if (match) {
        commitments.push({
          type: 'RETURN_DATE',
          description: 'Customer indicated return intent',
          extractedValue: match[0],
          confidence: 0.6,
          utterance: match[0],
        });
      }
    }

    const paymentPatterns = [
      /i(?:'ll| will) pay/gi,
      /(?:pay|transfer|send).*?(?:today|tomorrow|now|tonight)/gi,
    ];
    for (const pattern of paymentPatterns) {
      const match = lower.match(pattern);
      if (match) {
        commitments.push({
          type: 'PAYMENT',
          description: 'Customer indicated payment intent',
          extractedValue: match[0],
          confidence: 0.6,
          utterance: match[0],
        });
      }
    }

    if (/extend|extension|more time|extra day/i.test(lower)) {
      commitments.push({
        type: 'EXTENSION_REQUEST',
        description: 'Customer requested rental extension',
        confidence: 0.7,
        utterance: 'extension request detected via keyword',
      });
    }

    if (/dispute|wrong|incorrect|unfair|overcharged/i.test(lower)) {
      commitments.push({
        type: 'DISPUTE',
        description: 'Customer raised a dispute',
        confidence: 0.7,
        utterance: 'dispute detected via keyword',
      });
    }

    return {
      commitments,
      hasActionableCommitments: commitments.length > 0,
      summary: `Fallback extraction found ${commitments.length} commitment(s).`,
      rawTranscript: transcript,
    };
  }
}
