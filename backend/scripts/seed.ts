import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/userModel';
import Category from '../src/models/categoryModel';
import Product from '../src/models/productModel';
import Variant from '../src/models/variantModel';
import Inventory from '../src/models/inventoryModel';
import Rental from '../src/models/rentalModel';
import { connectDB } from '../src/config/db';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Variant.deleteMany();
    await Inventory.deleteMany();
    await Rental.deleteMany();

    // 1. Seed Users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@relay.com',
      password: 'password123', // Will be hashed by pre-save hook
      role: 'ADMIN',
    });

    const customerA = await User.create({
      name: 'Customer A',
      email: 'customera@example.com',
      password: 'password123',
      role: 'CUSTOMER',
    });

    const customerB = await User.create({
      name: 'Customer B (Overdue)',
      email: 'customerb@example.com',
      password: 'password123',
      role: 'CUSTOMER',
    });

    // 2. Seed Categories
    const cameraCategory = await Category.create({
      name: 'Cameras',
      description: 'Professional Cameras',
      slug: 'cameras',
    });

    // 3. Seed Products
    const productA = await Product.create({
      name: 'Sony A7 IV',
      description: 'Full-frame mirrorless camera',
      category: cameraCategory._id,
      basePrice: 5000,
      baseDeposit: 25000,
      status: 'ACTIVE',
      productType: 'RENTAL_ASSET',
    });

    // 4. Seed Variants
    const variantA = await Variant.create({
      product: productA._id,
      sku: 'SONY-A7IV-BODY',
      name: 'Body Only',
      priceAdjustment: 0,
    });

    // 5. Seed Inventory
    const inv1 = await Inventory.create({
      product: productA._id,
      variant: variantA._id,
      serialNumber: 'SN-001',
      status: 'ON_RENTAL',
    });

    const inv2 = await Inventory.create({
      product: productA._id,
      variant: variantA._id,
      serialNumber: 'SN-002',
      status: 'ON_RENTAL', // For overdue
    });

    await Inventory.create({
      product: productA._id,
      variant: variantA._id,
      serialNumber: 'SN-003',
      status: 'AVAILABLE',
    });

    // 6. Seed Rentals (Scenarios for Demo)
    const now = new Date();
    
    // Scenario A: Active Rental (Due Tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    await Rental.create({
      customer: customerA._id,
      product: productA._id,
      variant: variantA._id,
      inventory: inv1._id,
      startDate: now,
      endDate: tomorrow,
      status: 'ACTIVE',
      basePrice: 5000,
      depositAmount: 25000,
      totalPrice: 5000,
    });

    // Scenario B: Overdue Rental (Due Yesterday)
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    await Rental.create({
      customer: customerB._id,
      product: productA._id,
      variant: variantA._id,
      inventory: inv2._id,
      startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endDate: yesterday,
      status: 'OVERDUE',
      basePrice: 5000,
      depositAmount: 25000,
      totalPrice: 5000,
    });

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

seedData();
