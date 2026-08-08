# Relay — Autonomous Rental Operations Platform

![Relay Banner](https://via.placeholder.com/1200x300.png?text=Relay+-+Intelligent+Rental+Operations+Platform)

Relay is a next-generation **AI-powered Rental Management & Autonomous Rental Operations Platform**. We aren't just building a standard CRUD rental SaaS; we are building an intelligent system that actively understands, monitors, predicts, and helps operate the rental business.

---

## 👥 Engineering Team & Contributors

This project was built collaboratively during a 24-hour hackathon. 

| Member | Role | Name | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Member 1** | Frontend & UI/UX | **Ranish Dutta** | Customer Storefront, Dashboards, Components, Visual Design |
| **Member 2** | Customer Workflows | **Anushka Ghosh** | React State, Checkout, QR Pass Workflow, API Integration |
| **Member 3** | Core Backend & DB | **Subhasree Majumder**| Node.js, Express, MongoDB, Business APIs, Auth Enforcement |
| **Member 4** | AI & Autonomous Voice Operations | **Subhan Gupta** | Local LLM Orchestrator, Voice Agent (STT/TTS), PSTN Telephony Bridge, Risk Engine & Operations Copilot |

---

## 🚀 The Vision

The traditional rental equipment industry relies on manual tracking, physical checks, and phone calls. Relay automates this workflow end-to-end:
1. **Dynamic Catalog & Availability:** Real-time date engines to prevent double bookings.
2. **Idempotent Checkout:** Frictionless carts with automated security deposit calculations.
3. **Lifecycle Management:** Complete dashboard for tracking active, upcoming, and overdue rentals with QR-code based physical pass generation.
4. **AI Intelligence:** Native integration of conversational AI for search, support, upselling, and dynamic decision-making.

## 🧠 AI-Powered Enhancements ("The Winning Features")

- **AI Concierge & Natural-Language Search:** Convert prompt queries ("Show me 4k cameras under ₹3,000/day for a wedding this weekend") directly into structured determinist API queries, bypassing vector DB bloat.
- **Smart Recommendations:** Context-aware cart suggestions (e.g., suggesting an SD card and tripod when a Sony A7 IV is rented).
- **AI Rental Extension Engine:** Single-click extensions with real-time availability checks and dynamic price/deposit adjustments.
- **AI Deposit Explainer:** Transparent, natural-language breakdowns explaining damage or late fee deductions to customers.

---

## 🏗 System Architecture

The platform follows a modular microservice-inspired architecture:

```text
       ┌────────────────────────┐
       │      Member 1 UI       │  (Design system, CSS, layout, visual components)
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │        Member 2        │  (React State, TanStack Query, Zustand, API Client)
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │   Member 3 Core API    │  (Node/Express API, MongoDB, Business logic, Auth)
       └───────────▲────────────┘
                   │
                   │  Controlled Backend Tools
       ┌───────────┴────────────┐
       │   Member 4 AI Engine   │  (Local LLM, Voice Agent, Autonomous Operations)
       └────────────────────────┘
```

### Technology Stack
*   **Frontend:** React, Vite, TypeScript, Zustand, TanStack Query, React Router, Zod, Tailwind CSS.
*   **Backend:** Node.js, Express, TypeScript, Zod, JWT Authentication.
*   **Database:** MongoDB / Mongoose (NoSQL).
*   **AI/Voice:** Local LLMs, STT/TTS bridges, PSTN telephony integrations.

---

## 📂 Repository Structure

*   `/frontend` - Member 1 & 2: Customer Portal SPA (React/Vite).
*   `/backend` - Member 3: Core API server (Express/MongoDB).
*   `/ai` - Member 4: AI orchestrator and voice agent services.

## 💻 Local Development

### 1. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Running the Backend
```bash
cd backend
npm install
npm run dev
```

---
*Built with ❤️ in 24 hours.*
