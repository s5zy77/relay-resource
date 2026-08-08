import { Request, Response, NextFunction } from 'express';
import Product from '../models/productModel';
import Inventory from '../models/inventoryModel';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({}).populate('category');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Get product availability (Mock basic availability for now)
// @route   GET /api/products/:id/availability
// @access  Public
export const getProductAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Count how many inventory items are AVAILABLE for this product
    const count = await Inventory.countDocuments({
      product: req.params.id,
      status: 'AVAILABLE',
    });
    res.json({ productId: req.params.id, availableQuantity: count });
  } catch (error) {
    next(error);
  }
};
