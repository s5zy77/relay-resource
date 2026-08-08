import Rental from '../models/rentalModel';
import AuditLog from '../models/auditLogModel';

/**
 * Risk Assessment Engine
 * 
 * Evaluates customer risk based on rental history,
 * payment behavior, and damage patterns. Used by the
 * AI agent to make informed decisions about approvals,
 * deposit adjustments, and proactive outreach.
 */

export interface RiskProfile {
  customerId: string;
  overallScore: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  numericScore: number; // 0–100, lower is better
  factors: RiskFactor[];
  recommendation: string;
  depositMultiplier: number;
}

interface RiskFactor {
  name: string;
  impact: number; // Points added to risk score
  detail: string;
}

export const assessCustomerRisk = async (customerId: string): Promise<RiskProfile> => {
  const factors: RiskFactor[] = [];
  let score = 0;

  // 1. Rental history analysis
  const allRentals = await Rental.find({ customer: customerId });
  const totalRentals = allRentals.length;

  if (totalRentals === 0) {
    // New customer — slight unknown risk
    factors.push({
      name: 'NEW_CUSTOMER',
      impact: 15,
      detail: 'No rental history available',
    });
    score += 15;
  }

  // 2. Overdue frequency
  const overdueRentals = allRentals.filter(r => r.status === 'OVERDUE');
  const overdueRate = totalRentals > 0 ? overdueRentals.length / totalRentals : 0;

  if (overdueRate > 0.3) {
    factors.push({
      name: 'HIGH_OVERDUE_RATE',
      impact: 35,
      detail: `${Math.round(overdueRate * 100)}% of rentals were/are overdue`,
    });
    score += 35;
  } else if (overdueRate > 0.1) {
    factors.push({
      name: 'MODERATE_OVERDUE_RATE',
      impact: 15,
      detail: `${Math.round(overdueRate * 100)}% of rentals were/are overdue`,
    });
    score += 15;
  }

  // 3. Outstanding late fees
  const totalLateFees = allRentals.reduce((sum, r) => sum + (r.lateFee || 0), 0);
  if (totalLateFees > 5000) {
    factors.push({
      name: 'HIGH_OUTSTANDING_FEES',
      impact: 25,
      detail: `₹${totalLateFees} in accumulated late fees`,
    });
    score += 25;
  } else if (totalLateFees > 1000) {
    factors.push({
      name: 'MODERATE_OUTSTANDING_FEES',
      impact: 10,
      detail: `₹${totalLateFees} in accumulated late fees`,
    });
    score += 10;
  }

  // 4. Damage history (check audit logs for damage inspections)
  const damageAudits = await AuditLog.find({
    action: 'RECORDED_INSPECTION',
    'metadata.damageDetected': true,
    // We don't filter by customer directly, we check via entity
  });

  // Cross-reference damage audits with this customer's rentals
  const rentalIds = allRentals.map(r => r._id.toString());
  const customerDamageCount = damageAudits.filter(a =>
    rentalIds.includes(a.entityId.toString())
  ).length;

  if (customerDamageCount >= 2) {
    factors.push({
      name: 'REPEAT_DAMAGE',
      impact: 30,
      detail: `${customerDamageCount} rentals had damage reported`,
    });
    score += 30;
  } else if (customerDamageCount === 1) {
    factors.push({
      name: 'SINGLE_DAMAGE',
      impact: 10,
      detail: '1 rental had damage reported',
    });
    score += 10;
  }

  // 5. Good behavior bonus
  const completedOnTime = allRentals.filter(r => r.status === 'COMPLETED').length;
  if (completedOnTime >= 5 && overdueRate === 0) {
    factors.push({
      name: 'EXCELLENT_HISTORY',
      impact: -15,
      detail: `${completedOnTime} rentals completed on time with zero overdue`,
    });
    score -= 15;
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine tier
  let overallScore: RiskProfile['overallScore'];
  let depositMultiplier: number;
  let recommendation: string;

  if (score >= 70) {
    overallScore = 'CRITICAL';
    depositMultiplier = 2.0;
    recommendation = 'Require double deposit. Consider manual approval for high-value items.';
  } else if (score >= 45) {
    overallScore = 'HIGH';
    depositMultiplier = 1.5;
    recommendation = 'Require 50% additional deposit. Flag for operations review.';
  } else if (score >= 20) {
    overallScore = 'MEDIUM';
    depositMultiplier = 1.0;
    recommendation = 'Standard deposit. Monitor rental closely.';
  } else {
    overallScore = 'LOW';
    depositMultiplier = 1.0;
    recommendation = 'Trusted customer. Standard processing.';
  }

  return {
    customerId,
    overallScore,
    numericScore: score,
    factors,
    recommendation,
    depositMultiplier,
  };
};
