import { Router, Request, Response } from 'express';
import { RiskEngine, RentalRiskInput } from '../risk/riskEngine';
import { DamageInspector, DamageInspectionInput } from '../vision/damageInspector';
import { SmartSearch, BundleRequest } from '../concierge/smartSearch';
import { CommitmentExtractor } from '../intelligence/commitmentExtractor';
import { SentimentAnalyzer } from '../intelligence/sentimentAnalyzer';
import { SummaryGenerator } from '../intelligence/summaryGenerator';

const router = Router();

const riskEngine = new RiskEngine();
const damageInspector = new DamageInspector();
const smartSearch = new SmartSearch();
const commitmentExtractor = new CommitmentExtractor();
const sentimentAnalyzer = new SentimentAnalyzer();
const summaryGenerator = new SummaryGenerator();

// ── Risk Analysis ──
router.post('/risk-analysis', async (req: Request, res: Response) => {
  try {
    const input: RentalRiskInput = req.body;
    if (!input.rentalId) {
      return res.status(400).json({ error: 'rentalId is required' });
    }
    const assessment = riskEngine.evaluate(input);
    return res.json(assessment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/risk-analysis/batch', async (req: Request, res: Response) => {
  try {
    const { rentals } = req.body;
    if (!Array.isArray(rentals)) {
      return res.status(400).json({ error: 'rentals array is required' });
    }
    const assessments = riskEngine.evaluateBatch(rentals);
    return res.json({ assessments, count: assessments.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ── Vision Damage Inspection ──
router.post('/inspect-damage', async (req: Request, res: Response) => {
  try {
    const input: DamageInspectionInput = req.body;
    if (!input.rentalId || !input.productName) {
      return res.status(400).json({ error: 'rentalId and productName are required' });
    }
    const report = await damageInspector.inspect(input);
    return res.json(report);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ── Smart Concierge Bundle Recommendation ──
router.post('/recommend-bundle', async (req: Request, res: Response) => {
  try {
    const request: BundleRequest = req.body;
    if (!request.naturalLanguageQuery) {
      return res.status(400).json({ error: 'naturalLanguageQuery is required' });
    }
    const recommendation = await smartSearch.recommend(request);
    return res.json(recommendation);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ── Commitment Extraction ──
router.post('/extract-commitments', async (req: Request, res: Response) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'transcript is required' });
    }
    const result = await commitmentExtractor.extract(transcript);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ── Sentiment Analysis ──
router.post('/analyze-sentiment', async (req: Request, res: Response) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'transcript is required' });
    }
    const result = await sentimentAnalyzer.analyze(transcript);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ── Call Summary Generation ──
router.post('/generate-summary', async (req: Request, res: Response) => {
  try {
    const { callId, scenario, transcript, toolCalls } = req.body;
    if (!callId || !transcript) {
      return res.status(400).json({ error: 'callId and transcript are required' });
    }
    const summary = await summaryGenerator.generate(callId, scenario || 'general', transcript, toolCalls);
    return res.json(summary);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ── Operations Command Center Dashboard ──
router.get('/ops-summary', async (_req: Request, res: Response) => {
  try {
    const summary = {
      system: 'Relay AI Operations Command Center',
      status: 'OPERATIONAL',
      modules: {
        riskEngine: { status: 'ACTIVE', description: 'Rental risk scoring and flag engine' },
        visionInspector: { status: 'ACTIVE', description: 'AI damage assessment and deposit calculator' },
        commitmentExtractor: { status: 'ACTIVE', description: 'Call transcript commitment extraction' },
        sentimentAnalyzer: { status: 'ACTIVE', description: 'Real-time customer sentiment tracking' },
        smartConcierge: { status: 'ACTIVE', description: 'NL equipment bundle recommendation engine' },
        voicePipeline: { status: 'ACTIVE', description: 'STT/TTS/Telephony voice agent pipeline' },
        autonomousScheduler: { status: 'ACTIVE', description: 'Background overdue/due-today rental scanner' },
      },
      capabilities: [
        'Autonomous outbound calling (Return Reminders, Overdue Collection, Pickup Confirmation)',
        'Post-call commitment extraction and follow-up tracking',
        'Real-time customer sentiment analysis and escalation detection',
        'Automated 0-100 rental risk scoring with multi-factor analysis',
        'AI vision damage assessment with deposit deduction calculation',
        'Natural language equipment bundle recommendations with upselling',
        'Executive call summary generation',
      ],
      safetyEnforcement: {
        demoMode: true,
        writeToolConfirmation: 'REQUIRED',
        dbAccessPattern: 'AI → Tool → Member3 API → Business Validation → MongoDB',
      },
      timestamp: new Date().toISOString(),
    };
    return res.json(summary);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
