import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number')
});

export const vendorSignupSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  email: z.string().email('Valid business email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  gstNumber: z.string().min(15, 'Valid 15-character GST number is required').max(15),
  category: z.string().min(2, 'Category selection is required')
});
