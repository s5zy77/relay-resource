#!/usr/bin/env ts-node
/**
 * Integration Demo Script — Member 4 AI Operations Command Center
 * Run: npx ts-node scripts/integrationDemo.ts
 *
 * This script demonstrates all 4 Prompt 2 AI pillars end-to-end in DEMO_MODE:
 * 1. Post-Call Intelligence (commitment extraction + sentiment analysis)
 * 2. Rental Risk Engine (multi-factor scoring)
 * 3. Vision Damage Inspector (deposit deduction assessment)
 * 4. Smart Concierge (NL equipment bundle recommendation)
 */

import { CommitmentExtractor } from '../src/intelligence/commitmentExtractor';
import { SentimentAnalyzer } from '../src/intelligence/sentimentAnalyzer';
import { SummaryGenerator } from '../src/intelligence/summaryGenerator';
import { RiskEngine, RentalRiskInput } from '../src/risk/riskEngine';
import { DamageInspector, DamageInspectionInput } from '../src/vision/damageInspector';
import { SmartSearch, BundleRequest } from '../src/concierge/smartSearch';

const divider = (title: string) => console.log(`\n${'='.repeat(60)}\n🔹 ${title}\n${'='.repeat(60)}`);

async function runDemo() {
  console.log('🤖 Relay AI — Member 4 Integration Demo');
  console.log('   Prompt 2: AI Operations Command Center\n');

  // ─────────────────────────────────────────────
  // 1. POST-CALL INTELLIGENCE
  // ─────────────────────────────────────────────
  divider('1. POST-CALL INTELLIGENCE');

  const sampleTranscript = `
[AI]: Hi Arjun, this is Relay AI calling regarding your Sony A7 IV rental that was due yesterday.
[CUSTOMER]: Oh yes, sorry I got delayed. I will definitely return it tomorrow by 6 PM.
[AI]: Perfect. Will you be able to settle the one-day extension fee of ₹2500 as well?
[CUSTOMER]: Yes, I'll pay that when I drop it off. The camera is in perfect condition.
[AI]: That's great to hear! I've noted your return for tomorrow at 6 PM with the fee.
  `;

  const extractor = new CommitmentExtractor();
  const analyzer = new SentimentAnalyzer();
  const generator = new SummaryGenerator();

  console.log('📞 Transcript snippet extracted...');
  const commitments = await extractor.extract(sampleTranscript);
  console.log('✅ Commitment extraction:', JSON.stringify(commitments.commitments, null, 2));

  const sentiment = await analyzer.analyze(sampleTranscript);
  console.log('✅ Sentiment analysis:', JSON.stringify(sentiment.overall, null, 2));
  console.log(`   Escalation urgency: ${sentiment.escalationUrgency.toFixed(2)}`);

  const summary = await generator.generate({
    callId: 'CALL-001',
    rentalId: 'RLY-DEMO-001',
    agentName: 'Relay AI Voice',
    transcript: sampleTranscript,
    callDurationSeconds: 90,
  });
  console.log('✅ Post-call summary action items:', summary.actionItems);

  // ─────────────────────────────────────────────
  // 2. RENTAL RISK ENGINE
  // ─────────────────────────────────────────────
  divider('2. RENTAL RISK ENGINE');

  const engine = new RiskEngine();
  const riskInput: RentalRiskInput = {
    rentalId: 'RLY-DEMO-001',
    customerId: 'CUST-DEMO',
    productName: 'Sony A7 IV',
    productReplacementValue: 180000,
    depositHeld: 20000,
    dailyRate: 2500,
    dueDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    daysOverdue: 3,
    previousRentalsCount: 8,
    previousLateReturns: 1,
    previousDamageIncidents: 0,
    callAttempts: 2,
    callsAnswered: 1,
    lastCallSentimentScore: 0.5,
    hasActiveDispute: false,
  };

  const risk = engine.evaluate(riskInput);
  console.log(`✅ Risk Level: ${risk.riskLevel}  (Score: ${risk.riskScore}/100)`);
  console.log(`   Financial Exposure: ₹${risk.financialExposure.toLocaleString()}`);
  console.log(`   Flags (${risk.flags.length}):`, risk.flags.map(f => f.code).join(', ') || 'None');
  console.log(`   Recommended Actions (${risk.recommendedActions.length}):`, risk.recommendedActions.slice(0, 2).join('; '));

  // ─────────────────────────────────────────────
  // 3. VISION DAMAGE INSPECTOR
  // ─────────────────────────────────────────────
  divider('3. VISION DAMAGE INSPECTOR');

  const inspector = new DamageInspector();
  const inspectionInput: DamageInspectionInput = {
    rentalId: 'RLY-DEMO-001',
    productName: 'Sony A7 IV',
    productCategory: 'camera',
    productReplacementValue: 180000,
    depositHeld: 20000,
    inspectorNotes: 'Small scratch on top dial. Missing front lens cap and UV filter.',
  };

  const report = await inspector.inspect(inspectionInput);
  console.log(`✅ Overall Condition: ${report.overallCondition}`);
  console.log(`   Total Deduction: ₹${report.totalDeduction.toLocaleString()}`);
  console.log(`   Deposit Refund: ₹${report.depositRefund.toLocaleString()}`);
  console.log(`   Deposit Sufficient: ${report.depositSufficient}`);
  console.log(`   Certificate: ${report.inspectionCertificate.hash}`);

  // ─────────────────────────────────────────────
  // 4. SMART CONCIERGE
  // ─────────────────────────────────────────────
  divider('4. SMART CONCIERGE (NL Bundle Recommendation)');

  const concierge = new SmartSearch();
  const bundleRequest: BundleRequest = {
    naturalLanguageQuery: 'Shooting a 2-day outdoor wedding in golden hour natural light',
    maxBudget: 15000,
    rentalDays: 2,
  };

  console.log(`📝 Query: "${bundleRequest.naturalLanguageQuery}"`);
  const recommendation = await concierge.recommend(bundleRequest);
  console.log(`✅ Bundle (${recommendation.bundle.length} items):`);
  recommendation.bundle.forEach(item => console.log(`   • ${item.name} — ₹${item.dailyRate}/day`));
  console.log(`   Total Cost: ₹${recommendation.totalCost.toLocaleString()}`);
  console.log(`   Upsells: ${recommendation.upsellSuggestions.map(u => u.name).join(', ')}`);

  console.log('\n\n✅ All 4 AI pillars demonstrated successfully.');
}

runDemo().catch(console.error);
