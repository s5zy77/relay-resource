import { CONFIG } from '../config/env';

export function getDemoSeedData() {
  const allowedPhone = CONFIG.DEMO_ALLOWLIST && CONFIG.DEMO_ALLOWLIST.length > 0 
    ? CONFIG.DEMO_ALLOWLIST[0] 
    : '+15551234567';

  const seedData = {
    customers: [
      {
        customerId: 'CUST-DEMO-001',
        name: 'Demo Judge',
        phone: allowedPhone,
        email: 'judge@demo.relay'
      },
      {
        customerId: 'CUST-DEMO-002',
        name: 'Test Customer',
        phone: allowedPhone,
        email: 'test@demo.relay'
      },
      {
        customerId: 'CUST-DEMO-003',
        name: 'Pickup Customer',
        phone: allowedPhone,
        email: 'pickup@demo.relay'
      }
    ],
    products: [
      {
        productId: 'PROD-001',
        name: 'Sony A7 IV',
        category: 'Camera',
        dailyRate: 50
      }
    ],
    rentals: [
      {
        rentalId: 'RLY-DEMO-001',
        customerId: 'CUST-DEMO-001',
        productId: 'PROD-001',
        status: 'Active',
        returnDue: new Date(new Date().setHours(18, 0, 0, 0)).toISOString() // Today at 6 PM
      },
      {
        rentalId: 'RLY-DEMO-002',
        customerId: 'CUST-DEMO-002',
        productId: 'PROD-001',
        status: 'Overdue',
        returnDue: new Date(Date.now() - 86400000).toISOString() // Yesterday
      },
      {
        rentalId: 'RLY-DEMO-003',
        customerId: 'CUST-DEMO-003',
        productId: 'PROD-001',
        status: 'Pending_Pickup',
        pickupTime: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      }
    ]
  };

  return seedData;
}

if (require.main === module) {
  console.log(JSON.stringify(getDemoSeedData(), null, 2));
}
