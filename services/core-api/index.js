require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* =========================================================================
   1. IN-MEMORY DEMO DATABASES (MOCK NOSQL)
========================================================================= */
let rentalsDb = [
  { id: 'R-7790', customer: 'Arjun M.', item: 'Sony A7 IV Camera Body', sku: 'CAM-A74-01', status: 'ACTIVE', returnDate: '2026-11-13' },
  { id: 'R-7791', customer: 'Priya S.', item: 'Godox SL200 III Kit', sku: 'LIT-GX2-01', status: 'PENDING', returnDate: '2026-11-14' },
];

let inventoryDb = [
  { sku: 'CAM-A74-01', name: 'Sony A7 IV', category: 'Cameras', condition: 'good', healthScore: 98 },
  { sku: 'CAM-A74-02', name: 'Sony A7 IV', category: 'Cameras', condition: 'neutral', healthScore: 80 },
  { sku: 'LIT-GX2-01', name: 'Godox SL200 III', category: 'Lighting', condition: 'good', healthScore: 100 },
  { sku: 'LNS-RF7-01', name: 'Canon RF 70-200mm', category: 'Lenses', condition: 'warning', healthScore: 65 },
  { sku: 'DRN-MV3-01', name: 'DJI Mavic 3 Pro', category: 'Drones', condition: 'error', healthScore: 20 },
];

/* =========================================================================
   2. RENTAL STATE MACHINE
========================================================================= */
// FSM Valid Traversal Pattern Node-Edge Graph
const STATE_GRAPH = {
  'PENDING': ['ACTIVE', 'CANCELLED'],
  'ACTIVE': ['RETURNED', 'OVERDUE'],
  'OVERDUE': ['RETURNED'],
  'RETURNED': [],
  'CANCELLED': []
};

/* =========================================================================
   3. API ENDPOINTS
========================================================================= */

// Health & Telemetry
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Core API - Intelligent Ops Embedded', timestamp: new Date().toISOString() });
});

// Fetch all rentals
app.get('/api/rentals', (req, res) => {
  res.json(rentalsDb);
});

// Fetch single rental state
app.get('/api/rentals/:id', (req, res) => {
  const rental = rentalsDb.find(r => r.id === req.params.id);
  if (!rental) return res.status(404).json({ error: 'Rental Context not found' });
  res.json(rental);
});

// Initialization of Rental (API-First Contract)
app.post('/api/rentals', (req, res) => {
  const { customer, item, sku, returnDate } = req.body;
  
  if (!customer || !item) {
    return res.status(400).json({ error: 'Validation Error: customer and item identity strictly required for payload.' });
  }

  const newRental = {
    id: 'R-' + Math.floor(1000 + Math.random() * 9000),
    customer,
    item,
    sku: sku || 'UNKNOWN-SKU',
    status: 'PENDING',
    returnDate: returnDate || new Date().toISOString().split('T')[0]
  };
  
  rentalsDb.push(newRental);
  res.status(201).json(newRental);
});

// Strict FSM State Transition endpoint (Intelligent Backend Engine)
app.patch('/api/rentals/:id/transition', (req, res) => {
  const { newState } = req.body;
  const rental = rentalsDb.find(r => r.id === req.params.id);
  
  if (!rental) return res.status(404).json({ error: 'Target Rental ID block not found' });
  
  const currentState = rental.status;
  const validTransitions = STATE_GRAPH[currentState] || [];
  
  // Guard Clauses for FSM Graph
  if (!validTransitions.includes(newState)) {
    return res.status(400).json({ 
      error: 'Illegal State Transition', 
      message: `Cannot transition node from [${currentState}] to [${newState}]. Valid graph edges: ${validTransitions.join(', ')}` 
    });
  }
  
  // Apply Transition
  rental.status = newState;
  
  // FSM Side effects: Calculate Asset Depreciation on Return
  if (newState === 'RETURNED' && rental.sku) {
     const inv = inventoryDb.find(i => i.sku === rental.sku);
     if (inv) {
       // Random wear tear multiplier emulation
       inv.healthScore -= (Math.floor(Math.random() * 7) + 2); 
       
       // Sync visual condition markers
       if (inv.healthScore < 85 && inv.healthScore >= 50) inv.condition = 'warning';
       if (inv.healthScore < 50) inv.condition = 'error';
     }
  }

  res.json({ message: 'State mutated successfully over FSM Edge', updatedRental: rental });
});

// Asset Inventory Dump
app.get('/api/admin/inventory', (req, res) => {
  res.json(inventoryDb);
});

/* =========================================================================
   BOOT
========================================================================= */
app.listen(PORT, () => {
  console.log(`Core Operations API Server bounding initialized at port ${PORT}`);
});
