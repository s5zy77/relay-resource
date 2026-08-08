import { Request, Response, NextFunction } from 'express';
import Cart from '../models/cartModel';
import Product from '../models/productModel';
import Rental from '../models/rentalModel';
import Order from '../models/orderModel';
import { checkAvailability } from '../services/availabilityService';

// @desc    Checkout Cart (Validates availability, prices, creates rentals & order)
// @route   POST /api/cart/checkout
// @access  Private
export const checkoutCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error('Cart is empty');
    }

    let totalPrice = 0;
    let totalDeposit = 0;
    const rentalsToCreate = [];

    // 1. Validate Cart Items (Availability & Pricing)
    for (const item of cart.items) {
      const isAvailable = await checkAvailability(
        item.product._id.toString(),
        item.variant?.toString(),
        item.startDate,
        item.endDate,
        item.quantity
      );

      if (!isAvailable) {
        res.status(400);
        const productName = (item.product as any).name || 'Unknown';
        throw new Error(`Product ${productName} is not available for requested dates.`);
      }

      // 2. Fetch Pricing (Simplified for now, assumes basePrice * days)
      const days = Math.ceil((new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / (1000 * 3600 * 24));
      const productObj: any = item.product;
      const itemPrice = (productObj.basePrice * days) * item.quantity;
      const itemDeposit = productObj.baseDeposit * item.quantity;

      totalPrice += itemPrice;
      totalDeposit += itemDeposit;

      // 3. Prepare Rentals
      for (let i = 0; i < item.quantity; i++) {
        rentalsToCreate.push({
          customer: req.user._id,
          product: productObj._id,
          variant: item.variant,
          startDate: item.startDate,
          endDate: item.endDate,
          status: 'CONFIRMED', // State machine jump to confirmed upon order
          basePrice: productObj.basePrice * days,
          depositAmount: productObj.baseDeposit,
          totalPrice: productObj.basePrice * days,
        });
      }
    }

    // 4. Create Rentals
    const createdRentals = await Rental.insertMany(rentalsToCreate);
    const rentalIds = createdRentals.map(r => r._id);

    // 5. Create Order
    const order = new Order({
      customer: req.user._id,
      rentals: rentalIds,
      totalPrice,
      totalDeposit,
      status: 'PENDING',
    });

    const createdOrder = await order.save();

    // 6. Clear Cart
    cart.items = [] as any;
    await cart.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};
