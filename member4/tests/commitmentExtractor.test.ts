import { CommitmentExtractor } from '../src/intelligence/commitmentExtractor';
import { SentimentAnalyzer } from '../src/intelligence/sentimentAnalyzer';

describe('CommitmentExtractor & SentimentAnalyzer', () => {
  const extractor = new CommitmentExtractor();
  const sentimentAnalyzer = new SentimentAnalyzer();

  test('CommitmentExtractor should detect return intent and payment commitments', async () => {
    const transcript = `
[AI]: Hi John, this is Relay AI calling regarding your Sony A7 IV rental due today.
[CUSTOMER]: Hi, I will return it tomorrow evening around 6 PM and pay the extra day fee.
[AI]: Perfect, I will note that down.
    `;

    const result = await extractor.extract(transcript);
    expect(result.rawTranscript).toBe(transcript);
    expect(result.commitments).toBeDefined();
  });

  test('SentimentAnalyzer should analyze turn sentiment and compute escalation urgency', async () => {
    const transcript = `
[AI]: Good afternoon, calling regarding your overdue camera rental.
[CUSTOMER]: This is ridiculous! I paid yesterday and your system is wrong!
[AI]: I apologize for the confusion, let me look into this right away.
    `;

    const result = await sentimentAnalyzer.analyze(transcript);
    expect(result.overall).toBeDefined();
    expect(result.turnBySentiment.length).toBeGreaterThan(0);
    expect(result.escalationUrgency).toBeGreaterThanOrEqual(0);
  });
});
