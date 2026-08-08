import { LLMClient } from '../agent/llmClient';

export interface BundleRequest {
  naturalLanguageQuery: string;
  maxBudget?: number;
  rentalDays?: number;
  customerSegment?: 'student' | 'professional' | 'hobbyist' | 'corporate';
}

export interface BundleItem {
  productName: string;
  category: string;
  dailyRate: number;
  totalCost: number;
  reason: string;
  essential: boolean;
}

export interface BundleRecommendation {
  queryUnderstood: string;
  bundle: BundleItem[];
  totalDailyRate: number;
  totalCost: number;
  rentalDays: number;
  savings: number;
  upsellSuggestions: UpsellItem[];
  confidence: number;
}

export interface UpsellItem {
  productName: string;
  reason: string;
  dailyRate: number;
  impact: string;
}

const CONCIERGE_PROMPT = `You are an expert rental equipment concierge. A customer has described what they need in natural language. Your job is to recommend a complete equipment bundle.

Think about:
1. The PRIMARY equipment needed for their described use case
2. ESSENTIAL accessories (batteries, cables, memory cards, tripods, etc.)
3. NICE-TO-HAVE upsells that would genuinely improve their experience
4. Budget awareness if they specified one

Respond in this exact JSON format:
{
  "queryUnderstood": "<your understanding of what they need, 1 sentence>",
  "bundle": [
    {
      "productName": "<specific product name>",
      "category": "<camera|lens|lighting|audio|drone|accessory|support|power|storage>",
      "dailyRate": <number in INR>,
      "reason": "<why this item is included>",
      "essential": <true/false>
    }
  ],
  "upsellSuggestions": [
    {
      "productName": "<product>",
      "reason": "<why it would help>",
      "dailyRate": <number>,
      "impact": "<what it improves>"
    }
  ],
  "confidence": <0.0-1.0 how confident you are in the recommendation>
}`;

export class SmartSearch {
  private llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    this.llmClient = llmClient || new LLMClient();
  }

  async recommend(request: BundleRequest): Promise<BundleRecommendation> {
    try {
      const context = this.buildContext(request);
      const messages: any[] = [
        { role: 'system', content: CONCIERGE_PROMPT },
        { role: 'user', content: context },
      ];

      const result = await this.llmClient.chat(messages);
      const rawText = typeof result === 'string' ? result : (result?.content || '');
      const parsed = this.parseResponse(rawText);
      return this.buildRecommendation(parsed, request);
    } catch (error: any) {
      console.error('SmartSearch error:', error.message);
      return this.fallbackRecommendation(request);
    }
  }

  private buildContext(request: BundleRequest): string {
    let context = `CUSTOMER REQUEST: "${request.naturalLanguageQuery}"`;
    if (request.maxBudget) context += `\nMAX BUDGET: ₹${request.maxBudget}`;
    if (request.rentalDays) context += `\nRENTAL DURATION: ${request.rentalDays} days`;
    if (request.customerSegment) context += `\nCUSTOMER TYPE: ${request.customerSegment}`;
    return context;
  }

  private parseResponse(raw: string): any {
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}
    return null;
  }

  private buildRecommendation(parsed: any, request: BundleRequest): BundleRecommendation {
    if (!parsed) return this.fallbackRecommendation(request);

    const days = request.rentalDays || 3;
    const bundle: BundleItem[] = (parsed.bundle || []).map((item: any) => ({
      productName: item.productName || 'Unknown',
      category: item.category || 'other',
      dailyRate: item.dailyRate || 0,
      totalCost: (item.dailyRate || 0) * days,
      reason: item.reason || '',
      essential: item.essential ?? true,
    }));

    const totalDailyRate = bundle.reduce((sum, b) => sum + b.dailyRate, 0);
    const totalCost = totalDailyRate * days;
    const bundleDiscount = bundle.length >= 4 ? 0.10 : bundle.length >= 3 ? 0.05 : 0;
    const savings = Math.round(totalCost * bundleDiscount);

    return {
      queryUnderstood: parsed.queryUnderstood || request.naturalLanguageQuery,
      bundle,
      totalDailyRate,
      totalCost: totalCost - savings,
      rentalDays: days,
      savings,
      upsellSuggestions: (parsed.upsellSuggestions || []).map((u: any) => ({
        productName: u.productName || 'Unknown',
        reason: u.reason || '',
        dailyRate: u.dailyRate || 0,
        impact: u.impact || '',
      })),
      confidence: parsed.confidence ?? 0.7,
    };
  }

  private fallbackRecommendation(request: BundleRequest): BundleRecommendation {
    const days = request.rentalDays || 3;
    return {
      queryUnderstood: request.naturalLanguageQuery,
      bundle: [
        { productName: 'Sony A7 IV (Body)', category: 'camera', dailyRate: 2500, totalCost: 2500 * days, reason: 'Versatile full-frame camera', essential: true },
        { productName: 'Sony FE 24-70mm f/2.8 GM', category: 'lens', dailyRate: 1500, totalCost: 1500 * days, reason: 'Standard zoom lens for most scenarios', essential: true },
        { productName: '128GB V90 SD Card', category: 'storage', dailyRate: 200, totalCost: 200 * days, reason: 'Fast storage for high-bitrate recording', essential: true },
        { productName: 'Extra NP-FZ100 Battery', category: 'power', dailyRate: 150, totalCost: 150 * days, reason: 'Backup battery for extended shoots', essential: true },
      ],
      totalDailyRate: 4350,
      totalCost: 4350 * days,
      rentalDays: days,
      savings: 0,
      upsellSuggestions: [
        { productName: 'Manfrotto 502AH Tripod', reason: 'Stable shots for video', dailyRate: 500, impact: 'Professional stability' },
        { productName: 'Godox SL-60W LED', reason: 'Key light for interviews', dailyRate: 400, impact: 'Better lighting' },
      ],
      confidence: 0.5,
    };
  }
}
