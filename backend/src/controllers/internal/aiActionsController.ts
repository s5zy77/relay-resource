import { Request, Response, NextFunction } from 'express';
import Rental from '../../models/rentalModel';
import Product from '../../models/productModel';
import Inventory from '../../models/inventoryModel';
import Order from '../../models/orderModel';
import User from '../../models/userModel';
import AuditLog from '../../models/auditLogModel';
import { checkAvailability } from '../../services/availabilityService';
import { calculateLateFee } from '../../services/financialService';

/**
 * AI Tool/Action API Layer
 * 
 * These endpoints are called ONLY by Member 4's AI/LLM agent.
 * They are NOT direct database mutations — each one runs full
 * business-rule validation before any state change.
 * 
 * Every AI action is logged in the AuditLog with actorType: 'AI'.
 */

// @desc    AI Action: Extend a rental's end date
// @route   POST /internal/ai/actions/extend-rental
// @access  Internal (AI Agent only)
export const aiExtendRental = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rentalId, newEndDate, reason, idempotencyKey } = req.body;

    // 1. Idempotency check
    const existingAction = await AuditLog.findOne({
      'metadata.idempotencyKey': idempotencyKey,
    });
    if (existingAction) {
      res.json({ status: 'ALREADY_EXECUTED', auditId: existingAction._id });
      return;
    }

    // 2. Fetch rental
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      res.status(404).json({ error: 'Rental not found' });
      return;
    }

    // 3. Validate: rental must be ACTIVE or OVERDUE to extend
    if (!['ACTIVE', 'OVERDUE'].includes(rental.status)) {
      res.status(400).json({ error: `Cannot extend rental in ${rental.status} state` });
      return;
    }

    // 4. Validate: new end date must be after current end date
    const parsedNewEnd = new Date(newEndDate);
    if (parsedNewEnd <= rental.endDate) {
      res.status(400).json({ error: 'New end date must be after current end date' });
      return;
    }

    // 5. Check availability for the extension window
    const isAvailable = await checkAvailability(
      rental.product.toString(),
      rental.variant?.toString(),
      rental.endDate,
      parsedNewEnd
    );
    if (!isAvailable) {
      res.status(409).json({ error: 'Item not available for extended period' });
      return;
    }

    // 6. Recalculate pricing for the extension
    const product = await Product.findById(rental.product);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const extensionDays = Math.ceil(
      (parsedNewEnd.getTime() - rental.endDate.getTime()) / (1000 * 3600 * 24)
    );
    const extensionCost = product.basePrice * extensionDays;

    // 7. Apply the extension
    const oldEndDate = rental.endDate;
    rental.endDate = parsedNewEnd;
    rental.totalPrice += extensionCost;
    if (rental.status === 'OVERDUE') {
      rental.status = 'ACTIVE'; // Extension clears overdue
    }
    await rental.save();

    // 8. Audit log with AI actor
    const audit = await AuditLog.create({
      actor: rental.customer, // AI acts on behalf of system
      actorType: 'AI',
      action: 'EXTEND_RENTAL',
      entity: 'Rental',
      entityId: rental._id,
      metadata: {
        idempotencyKey,
        reason,
        oldEndDate,
        newEndDate: parsedNewEnd,
        extensionDays,
        extensionCost,
      },
    });

    res.json({
      status: 'SUCCESS',
      rental,
      extensionCost,
      auditId: audit._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Action: Apply a late fee to a rental
// @route   POST /internal/ai/actions/apply-late-fee
// @access  Internal (AI Agent only)
export const aiApplyLateFee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rentalId, idempotencyKey } = req.body;

    // 1. Idempotency check
    const existingAction = await AuditLog.findOne({
      'metadata.idempotencyKey': idempotencyKey,
    });
    if (existingAction) {
      res.json({ status: 'ALREADY_EXECUTED', auditId: existingAction._id });
      return;
    }

    // 2. Fetch rental
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      res.status(404).json({ error: 'Rental not found' });
      return;
    }

    // 3. Validate: must be OVERDUE
    if (rental.status !== 'OVERDUE') {
      res.status(400).json({ error: `Cannot apply late fee to rental in ${rental.status} state` });
      return;
    }

    // 4. Calculate late fee
    const lateFee = calculateLateFee(
      rental.endDate,
      new Date(), // now
      rental.basePrice
    );

    // 5. Apply
    rental.lateFee = lateFee;
    rental.totalPrice += lateFee;
    await rental.save();

    // 6. Audit
    const audit = await AuditLog.create({
      actor: rental.customer,
      actorType: 'AI',
      action: 'APPLY_LATE_FEE',
      entity: 'Rental',
      entityId: rental._id,
      metadata: { idempotencyKey, lateFee },
    });

    res.json({ status: 'SUCCESS', lateFee, rental, auditId: audit._id });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Action: Flag a rental as high risk
// @route   POST /internal/ai/actions/flag-risk
// @access  Internal (AI Agent only)
export const aiFlagRisk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rentalId, riskLevel, riskReason, idempotencyKey } = req.body;

    const existingAction = await AuditLog.findOne({
      'metadata.idempotencyKey': idempotencyKey,
    });
    if (existingAction) {
      res.json({ status: 'ALREADY_EXECUTED', auditId: existingAction._id });
      return;
    }

    const rental = await Rental.findById(rentalId);
    if (!rental) {
      res.status(404).json({ error: 'Rental not found' });
      return;
    }

    const audit = await AuditLog.create({
      actor: rental.customer,
      actorType: 'AI',
      action: 'FLAG_RISK',
      entity: 'Rental',
      entityId: rental._id,
      metadata: { idempotencyKey, riskLevel, riskReason },
    });

    res.json({ status: 'SUCCESS', riskLevel, auditId: audit._id });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Read: Get rental details for AI reasoning
// @route   GET /internal/ai/query/rental/:id
// @access  Internal (AI Agent only)
export const aiGetRentalDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('customer', 'name email role')
      .populate('product', 'name basePrice baseDeposit');

    if (!rental) {
      res.status(404).json({ error: 'Rental not found' });
      return;
    }

    // Enrich with history
    const auditHistory = await AuditLog.find({ entityId: rental._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ rental, auditHistory });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Read: Get customer profile for AI reasoning
// @route   GET /internal/ai/query/customer/:id
// @access  Internal (AI Agent only)
export const aiGetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const rentals = await Rental.find({ customer: req.params.id });
    const overdueCount = rentals.filter(r => r.status === 'OVERDUE').length;
    const completedCount = rentals.filter(r => r.status === 'COMPLETED').length;
    const totalLateFees = rentals.reduce((sum, r) => sum + (r.lateFee || 0), 0);

    res.json({
      customer,
      stats: {
        totalRentals: rentals.length,
        overdueCount,
        completedCount,
        totalLateFees,
        riskScore: overdueCount > 2 ? 'HIGH' : overdueCount > 0 ? 'MEDIUM' : 'LOW',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Read: Get overdue rentals for AI proactive workflows
// @route   GET /internal/ai/query/overdue-rentals
// @access  Internal (AI Agent only)
export const aiGetOverdueRentals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const overdueRentals = await Rental.find({ status: 'OVERDUE' })
      .populate('customer', 'name email')
      .populate('product', 'name');

    res.json({ overdueRentals, count: overdueRentals.length });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Read: Dashboard summary for AI reasoning
// @route   GET /internal/ai/query/dashboard-summary
// @access  Internal (AI Agent only)
export const aiGetDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalRentals = await Rental.countDocuments();
    const activeRentals = await Rental.countDocuments({ status: 'ACTIVE' });
    const overdueRentals = await Rental.countDocuments({ status: 'OVERDUE' });
    const totalInventory = await Inventory.countDocuments();
    const availableInventory = await Inventory.countDocuments({ status: 'AVAILABLE' });
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });

    // Revenue (sum of completed rental totalPrice)
    const completedRentals = await Rental.find({ status: 'COMPLETED' });
    const totalRevenue = completedRentals.reduce((sum, r) => sum + r.totalPrice, 0);

    // Rentals due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = await Rental.countDocuments({
      endDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['ACTIVE'] },
    });

    res.json({
      totalRentals,
      activeRentals,
      overdueRentals,
      totalInventory,
      availableInventory,
      totalOrders,
      totalCustomers,
      totalRevenue,
      dueToday,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Read: Get customer risk profile
// @route   GET /internal/ai/query/risk-profile/:customerId
// @access  Internal (AI Agent only)
export const aiGetRiskProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assessCustomerRisk } = await import('../../services/riskAssessmentService');
    const riskProfile = await assessCustomerRisk(req.params.customerId as string);
    res.json(riskProfile);
  } catch (error) {
    next(error);
  }
};

// @desc    AI Read: Get dynamic pricing quote
// @route   POST /internal/ai/query/dynamic-price
// @access  Internal (AI Agent only)
export const aiGetDynamicPrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, variantId, startDate, endDate } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const { calculateDynamicPrice } = await import('../../services/dynamicPricingService');
    const pricing = await calculateDynamicPrice(
      productId,
      variantId,
      new Date(startDate),
      new Date(endDate),
      product.basePrice
    );

    res.json({ basePrice: product.basePrice, ...pricing });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Read: Get inventory intelligence for a product
// @route   GET /internal/ai/query/inventory-intelligence/:productId
// @access  Internal (AI Agent only)
export const aiGetInventoryIntelligence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { getInventoryIntelligence } = await import('../../services/inventoryIntelligenceService');
    const forecast = await getInventoryIntelligence(req.params.productId as string);
    res.json(forecast);
  } catch (error) {
    next(error);
  }
};

// @desc    AI Read: Get fleet-wide utilization
// @route   GET /internal/ai/query/fleet-utilization
// @access  Internal (AI Agent only)
export const aiGetFleetUtilization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { getFleetUtilization } = await import('../../services/inventoryIntelligenceService');
    const utilization = await getFleetUtilization();
    res.json(utilization);
  } catch (error) {
    next(error);
  }
};
