import Rental from '../models/rentalModel';
import Inventory from '../models/inventoryModel';

/**
 * Dynamic Pricing Engine
 * 
 * Adjusts rental pricing based on real-time demand,
 * rental duration, and seasonal patterns. This is NOT
 * a simple multiplier — it considers actual utilization
 * data from the database.
 */

interface PricingFactors {
  demandMultiplier: number;
  durationDiscount: number;
  seasonalMultiplier: number;
  finalPricePerDay: number;
  breakdown: string[];
}

export const calculateDynamicPrice = async (
  productId: string,
  variantId: string | undefined,
  startDate: Date,
  endDate: Date,
  basePrice: number
): Promise<PricingFactors> => {
  const breakdown: string[] = [];
  let demandMultiplier = 1.0;
  let durationDiscount = 1.0;
  let seasonalMultiplier = 1.0;

  // 1. DEMAND-BASED PRICING — check current utilization rate
  const query: any = { product: productId, status: { $nin: ['UNAVAILABLE', 'MAINTENANCE'] } };
  if (variantId) query.variant = variantId;

  const totalInventory = await Inventory.countDocuments(query);
  const onRental = await Inventory.countDocuments({ ...query, status: 'ON_RENTAL' });

  if (totalInventory > 0) {
    const utilizationRate = onRental / totalInventory;

    if (utilizationRate >= 0.9) {
      demandMultiplier = 1.25; // 25% surge — nearly sold out
      breakdown.push(`High demand surge (+25%): ${Math.round(utilizationRate * 100)}% utilization`);
    } else if (utilizationRate >= 0.7) {
      demandMultiplier = 1.10; // 10% moderate bump
      breakdown.push(`Moderate demand (+10%): ${Math.round(utilizationRate * 100)}% utilization`);
    } else if (utilizationRate <= 0.3) {
      demandMultiplier = 0.90; // 10% discount — low demand incentive
      breakdown.push(`Low demand discount (-10%): ${Math.round(utilizationRate * 100)}% utilization`);
    } else {
      breakdown.push(`Normal demand: ${Math.round(utilizationRate * 100)}% utilization`);
    }
  }

  // 2. DURATION DISCOUNT — longer rentals get better rates
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

  if (days >= 30) {
    durationDiscount = 0.75; // 25% off for monthly
    breakdown.push('Monthly rental discount (-25%)');
  } else if (days >= 14) {
    durationDiscount = 0.85; // 15% off for bi-weekly
    breakdown.push('Bi-weekly rental discount (-15%)');
  } else if (days >= 7) {
    durationDiscount = 0.90; // 10% off for weekly
    breakdown.push('Weekly rental discount (-10%)');
  } else {
    breakdown.push('Standard daily rate');
  }

  // 3. SEASONAL PRICING — based on month patterns
  const month = startDate.getMonth(); // 0-indexed
  // Peak months: wedding season (Oct-Mar in India), holiday season
  const peakMonths = [9, 10, 11, 0, 1, 2]; // Oct through Mar
  if (peakMonths.includes(month)) {
    seasonalMultiplier = 1.15; // 15% peak season
    breakdown.push('Peak season surcharge (+15%)');
  } else {
    breakdown.push('Off-peak season (standard)');
  }

  const finalPricePerDay = Math.round(
    basePrice * demandMultiplier * durationDiscount * seasonalMultiplier * 100
  ) / 100;

  return {
    demandMultiplier,
    durationDiscount,
    seasonalMultiplier,
    finalPricePerDay,
    breakdown,
  };
};
