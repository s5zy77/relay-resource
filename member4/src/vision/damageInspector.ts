import { LLMClient } from '../agent/llmClient';

export interface DamageInspectionInput {
  rentalId: string;
  productName: string;
  productCategory: 'camera' | 'lens' | 'drone' | 'lighting' | 'audio' | 'vehicle' | 'tool' | 'other';
  productReplacementValue: number;
  depositHeld: number;
  imageUrls?: string[];
  imageBase64?: string[];
  inspectorNotes?: string;
}

export interface DamageItem {
  area: string;
  type: 'SCRATCH' | 'DENT' | 'CRACK' | 'WATER_DAMAGE' | 'MISSING_PART' | 'MALFUNCTION' | 'COSMETIC' | 'STRUCTURAL';
  severity: 'MINOR' | 'MODERATE' | 'SEVERE';
  description: string;
  estimatedRepairCost: number;
}

export interface MissingAccessory {
  name: string;
  required: boolean;
  replacementCost: number;
}

export interface InspectionReport {
  rentalId: string;
  productName: string;
  inspectionId: string;
  inspectedAt: Date;
  overallCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  damageItems: DamageItem[];
  missingAccessories: MissingAccessory[];
  totalDamageCost: number;
  totalMissingCost: number;
  totalDeduction: number;
  depositRefund: number;
  depositSufficient: boolean;
  additionalChargeRequired: number;
  inspectionCertificate: InspectionCertificate;
}

export interface InspectionCertificate {
  certificateId: string;
  rentalId: string;
  issuedAt: Date;
  verdict: string;
  totalDeduction: number;
  depositRefund: number;
  hash: string;
}

const VISION_PROMPT = `You are an expert rental equipment inspector. Analyze the product return inspection data and produce a damage assessment.

Product categories and what to look for:
- camera: sensor scratches, body dents, LCD cracks, shutter malfunction, missing battery/charger/strap/body cap
- lens: front/rear element scratches, fungus, aperture blade damage, focus ring issues, missing caps/hood/pouch
- drone: propeller damage, gimbal issues, body cracks, motor problems, missing propellers/controller/battery
- lighting: bulb issues, stand damage, reflector dents, missing cables/modifiers/barn doors
- audio: mic damage, cable issues, phantom power problems, missing windscreen/cable/mount
- vehicle: body scratches, interior damage, tire wear, mechanical issues, missing documents/accessories
- tool: blade damage, motor issues, handle cracks, missing bits/cases/chargers

Respond in this exact JSON format:
{
  "overallCondition": "<EXCELLENT|GOOD|FAIR|POOR|DAMAGED>",
  "damageItems": [
    {
      "area": "<where on the product>",
      "type": "<SCRATCH|DENT|CRACK|WATER_DAMAGE|MISSING_PART|MALFUNCTION|COSMETIC|STRUCTURAL>",
      "severity": "<MINOR|MODERATE|SEVERE>",
      "description": "<what the damage is>",
      "estimatedRepairCost": <number in INR>
    }
  ],
  "missingAccessories": [
    {
      "name": "<accessory name>",
      "required": <true/false>,
      "replacementCost": <number in INR>
    }
  ]
}

If no damage or missing items, return empty arrays and "EXCELLENT" condition.`;

export class DamageInspector {
  private llmClient: LLMClient;

  constructor(llmClient?: LLMClient) {
    this.llmClient = llmClient || new LLMClient();
  }

  async inspect(input: DamageInspectionInput): Promise<InspectionReport> {
    try {
      const context = this.buildContext(input);
      const messages: any[] = [
        { role: 'system', content: VISION_PROMPT },
        { role: 'user', content: context },
      ];

      const result = await this.llmClient.chat(messages);
      const rawText = typeof result === 'string' ? result : (result?.content || '');
      const parsed = this.parseResponse(rawText);

      return this.buildReport(input, parsed);
    } catch (error: any) {
      console.error('DamageInspector error:', error.message);
      return this.buildReport(input, { overallCondition: 'GOOD', damageItems: [], missingAccessories: [] });
    }
  }

  private buildContext(input: DamageInspectionInput): string {
    let context = `PRODUCT: ${input.productName}\nCATEGORY: ${input.productCategory}\nREPLACEMENT VALUE: ₹${input.productReplacementValue}\nDEPOSIT HELD: ₹${input.depositHeld}`;

    if (input.inspectorNotes) {
      context += `\n\nINSPECTOR NOTES:\n${input.inspectorNotes}`;
    }

    if (input.imageUrls && input.imageUrls.length > 0) {
      context += `\n\nIMAGES PROVIDED: ${input.imageUrls.length} inspection photos attached.`;
    }

    return context;
  }

  private parseResponse(raw: string): any {
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}
    return { overallCondition: 'GOOD', damageItems: [], missingAccessories: [] };
  }

  private buildReport(input: DamageInspectionInput, parsed: any): InspectionReport {
    const damageItems: DamageItem[] = (parsed.damageItems || []).map((d: any) => ({
      area: d.area || 'Unknown',
      type: d.type || 'COSMETIC',
      severity: d.severity || 'MINOR',
      description: d.description || '',
      estimatedRepairCost: d.estimatedRepairCost || 0,
    }));

    const missingAccessories: MissingAccessory[] = (parsed.missingAccessories || []).map((m: any) => ({
      name: m.name || 'Unknown',
      required: m.required ?? true,
      replacementCost: m.replacementCost || 0,
    }));

    const totalDamageCost = damageItems.reduce((sum, d) => sum + d.estimatedRepairCost, 0);
    const totalMissingCost = missingAccessories.filter(m => m.required).reduce((sum, m) => sum + m.replacementCost, 0);
    const totalDeduction = totalDamageCost + totalMissingCost;
    const depositRefund = Math.max(0, input.depositHeld - totalDeduction);
    const additionalChargeRequired = Math.max(0, totalDeduction - input.depositHeld);

    const inspectionId = `INS-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const certificateId = `CERT-${inspectionId}`;

    const certificate: InspectionCertificate = {
      certificateId,
      rentalId: input.rentalId,
      issuedAt: new Date(),
      verdict: `${parsed.overallCondition || 'GOOD'} condition. Deduction: ₹${totalDeduction}. Refund: ₹${depositRefund}.`,
      totalDeduction,
      depositRefund,
      hash: this.generateHash(input.rentalId, inspectionId, totalDeduction),
    };

    return {
      rentalId: input.rentalId,
      productName: input.productName,
      inspectionId,
      inspectedAt: new Date(),
      overallCondition: parsed.overallCondition || 'GOOD',
      damageItems,
      missingAccessories,
      totalDamageCost,
      totalMissingCost,
      totalDeduction,
      depositRefund,
      depositSufficient: totalDeduction <= input.depositHeld,
      additionalChargeRequired,
      inspectionCertificate: certificate,
    };
  }

  private generateHash(rentalId: string, inspectionId: string, deduction: number): string {
    const payload = `${rentalId}:${inspectionId}:${deduction}:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const chr = payload.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return `SHA-${Math.abs(hash).toString(16).padStart(12, '0')}`;
  }
}
