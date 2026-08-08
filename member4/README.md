# Member 4 — Relay AI: Voice Agent & AI Operations Command Center

> **Hackathon Role:** Member 4 — AI, Autonomous Operations & Local Voice Agent  
> **Port:** 4000  
> **Author:** [@schach306-png](https://github.com/schach306-png)

---

## Overview

Member 4 is the AI brain of the Relay equipment rental platform. It runs an autonomous voice agent that handles customer calls end-to-end, and a full **AI Operations Command Center** that brings intelligence to every stage of the rental lifecycle.

---

## Architecture

```
member4/
├── config/           # ENV configuration (DEMO_MODE, LLM provider)
├── src/
│   ├── agent/        # LLM orchestration, tool execution loop
│   ├── voice/        # STT/TTS pipeline, telephony bridge, web sim
│   ├── workflows/    # Return reminder, overdue collection, pickup confirm
│   ├── events/       # Cron-based rental event scanner
│   ├── intelligence/ # ⭐ Post-call AI (commitment extraction, sentiment, summary)
│   ├── risk/         # ⭐ Multi-factor Rental Risk Engine
│   ├── vision/       # ⭐ AI Damage Inspector + deposit deduction
│   ├── concierge/    # ⭐ Smart equipment bundle recommendation
│   ├── routes/       # Express REST API (voice + AI ops)
│   └── index.ts      # Server entry point (port 4000)
├── tests/            # Jest unit + integration test suite (18/18 passing)
└── scripts/          # Demo and utility scripts
```

---

## Prompt 2 — AI Operations Command Center

### 🧠 Post-Call Intelligence (`src/intelligence/`)

| Module | Capability |
|--------|-----------|
| `CommitmentExtractor` | Extracts return dates, payment promises, condition agreements from transcripts |
| `SentimentAnalyzer` | Turn-by-turn sentiment scoring, escalation urgency index, tone classification |
| `SummaryGenerator` | Structured post-call summary with action items and next-contact recommendations |

**API:** `POST /api/ai/intelligence/extract-commitment`  
**API:** `POST /api/ai/intelligence/analyze-sentiment`  
**API:** `POST /api/ai/intelligence/generate-summary`

---

### ⚠️ Rental Risk Engine (`src/risk/`)

5-dimensional composite risk scoring:

| Dimension | Weight |
|-----------|--------|
| Financial Exposure (replacement value vs deposit) | 30% |
| Overdue Severity | 35% |
| Customer Reliability History | 15% |
| Communication Responsiveness | 10% |
| Last Call Sentiment | 10% |

**Outputs:** `LOW / MEDIUM / HIGH / CRITICAL` + auto-flags + recommended interventions  
**API:** `POST /api/ai/risk/evaluate` · `POST /api/ai/risk/evaluate-batch`

---

### 📷 Vision Damage Inspector (`src/vision/`)

- LLM-driven condition assessment from inspector notes
- Per-item damage cost estimation and total deduction
- Deposit sufficiency check and refund calculation
- SHA-based tamper-proof inspection certificate

**API:** `POST /api/ai/vision/inspect`

---

### 🔍 Smart Concierge (`src/concierge/`)

- Natural language → equipment bundle recommendations
- Budget-aware assembly with daily-rate projection
- Shooting-scenario detection (wedding, travel, studio, etc.)
- Upsell engine for complementary accessories

**API:** `POST /api/ai/concierge/recommend`

---

## Getting Started

```bash
cd member4
npm install
cp .env.example .env  # Set OPENAI_API_KEY or OLLAMA_BASE_URL

# Development (DEMO_MODE=true by default)
npm run dev

# Run tests (18/18 passing)
npm test

# Integration demo (all 4 AI pillars)
npx ts-node scripts/integrationDemo.ts
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEMO_MODE` | `true` | Restricts calls to allowlist, enables fallbacks |
| `LLM_PROVIDER` | `ollama` | `ollama` or `openai` |
| `OPENAI_API_KEY` | — | Required if `LLM_PROVIDER=openai` |
| `OLLAMA_MODEL` | `llama3.2` | Local model name |
| `AI_SERVER_PORT` | `4000` | Express server port |

---

## API Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health + config status |
| POST | `/api/demo/call` | Trigger a demo voice call |
| POST | `/api/web-sim/start` | Start browser voice simulation |
| POST | `/api/web-sim/message` | Send message in simulated session |
| POST | `/api/ai/intelligence/extract-commitment` | Extract commitments from transcript |
| POST | `/api/ai/intelligence/analyze-sentiment` | Analyze transcript sentiment |
| POST | `/api/ai/intelligence/generate-summary` | Generate post-call summary |
| POST | `/api/ai/risk/evaluate` | Evaluate single rental risk |
| POST | `/api/ai/risk/evaluate-batch` | Batch risk evaluation |
| POST | `/api/ai/vision/inspect` | Inspect equipment damage |
| POST | `/api/ai/concierge/recommend` | NL equipment bundle recommendation |
| GET | `/api/queue/status` | Task queue status |

---

*Built for the Relay Hackathon — Prompt 2: AI Operations Command Center*
