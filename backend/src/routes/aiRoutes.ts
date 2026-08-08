import express from 'express';
import {
  aiExtendRental,
  aiApplyLateFee,
  aiFlagRisk,
  aiGetRentalDetails,
  aiGetCustomerProfile,
  aiGetOverdueRentals,
  aiGetDashboardSummary,
  aiGetRiskProfile,
  aiGetDynamicPrice,
  aiGetInventoryIntelligence,
  aiGetFleetUtilization,
} from '../controllers/internal/aiActionsController';

const router = express.Router();

/**
 * AI Tool/Action Routes
 * 
 * These routes are consumed by Member 4's AI/LLM agent.
 * They are separated from the user-facing API to enforce
 * the principle that AI never directly mutates the database —
 * it always goes through validated backend actions.
 * 
 * Write Actions (POST) — each requires an idempotencyKey
 * Read Queries (GET) — enriched data for AI reasoning
 */

// === WRITE ACTIONS (AI → Backend → DB) ===
router.post('/actions/extend-rental', aiExtendRental);
router.post('/actions/apply-late-fee', aiApplyLateFee);
router.post('/actions/flag-risk', aiFlagRisk);

// === READ QUERIES (AI reads enriched data) ===
router.get('/query/rental/:id', aiGetRentalDetails);
router.get('/query/customer/:id', aiGetCustomerProfile);
router.get('/query/overdue-rentals', aiGetOverdueRentals);
router.get('/query/dashboard-summary', aiGetDashboardSummary);

// === INTELLIGENCE QUERIES (Prompt 2) ===
router.get('/query/risk-profile/:customerId', aiGetRiskProfile);
router.post('/query/dynamic-price', aiGetDynamicPrice);
router.get('/query/inventory-intelligence/:productId', aiGetInventoryIntelligence);
router.get('/query/fleet-utilization', aiGetFleetUtilization);

export default router;
