# 🚀 Relay — AI-Powered Rental Operations Platform

An end-to-end, multi-agent AI rental management platform built for 24-hour hackathon execution.

---

## 👥 Engineering Team & Contributors

| Member | Role | GitHub Profile | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Member 1** | Frontend & UI/UX | [@s5zy77](https://github.com/s5zy77) | Customer Storefront, Dashboards, Components |
| **Member 2** | Customer Workflows | Team Member | React State, Checkout, QR Pass Workflow |
| **Member 3** | Core Backend & DB | Team Member | Node.js, Express, MongoDB, Business APIs |
| **Member 4** | **AI & Autonomous Voice Operations** | [**@schach306-png**](https://github.com/schach306-png) | **Local LLM Orchestrator, Voice Agent (STT/TTS), PSTN Telephony Bridge, Safety Enforcer, Risk Engine & Operations Copilot** |

---

## 🤖 Member 4 Subsystem Architecture (`/member4`)

Maintained by **[@schach306-png](https://github.com/schach306-png)**.

### Key Capabilities
- **Local AI Orchestrator**: Tool selection and execution via Ollama (`llama3`) or OpenAI API fallback.
- **Controlled DB Flow**: AI reasons and triggers REST tools against Member 3 APIs; AI never directly mutates MongoDB.
- **Voice Agent Loop**: Full-duplex STT $\rightarrow$ LLM $\rightarrow$ TTS conversation loop with real-time transcript logging.
- **Outbound Telephony & Safety**: PSTN calls via Twilio / Plivo with **strict server-side `DEMO_ALLOWLIST` enforcement**.
- **Permission Classifier**: READ tools execute automatically; WRITE tools (`extend_rental`, `create_booking`) require explicit confirmation.

---

## 💻 Running Member 4 Locally

```bash
cd member4
npm install
npm run dev
```

Run test suite:
```bash
npm test
```
