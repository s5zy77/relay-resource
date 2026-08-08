import registry from './registry';
import member3Client from '../integrations/member3Client';

const readTools = [
  {
    name: 'lookup_customer',
    description: 'Lookup a customer by ID',
    parameters: {
      type: 'object',
      properties: { customerId: { type: 'string' } },
      required: ['customerId']
    },
    permission: 'READ' as const,
    requiresConfirmation: false,
    handler: async (args: { customerId: string }) => member3Client.lookupCustomer(args.customerId)
  },
  {
    name: 'get_customer_rentals',
    description: 'Get all rentals for a customer',
    parameters: {
      type: 'object',
      properties: { customerId: { type: 'string' } },
      required: ['customerId']
    },
    permission: 'READ' as const,
    requiresConfirmation: false,
    handler: async (args: { customerId: string }) => member3Client.getCustomerRentals(args.customerId)
  },
  {
    name: 'get_rental',
    description: 'Get details of a specific rental by ID',
    parameters: {
      type: 'object',
      properties: { rentalId: { type: 'string' } },
      required: ['rentalId']
    },
    permission: 'READ' as const,
    requiresConfirmation: false,
    handler: async (args: { rentalId: string }) => member3Client.getRental(args.rentalId)
  },
  {
    name: 'check_product_availability',
    description: 'Check if a product is available for a given date range',
    parameters: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' }
      },
      required: ['productId', 'startDate', 'endDate']
    },
    permission: 'READ' as const,
    requiresConfirmation: false,
    handler: async (args: { productId: string, startDate: string, endDate: string }) => 
      member3Client.checkProductAvailability(args.productId, args.startDate, args.endDate)
  },
  {
    name: 'get_product_details',
    description: 'Get details of a specific product',
    parameters: {
      type: 'object',
      properties: { productId: { type: 'string' } },
      required: ['productId']
    },
    permission: 'READ' as const,
    requiresConfirmation: false,
    handler: async (args: { productId: string }) => member3Client.getProductDetails(args.productId)
  },
  {
    name: 'get_pricing',
    description: 'Get pricing for a product given a duration in days',
    parameters: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        duration: { type: 'number' }
      },
      required: ['productId', 'duration']
    },
    permission: 'READ' as const,
    requiresConfirmation: false,
    handler: async (args: { productId: string, duration: number }) => member3Client.getPricing(args.productId, args.duration)
  },
  {
    name: 'calculate_late_fee',
    description: 'Calculate the late fee for a given rental',
    parameters: {
      type: 'object',
      properties: { rentalId: { type: 'string' } },
      required: ['rentalId']
    },
    permission: 'READ' as const,
    requiresConfirmation: false,
    handler: async (args: { rentalId: string }) => member3Client.calculateLateFee(args.rentalId)
  },
  {
    name: 'get_deposit_status',
    description: 'Get the deposit status of a rental',
    parameters: {
      type: 'object',
      properties: { rentalId: { type: 'string' } },
      required: ['rentalId']
    },
    permission: 'READ' as const,
    requiresConfirmation: false,
    handler: async (args: { rentalId: string }) => member3Client.getDepositStatus(args.rentalId)
  },
  {
    name: 'check_extension_availability',
    description: 'Check if a rental can be extended to a new end date',
    parameters: {
      type: 'object',
      properties: {
        rentalId: { type: 'string' },
        newEndDate: { type: 'string' }
      },
      required: ['rentalId', 'newEndDate']
    },
    permission: 'READ' as const,
    requiresConfirmation: false,
    handler: async (args: { rentalId: string, newEndDate: string }) => 
      member3Client.checkExtensionAvailability(args.rentalId, args.newEndDate)
  },
  {
    name: 'get_pickup_information',
    description: 'Get pickup information for a rental',
    parameters: {
      type: 'object',
      properties: { rentalId: { type: 'string' } },
      required: ['rentalId']
    },
    permission: 'READ' as const,
    requiresConfirmation: false,
    handler: async (args: { rentalId: string }) => member3Client.getPickupInformation(args.rentalId)
  },
  {
    name: 'get_return_information',
    description: 'Get return information for a rental',
    parameters: {
      type: 'object',
      properties: { rentalId: { type: 'string' } },
      required: ['rentalId']
    },
    permission: 'READ' as const,
    requiresConfirmation: false,
    handler: async (args: { rentalId: string }) => member3Client.getReturnInformation(args.rentalId)
  },
  {
    name: 'get_delivery_information',
    description: 'Get delivery information for a rental',
    parameters: {
      type: 'object',
      properties: { rentalId: { type: 'string' } },
      required: ['rentalId']
    },
    permission: 'READ' as const,
    requiresConfirmation: false,
    handler: async (args: { rentalId: string }) => member3Client.getDeliveryInformation(args.rentalId)
  }
];

export function registerReadTools() {
  readTools.forEach(tool => registry.registerTool(tool));
}
