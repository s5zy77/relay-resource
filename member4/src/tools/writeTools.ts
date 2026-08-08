import registry from './registry';
import member3Client from '../integrations/member3Client';

const writeTools = [
  {
    name: 'extend_rental',
    description: 'Extend a rental to a new end date',
    parameters: {
      type: 'object',
      properties: {
        rentalId: { type: 'string' },
        newEndDate: { type: 'string' }
      },
      required: ['rentalId', 'newEndDate']
    },
    permission: 'WRITE' as const,
    requiresConfirmation: true,
    handler: async (args: { rentalId: string, newEndDate: string }) => 
      member3Client.extendRental(args.rentalId, args.newEndDate)
  },
  {
    name: 'create_rental_booking',
    description: 'Create a new rental booking',
    parameters: {
      type: 'object',
      properties: {
        bookingData: { type: 'object' }
      },
      required: ['bookingData']
    },
    permission: 'WRITE' as const,
    requiresConfirmation: true,
    handler: async (args: { bookingData: any }) => member3Client.createRentalBooking(args.bookingData)
  },
  {
    name: 'cancel_rental',
    description: 'Cancel an existing rental',
    parameters: {
      type: 'object',
      properties: {
        rentalId: { type: 'string' },
        reason: { type: 'string' }
      },
      required: ['rentalId', 'reason']
    },
    permission: 'WRITE' as const,
    requiresConfirmation: true,
    handler: async (args: { rentalId: string, reason: string }) => 
      member3Client.cancelRental(args.rentalId, args.reason)
  },
  {
    name: 'create_payment_link',
    description: 'Create a payment link for a rental',
    parameters: {
      type: 'object',
      properties: {
        rentalId: { type: 'string' },
        amount: { type: 'number' }
      },
      required: ['rentalId', 'amount']
    },
    permission: 'WRITE' as const,
    requiresConfirmation: true,
    handler: async (args: { rentalId: string, amount: number }) => 
      member3Client.createPaymentLink(args.rentalId, args.amount)
  },
  {
    name: 'create_support_ticket',
    description: 'Create a support ticket for a customer',
    parameters: {
      type: 'object',
      properties: {
        customerId: { type: 'string' },
        issue: { type: 'string' }
      },
      required: ['customerId', 'issue']
    },
    permission: 'WRITE' as const,
    requiresConfirmation: true,
    handler: async (args: { customerId: string, issue: string }) => 
      member3Client.createSupportTicket(args.customerId, args.issue)
  }
];

export function registerWriteTools() {
  writeTools.forEach(tool => registry.registerTool(tool));
}
