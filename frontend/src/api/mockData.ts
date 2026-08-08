import { Product, Rental, Invoice, Order, CustomerNotification } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    title: 'Sony A7 IV Mirrorless Camera',
    description: 'Full-frame 33MP Exmor R CMOS sensor, 4K 60p recording, advanced real-time AF for video and photos.',
    category: 'Cameras',
    brand: 'Sony',
    dailyRate: 2500,
    securityDeposit: 35000,
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'],
    variants: [
      { id: 'v1', name: 'Body Only', sku: 'SONY-A7IV-BODY', priceModifier: 0, attributes: { Mount: 'E-Mount' }, inStock: true },
      { id: 'v2', name: 'With 24-70mm f/2.8 GM Lens', sku: 'SONY-A7IV-KIT', priceModifier: 1200, attributes: { Lens: '24-70mm f/2.8' }, inStock: true }
    ],
    attributes: { Resolution: '33 MP', Video: '4K 60p', Sensor: 'Full Frame' },
    isAvailable: true,
    stockCount: 5,
    highDemand: false,
    rentalTerms: 'Includes 2x 128GB SD cards, 2x batteries, and dual charger.'
  },
  {
    id: 'prod-002',
    title: 'RED Komodo 6K Cinema Camera',
    description: 'Compact cinema camera featuring a 6K global shutter Super 35 sensor and REDCODE RAW recording.',
    category: 'Cameras',
    brand: 'RED',
    dailyRate: 8500,
    securityDeposit: 120000,
    images: ['https://images.unsplash.com/photo-1579632652768-6cb9dcf85912?auto=format&fit=crop&w=800&q=80'],
    variants: [
      { id: 'v3', name: 'Production Suite', sku: 'RED-KOMODO-PROD', priceModifier: 0, attributes: { Rig: 'Full Cage' }, inStock: true }
    ],
    attributes: { Resolution: '6K', Sensor: 'Super 35 Global Shutter', Mount: 'Canon RF' },
    isAvailable: true,
    stockCount: 2,
    highDemand: true,
    rentalTerms: 'High value production kit. ID verification required.'
  },
  {
    id: 'prod-003',
    title: 'DJI RS 3 Pro Gimbal Stabilizer',
    description: 'Automated axis locks, extended carbon fiber axis arms, LiDAR focusing compatibility, 4.5kg tested payload.',
    category: 'Gimbals',
    brand: 'DJI',
    dailyRate: 1500,
    securityDeposit: 15000,
    images: ['https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80'],
    variants: [
      { id: 'v4', name: 'Combo Kit with RavenEye', sku: 'DJI-RS3PRO-COMBO', priceModifier: 0, attributes: { Transmission: 'RavenEye' }, inStock: true }
    ],
    attributes: { Payload: '4.5 kg', Weight: '1.5 kg', BatteryLife: '12 Hours' },
    isAvailable: true,
    stockCount: 8,
    highDemand: false
  },
  {
    id: 'prod-004',
    title: 'Aputure LS 600d Pro LED Light',
    description: '600W daylight-balanced point-source LED light with weather resistance and Bowens mount capability.',
    category: 'Lighting',
    brand: 'Aputure',
    dailyRate: 3200,
    securityDeposit: 40000,
    images: ['https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80'],
    variants: [
      { id: 'v5', name: 'Standard Kit + Softbox', sku: 'APUTURE-600D-KIT', priceModifier: 0, attributes: { Mount: 'Bowens' }, inStock: true }
    ],
    attributes: { Output: '600W', ColorTemp: '5600K', CRI: '96+' },
    isAvailable: true,
    stockCount: 4,
    highDemand: false
  },
  {
    id: 'prod-005',
    title: 'Sennheiser EW 112P G4 Wireless Mic Set',
    description: 'Broadcast-quality wireless audio system for ENG and camera recording applications.',
    category: 'Audio',
    brand: 'Sennheiser',
    dailyRate: 1200,
    securityDeposit: 12000,
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'],
    variants: [
      { id: 'v6', name: 'Dual Channel Set', sku: 'SENN-G4-DUAL', priceModifier: 0, attributes: { Frequency: 'A-Range' }, inStock: true }
    ],
    attributes: { Channels: 'Dual', Type: 'Lavalier Wireless' },
    isAvailable: true,
    stockCount: 6,
    highDemand: false
  }
];

export const INITIAL_RENTALS: Rental[] = [
  {
    id: 'RLY-DEMO-001',
    orderId: 'ORD-8821',
    productId: 'prod-001',
    productTitle: 'Sony A7 IV Mirrorless Camera',
    productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    startDate: '2026-08-06',
    endDate: '2026-08-08',
    durationDays: 2,
    dailyRate: 2500,
    totalRate: 5000,
    securityDeposit: 35000,
    pickupLocation: 'Relay Tech Hub — Store #4, MG Road, Bengaluru',
    qrCodeData: 'RLY-DEMO-001-TOKEN-CONFIRMED',
    invoiceId: 'INV-1002',
    timeline: [
      { status: 'Confirmed', timestamp: '2026-08-05 10:30', note: 'Booking confirmed and payment processed.', executedBy: 'customer' },
      { status: 'Pickup Pending', timestamp: '2026-08-06 09:00', note: 'Order ready at MG Road store.', executedBy: 'admin' },
      { status: 'Active', timestamp: '2026-08-06 10:15', note: 'Customer picked up item. QR code scanned.', executedBy: 'customer' }
    ]
  },
  {
    id: 'RLY-DEMO-002',
    orderId: 'ORD-8822',
    productId: 'prod-003',
    productTitle: 'DJI RS 3 Pro Gimbal Stabilizer',
    productImage: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80',
    status: 'Overdue',
    startDate: '2026-08-04',
    endDate: '2026-08-07',
    durationDays: 3,
    dailyRate: 1500,
    totalRate: 4500,
    securityDeposit: 15000,
    pickupLocation: 'Relay Tech Hub — Store #4, MG Road, Bengaluru',
    qrCodeData: 'RLY-DEMO-002-TOKEN-OVERDUE',
    invoiceId: 'INV-1003',
    isOverdue: true,
    overdueHours: 18,
    estimatedLateFee: 1500,
    timeline: [
      { status: 'Confirmed', timestamp: '2026-08-03 14:20', note: 'Order placed.', executedBy: 'customer' },
      { status: 'Active', timestamp: '2026-08-04 11:00', note: 'Picked up by customer.', executedBy: 'admin' },
      { status: 'Overdue', timestamp: '2026-08-07 19:00', note: 'Return window passed without dropoff.', executedBy: 'ai' }
    ]
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-1002',
    rentalId: 'RLY-DEMO-001',
    orderId: 'ORD-8821',
    customerName: 'Anushka Ghosh',
    customerEmail: 'anushka@example.com',
    date: '2026-08-05',
    rentalAmount: 5000,
    securityDeposit: 35000,
    taxes: 900,
    totalAmount: 40900,
    status: 'Paid',
    items: [
      { description: 'Sony A7 IV Mirrorless Camera (2 days @ ₹2,500/day)', amount: 5000 },
      { description: 'Refundable Security Deposit', amount: 35000 },
      { description: 'GST (18% on rental rate)', amount: 900 }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: CustomerNotification[] = [
  {
    id: 'notif-01',
    title: 'Rental Return Due Today',
    message: 'Your Sony A7 IV rental (RLY-DEMO-001) is due back today at 6:00 PM.',
    type: 'return',
    timestamp: '10 mins ago',
    read: false,
    actionUrl: '/portal/rentals'
  },
  {
    id: 'notif-02',
    title: 'AI Operations Assistant',
    message: 'Would you like to extend your rental for an additional day for ₹2,500?',
    type: 'ai',
    timestamp: '1 hour ago',
    read: false,
    actionUrl: '/portal/rentals'
  }
];
