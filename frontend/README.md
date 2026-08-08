# Relay — Customer Portal (Frontend)

Welcome to the **Customer Portal** for **Relay** – an AI-powered Rental Management & Autonomous Rental Operations Platform. This repository contains the frontend implementation for Member 2's components.

## 🚀 Project Vision

Relay is not just another standard CRUD rental SaaS. Our differentiation lies in being an **intelligent rental operations platform** that actively understands, monitors, predicts, and helps operate the rental business.

The Customer Portal is built to provide an ultra-premium, dynamic, and intuitive experience for customers browsing, renting, and managing equipment.

## 🏗 Architecture & Stack

The frontend is a modular Single Page Application (SPA) structured as follows:

*   **Framework & Build:** React + Vite + TypeScript
*   **Server State:** TanStack Query (`@tanstack/react-query`)
    *   Handles products, rentals, orders, invoices, profile, and notifications.
*   **Client State:** Zustand
    *   Manages cart, checkout stepper, selected rental dates, UI preferences, and temporary form states.
*   **Schema Validation:** Zod (for client-side form and payload validation)
*   **HTTP Client:** Axios with global interceptors for auth, session refresh, and error mapping.
*   **Routing:** React Router v6 with role-aware and protected route guards.
*   **Barcodes/QR:** Integration for rendering and scanning QR passes for equipment pickup/return.

## 🛠 Key Features

1.  **Storefront Catalog & Date Engine**
    *   Dynamic catalog with URL-based search parameter filters (category, brand, sort).
    *   Real-time availability checking and date picking engine.
    *   Automatic price and duration calculation based on selected rental dates.

2.  **Idempotent Checkout Workflow**
    *   Multi-step checkout with delivery/pickup selection.
    *   Cart persistence, security deposit calculation, and robust error handling for out-of-stock items.

3.  **Rental Lifecycle Management**
    *   Comprehensive dashboard for customers to track their rentals (Active, Upcoming, Completed, Cancelled, Overdue).
    *   QR code pass generation for quick physical pickup and returns.
    *   Invoice generation and deposit breakdown views.

4.  **AI-Powered Enhancements (The "Winning" Features)**
    *   **AI Concierge:** Conversational assistant that parses user intents, answers queries, and allows instant cart additions.
    *   **Natural-Language Search:** Converts queries like *"Show me cameras under ₹3,000/day available this weekend"* into structured determinist API queries.
    *   **Smart Recommendations:** Context-aware suggestions based on cart contents (e.g., suggesting a tripod when a camera is rented).
    *   **AI Rental Extension & Deposit Explainer:** Single-click extensions and contextual breakdowns of damage/late fee deductions.

## 📂 Folder Structure

```
frontend/
├── src/
│   ├── api/          # Axios client and endpoint definitions
│   ├── components/   # Reusable UI components and modals
│   ├── hooks/        # Custom React hooks (TanStack Query, state wrappers)
│   ├── pages/        # Page-level components
│   ├── services/     # Complex business logic orchestrators
│   ├── stores/       # Zustand client state stores
│   ├── types/        # TypeScript interfaces and type definitions
│   └── validators/   # Zod schema definitions
├── index.html        # Entry HTML
├── package.json      # Dependencies and scripts
├── vite.config.ts    # Vite bundler configuration
└── ...
```

## 💻 Local Development

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```

3.  **Run Tests (Unit & Validation):**
    ```bash
    npm run test:unit
    ```

## 🤝 Team Roles (24-Hour Hackathon)

This project is a collaborative effort:
*   **Member 1:** Visual Design, Components, Layouts, CSS, Animations.
*   **Member 2 (This Codebase):** State, Routing, API Integration, Client-Side Validation, Workflow Orchestration.
*   **Member 3:** Express API, Rental Business Logic, Database, Auth Enforcement.
*   **Member 4:** AI/Voice Reasoning, Autonomous Tools, LLM Services.

---
*Built with ❤️ during the 24-hour hackathon.*
