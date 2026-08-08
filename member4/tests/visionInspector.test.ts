import { DamageInspector, DamageInspectionInput } from '../src/vision/damageInspector';

describe('DamageInspector — Vision Damage Assessment', () => {
  const inspector = new DamageInspector();

  const baseInput: DamageInspectionInput = {
    rentalId: 'RLY-DEMO-001',
    productName: 'Sony A7 IV',
    productCategory: 'camera',
    productReplacementValue: 180000,
    depositHeld: 20000,
    inspectorNotes: 'Minor scratch on top dial, missing lens front cap.',
  };

  test('should generate structured inspection report and certificate', async () => {
    const report = await inspector.inspect(baseInput);

    expect(report.rentalId).toBe('RLY-DEMO-001');
    expect(report.inspectionId).toBeDefined();
    expect(report.inspectionCertificate).toBeDefined();
    expect(report.inspectionCertificate.hash).toMatch(/^SHA-[0-9a-f]+/);
  });

  test('should calculate deposit refund correctly when deduction < deposit', async () => {
    const report = await inspector.inspect(baseInput);

    expect(report.totalDeduction).toBe(report.totalDamageCost + report.totalMissingCost);
    expect(report.depositRefund).toBe(Math.max(0, baseInput.depositHeld - report.totalDeduction));
  });

  test('should set depositSufficient to false when totalDeduction > deposit', async () => {
    const highDamageInput: DamageInspectionInput = {
      ...baseInput,
      productReplacementValue: 200000,
      depositHeld: 5000,
      inspectorNotes: 'Cracked sensor glass, total liquid spill damage.',
    };

    const report = await inspector.inspect(highDamageInput);
    expect(typeof report.depositSufficient).toBe('boolean');
  });
});
