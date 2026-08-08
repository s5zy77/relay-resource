export interface RentalRiskInput {
  rentalId: string;
  customerId: string;
  productName: string;
  productReplacementValue: number;
  depositHeld: number;
  dailyRate: number;
  dueDate: string;
  returnedDate?: string;
  daysOverdue: number;
  previousRentalsCount: number;
  previousLateReturns: number;
  previousDamageIncidents: number;
  lastCallSentimentScore?: number;
  callAttempts: number;
  callsAnswered: number;
  hasActiveDispute: boolean;
}

export interface RiskAssessment {
  rentalId: string;
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  financialExposure: number;
  flags: RiskFlag[];
  recommendedActions: string[];
  breakdown: RiskBreakdown;
  assessedAt: Date;
}

export interface RiskFlag {
  code: string;
  severity: 'WARNING' | 'ALERT' | 'CRITICAL';
  description: string;
}

export interface RiskBreakdown {
  financialScore: number;
  overdueScore: number;
  customerReliabilityScore: number;
  communicationScore: number;
  sentimentScore: number;
}

export class RiskEngine {
  evaluate(input: RentalRiskInput): RiskAssessment {
    const breakdown = this.calculateBreakdown(input);
    const riskScore = this.computeComposite(breakdown);
    const riskLevel = this.classifyLevel(riskScore);
    const financialExposure = Math.max(0, input.productReplacementValue - input.depositHeld);
    const flags = this.generateFlags(input, riskScore, financialExposure);
    const recommendedActions = this.generateRecommendations(input, riskLevel, flags);

    return {
      rentalId: input.rentalId,
      riskScore: Math.round(riskScore),
      riskLevel,
      financialExposure,
      flags,
      recommendedActions,
      breakdown,
      assessedAt: new Date(),
    };
  }

  private calculateBreakdown(input: RentalRiskInput): RiskBreakdown {
    // Financial exposure score (0-100)
    const exposure = Math.max(0, input.productReplacementValue - input.depositHeld);
    const exposureRatio = exposure / Math.max(1, input.productReplacementValue);
    const financialScore = Math.round(exposureRatio * 60 + (exposure > 50000 ? 25 : exposure > 20000 ? 15 : 0));

    // Overdue score (0-100)
    let overdueScore = 0;
    if (input.daysOverdue > 0) {
      overdueScore = Math.min(100, 20 + input.daysOverdue * 10);
    }

    // Customer reliability score (0-100, higher = riskier)
    let customerReliabilityScore = 0;
    if (input.previousRentalsCount > 0) {
      const lateRatio = input.previousLateReturns / input.previousRentalsCount;
      const damageRatio = input.previousDamageIncidents / input.previousRentalsCount;
      customerReliabilityScore = Math.min(100, Math.round(lateRatio * 60 + damageRatio * 40));
    } else {
      customerReliabilityScore = 20; // Unknown customer = slight risk
    }

    // Communication score (0-100, higher = riskier)
    let communicationScore = 0;
    if (input.callAttempts > 0) {
      const answerRate = input.callsAnswered / input.callAttempts;
      communicationScore = Math.min(100, Math.round((1 - answerRate) * 80));
    }

    // Sentiment score (0-100, higher = riskier)
    let sentimentScore = 15; // Default neutral
    if (input.lastCallSentimentScore !== undefined) {
      sentimentScore = Math.round((1 - input.lastCallSentimentScore) * 50);
    }

    return {
      financialScore: Math.min(100, Math.max(0, financialScore)),
      overdueScore: Math.min(100, Math.max(0, overdueScore)),
      customerReliabilityScore: Math.min(100, Math.max(0, customerReliabilityScore)),
      communicationScore: Math.min(100, Math.max(0, communicationScore)),
      sentimentScore: Math.min(100, Math.max(0, sentimentScore)),
    };
  }

  private computeComposite(bd: RiskBreakdown): number {
    const weights = {
      financial: 0.30,
      overdue: 0.35,
      reliability: 0.15,
      communication: 0.10,
      sentiment: 0.10,
    };
    return (
      bd.financialScore * weights.financial +
      bd.overdueScore * weights.overdue +
      bd.customerReliabilityScore * weights.reliability +
      bd.communicationScore * weights.communication +
      bd.sentimentScore * weights.sentiment
    );
  }

  private classifyLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 65) return 'CRITICAL';
    if (score >= 45) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }

  private generateFlags(input: RentalRiskInput, riskScore: number, exposure: number): RiskFlag[] {
    const flags: RiskFlag[] = [];

    if (exposure > 30000) {
      flags.push({ code: 'HIGH_LOSS_EXPOSURE', severity: 'CRITICAL', description: `Financial exposure of ₹${exposure} exceeds safety threshold` });
    } else if (exposure > 10000) {
      flags.push({ code: 'MODERATE_LOSS_EXPOSURE', severity: 'ALERT', description: `Financial exposure of ₹${exposure}` });
    }

    if (input.daysOverdue > 7) {
      flags.push({ code: 'SEVERELY_OVERDUE', severity: 'CRITICAL', description: `Item is ${input.daysOverdue} days overdue` });
    } else if (input.daysOverdue > 3) {
      flags.push({ code: 'OVERDUE', severity: 'ALERT', description: `Item is ${input.daysOverdue} days overdue` });
    }

    if (input.callAttempts >= 3 && input.callsAnswered === 0) {
      flags.push({ code: 'UNRESPONSIVE_CUSTOMER', severity: 'CRITICAL', description: `Customer has not answered ${input.callAttempts} call attempts` });
    }

    if (input.lastCallSentimentScore !== undefined && input.lastCallSentimentScore < -0.5) {
      flags.push({ code: 'HOSTILE_CUSTOMER', severity: 'ALERT', description: 'Customer showed hostile sentiment in last call' });
    }

    if (input.hasActiveDispute) {
      flags.push({ code: 'ACTIVE_DISPUTE', severity: 'WARNING', description: 'Customer has filed a dispute on this rental' });
    }

    if (input.previousDamageIncidents > 1) {
      flags.push({ code: 'DAMAGE_HISTORY', severity: 'WARNING', description: `Customer has ${input.previousDamageIncidents} previous damage incidents` });
    }

    return flags;
  }

  private generateRecommendations(input: RentalRiskInput, level: string, flags: RiskFlag[]): string[] {
    const actions: string[] = [];
    const flagCodes = flags.map(f => f.code);

    if (level === 'CRITICAL') {
      actions.push('ESCALATE: Assign to senior operations manager immediately');
      if (flagCodes.includes('UNRESPONSIVE_CUSTOMER')) {
        actions.push('LEGAL: Prepare formal recovery notice');
      }
      if (flagCodes.includes('HIGH_LOSS_EXPOSURE')) {
        actions.push('FINANCE: Flag for potential write-off review');
      }
    }

    if (level === 'HIGH' || level === 'CRITICAL') {
      actions.push('OUTREACH: Schedule priority follow-up call within 24 hours');
      if (input.daysOverdue > 3) {
        actions.push('BILLING: Apply escalated late fee structure');
      }
    }

    if (level === 'MEDIUM') {
      actions.push('MONITOR: Add to daily operations watchlist');
      actions.push('OUTREACH: Schedule automated reminder call');
    }

    if (flagCodes.includes('ACTIVE_DISPUTE')) {
      actions.push('SUPPORT: Route to dispute resolution team');
    }

    if (flagCodes.includes('DAMAGE_HISTORY')) {
      actions.push('INSPECTION: Flag for detailed return inspection');
    }

    return actions;
  }

  evaluateBatch(inputs: RentalRiskInput[]): RiskAssessment[] {
    return inputs
      .map(input => this.evaluate(input))
      .sort((a, b) => b.riskScore - a.riskScore);
  }
}
