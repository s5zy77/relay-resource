import Rental from '../models/rentalModel';
import Inventory from '../models/inventoryModel';

export const checkAvailability = async (
  productId: string,
  variantId: string | undefined,
  requestedStart: Date,
  requestedEnd: Date,
  quantity: number = 1
): Promise<boolean> => {
  // 1. Find all physical inventory items for this product/variant that are NOT marked UNAVAILABLE/MAINTENANCE
  const query: any = {
    product: productId,
    status: { $nin: ['UNAVAILABLE', 'MAINTENANCE'] },
  };
  
  if (variantId) {
    query.variant = variantId;
  }

  const inventoryItems = await Inventory.find(query);
  const totalPhysicalInventory = inventoryItems.length;

  if (totalPhysicalInventory < quantity) {
    return false; // Not enough total physical assets even exist
  }

  // 2. Find all existing active rentals for this product/variant that overlap with the requested dates
  // Existing Start < Requested End AND Existing End > Requested Start
  const overlappingRentals = await Rental.find({
    product: productId,
    ...(variantId && { variant: variantId }),
    status: {
      $in: ['CONFIRMED', 'PICKUP_PENDING', 'ACTIVE', 'RETURN_PENDING', 'OVERDUE'],
    },
    startDate: { $lt: requestedEnd },
    endDate: { $gt: requestedStart },
  });

  // Calculate remaining available inventory
  const availableInventory = totalPhysicalInventory - overlappingRentals.length;

  return availableInventory >= quantity;
};
