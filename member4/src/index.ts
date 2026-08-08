import express from 'express';
import cors from 'cors';
import { CONFIG } from '../config/env';
import eventScheduler from './events/scheduler';
import taskQueue from './events/taskQueue';
import { ReturnReminderWorkflow } from './workflows/returnReminder';
import { OverdueCollectionWorkflow } from './workflows/overdueCollection';
import { PickupConfirmationWorkflow } from './workflows/pickupConfirmation';
import { WebSimulatedClient } from './voice/webSimulatedClient';

const app = express();
app.use(cors());
app.use(express.json());

const webSimClient = new WebSimulatedClient();

// ── Health Check ──
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Relay AI - Member 4 (Voice & Autonomous Agent)',
    demoMode: CONFIG.DEMO_MODE,
    demoAllowlist: CONFIG.DEMO_ALLOWLIST,
    llmProvider: CONFIG.LLM_PROVIDER,
    maxDailyCalls: CONFIG.MAX_DAILY_DEMO_CALLS,
    timestamp: new Date().toISOString(),
  });
});

// ── Manual Demo Call Trigger (Emergency Judging Button) ──
app.post('/api/demo/call', async (req, res) => {
  try {
    const { scenario, rentalId, phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }

    const targetRental = rentalId || 'RLY-DEMO-001';
    let result: any;

    if (scenario === 'overdue') {
      const wf = new OverdueCollectionWorkflow();
      result = await wf.execute(targetRental, phoneNumber);
    } else if (scenario === 'pickup') {
      const wf = new PickupConfirmationWorkflow();
      result = await wf.execute(targetRental, phoneNumber);
    } else {
      // Default: Return Reminder (Flagship Scenario A/D)
      const wf = new ReturnReminderWorkflow();
      result = await wf.execute(targetRental, phoneNumber);
    }

    return res.json({
      message: 'Demo call triggered successfully',
      scenario: scenario || 'return_reminder',
      result,
    });
  } catch (error: any) {
    console.error('Error triggering demo call:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ── Level 2 Browser Voice Simulation Endpoints ──
app.post('/api/web-sim/start', (req, res) => {
  const { scenarioId } = req.body;
  const session = webSimClient.startSimulation(scenarioId || 'RLY-DEMO-001');
  res.json(session);
});

app.post('/api/web-sim/message', async (req, res) => {
  const { sessionId, message } = req.body;
  try {
    const response = await webSimClient.sendMessage(sessionId, message);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── Task Queue Status ──
app.get('/api/queue/status', (req, res) => {
  res.json({
    queuedJobs: taskQueue.getQueuedJobs(),
  });
});

// Start Server
const server = app.listen(CONFIG.AI_SERVER_PORT, () => {
  console.log(`====================================================`);
  console.log(`🤖 Relay AI Agent Server (Member 4) Running`);
  console.log(`Port: ${CONFIG.AI_SERVER_PORT}`);
  console.log(`DEMO_MODE: ${CONFIG.DEMO_MODE}`);
  console.log(`DEMO_ALLOWLIST: ${CONFIG.DEMO_ALLOWLIST.join(', ')}`);
  console.log(`LLM Provider: ${CONFIG.LLM_PROVIDER}`);
  console.log(`====================================================`);

  // Start background event scanner
  eventScheduler.start('*/5 * * * *');
});

export default app;
