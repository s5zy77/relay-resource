import Rental from '../models/rentalModel';
import Inventory from '../models/inventoryModel';

/**
 * Inventory Intelligence Service
 * 
 * Provides forecasting, utilization analytics, and
 * predictive maintenance suggestions. This powers
 * the AI agent's ability to proactively recommend
 * business decisions.
 */

export interface InventoryForecast {
  productId: string;
  currentUtilization: number;
  upcomingRentals: number;
  projectedUtilization: number;
  recommendation: string;
  maintenanceAlerts: MaintenanceAlert[];
}

interface MaintenanceAlert {
  inventoryId: string;
  serialNumber: string;
  rentalCount: number;
  suggestion: string;
}

export const getInventoryIntelligence = async (
  productId: string
): Promise<InventoryForecast> => {
  // 1. Current utilization
  const totalItems = await Inventory.countDocuments({
    product: productId,
    status: { $nin: ['UNAVAILABLE'] },
  });
  const onRental = await Inventory.countDocuments({
    product: productId,
    status: 'ON_RENTAL',
  });
  const currentUtilization = totalItems > 0 ? onRental / totalItems : 0;

  // 2. Upcoming rentals in the next 7 days
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const upcomingRentals = await Rental.countDocuments({
    product: productId,
    startDate: { $gte: now, $lte: nextWeek },
    status: { $in: ['CONFIRMED', 'PICKUP_PENDING'] },
  });

  // 3. Projected utilization
  const projectedOnRental = onRental + upcomingRentals;
  const projectedUtilization = totalItems > 0
    ? Math.min(1, projectedOnRental / totalItems)
    : 0;

  // 4. Generate recommendation
  let recommendation: string;
  if (projectedUtilization >= 0.95) {
    recommendation = 'CRITICAL: Near 100% projected utilization. Consider acquiring more inventory or pausing new bookings.';
  } else if (projectedUtilization >= 0.8) {
    recommendation = 'WARNING: High projected utilization. Monitor closely and consider surge pricing.';
  } else if (projectedUtilization <= 0.2) {
    recommendation = 'LOW DEMAND: Consider promotional pricing or marketing campaigns to increase bookings.';
  } else {
    recommendation = 'HEALTHY: Utilization is within normal range.';
  }

  // 5. Maintenance alerts — items with high rental count
  const inventoryItems = await Inventory.find({ product: productId });
  const maintenanceAlerts: MaintenanceAlert[] = [];

  for (const item of inventoryItems) {
    // Count how many rentals this specific inventory item has had
    const rentalCount = await Rental.countDocuments({
      inventory: item._id,
      status: { $in: ['COMPLETED', 'RETURNED', 'ACTIVE'] },
    });

    if (rentalCount >= 10) {
      maintenanceAlerts.push({
        inventoryId: item._id.toString(),
        serialNumber: item.serialNumber || 'N/A',
        rentalCount,
        suggestion: `${rentalCount} rentals completed. Schedule preventive maintenance inspection.`,
      });
    } else if (rentalCount >= 5 && item.status === 'AVAILABLE') {
      maintenanceAlerts.push({
        inventoryId: item._id.toString(),
        serialNumber: item.serialNumber || 'N/A',
        rentalCount,
        suggestion: `${rentalCount} rentals completed. Consider routine check before next rental.`,
      });
    }
  }

  return {
    productId,
    currentUtilization,
    upcomingRentals,
    projectedUtilization,
    recommendation,
    maintenanceAlerts,
  };
};

/**
 * Get fleet-wide utilization summary
 */
export const getFleetUtilization = async () => {
  const totalItems = await Inventory.countDocuments({ status: { $nin: ['UNAVAILABLE'] } });
  const onRental = await Inventory.countDocuments({ status: 'ON_RENTAL' });
  const onMaintenance = await Inventory.countDocuments({ status: 'MAINTENANCE' });
  const available = await Inventory.countDocuments({ status: 'AVAILABLE' });

  return {
    total: totalItems,
    onRental,
    onMaintenance,
    available,
    utilizationRate: totalItems > 0 ? Math.round((onRental / totalItems) * 100) : 0,
    maintenanceRate: totalItems > 0 ? Math.round((onMaintenance / totalItems) * 100) : 0,
  };
};
