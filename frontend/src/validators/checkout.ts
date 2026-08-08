import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(6, 'Valid PIN/ZIP code is required'),
  country: z.string().min(2, 'Country is required')
});

export const dateRangeSchema = z.object({
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid start date required'),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid end date required')
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate']
});
