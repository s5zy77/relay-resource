import { RiskEngine, RentalRiskInput } from '../src/risk/riskEngine';

describe('RiskEngine — Rental Risk Intelligence', () => {
  const engine = new RiskEngine();

  const baseInput: RentalRiskInput = {
    rentalId: 'RLY-TEST-001',
    customerId: 'CUST-001',
    productName: 'Sony A7 IV',
    productReplacementValue: 180000,
    depositHeld: 180000, // Full deposit = zero financial exposure
    dailyRate: 2500,
    dueDate: '2026-08-05',
    daysOverdue: 0,
    previousRentalsCount: 5,
    previousLateReturns: 0,
    previousDamageIncidents: 0,
    callAttempts: 0,
    callsAnswered: 0,
    hasActiveDispute: false,
  };

  test('LOW risk for on-time rental with good customer history', () => {
    const result = engine.evaluate(baseInput);
    expect(result.riskLevel).toBe('LOW');
    expect(result.riskScore).toBeLessThanOrEqual(30);
    // Good customer may have informational flags but no critical ones
    expect(result.flags.every(f => f.severity !== 'CRITICAL')).toBe(true);
  });

  test('HIGH risk for overdue rental with high financial exposure', () => {
    const overdueInput: RentalRiskInput = {
      ...baseInput,
      daysOverdue: 5,
      depositHeld: 5000,
    };
    const result = engine.evaluate(overdueInput);
    expect(result.riskScore).toBeGreaterThanOrEqual(50);
    expect(['HIGH', 'CRITICAL']).toContain(result.riskLevel);
    expect(result.flags.some(f => f.code === 'HIGH_LOSS_EXPOSURE')).toBe(true);
  });

  test('CRITICAL risk for unresponsive customer with severely overdue rental', () => {
    const criticalInput: RentalRiskInput = {
      ...baseInput,
      depositHeld: 10000, // Low deposit = high exposure
      daysOverdue: 10,
      callAttempts: 4,
      callsAnswered: 0,
      lastCallSentimentScore: -0.8,
    };
    const result = engine.evaluate(criticalInput);
    expect(result.riskLevel).toBe('CRITICAL');
    expect(result.flags.some(f => f.code === 'UNRESPONSIVE_CUSTOMER')).toBe(true);
    expect(result.flags.some(f => f.code === 'SEVERELY_OVERDUE')).toBe(true);
    expect(result.recommendedActions.length).toBeGreaterThan(0);
  });

  test('batch evaluation returns sorted by risk score descending', () => {
    const inputs: RentalRiskInput[] = [
      { ...baseInput, rentalId: 'LOW-001', daysOverdue: 0 },
      { ...baseInput, rentalId: 'HIGH-001', daysOverdue: 8, callAttempts: 3, callsAnswered: 0 },
      { ...baseInput, rentalId: 'MED-001', daysOverdue: 2 },
    ];
    const results = engine.evaluateBatch(inputs);
    expect(results[0].rentalId).toBe('HIGH-001');
    expect(results[results.length - 1].rentalId).toBe('LOW-001');
  });

  test('DAMAGE_HISTORY flag triggered for repeat offenders', () => {
    const damageInput: RentalRiskInput = {
      ...baseInput,
      previousDamageIncidents: 3,
    };
    const result = engine.evaluate(damageInput);
    expect(result.flags.some(f => f.code === 'DAMAGE_HISTORY')).toBe(true);
  });

  test('financial exposure is calculated correctly', () => {
    const result = engine.evaluate(baseInput);
    expect(result.financialExposure).toBe(baseInput.productReplacementValue - baseInput.depositHeld);
  });
});
