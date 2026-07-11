import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8).max(200)
});

export const customerSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  email: z.union([z.literal(""), z.email()]).optional(),
  city: z.string().trim().max(100).optional(),
  privacyAccepted: z.literal("on")
});

export const productSchema = z.object({
  sku: z.string().trim().min(2).max(50).transform((v) => v.toUpperCase()),
  name: z.string().trim().min(2).max(150),
  category: z.string().trim().min(2).max(80),
  brand: z.string().trim().max(80).optional(),
  cost: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0).max(100000),
  minimumStock: z.coerce.number().int().min(0).max(100000),
  imageUrl: z.string().optional()
});

export const repairSchema = z.object({
  customerId: z.string().min(1),
  technicianId: z.string().optional(),
  brand: z.string().trim().min(2).max(80),
  model: z.string().trim().min(1).max(100),
  color: z.string().trim().max(50).optional(),
  serialNumber: z.string().trim().max(100).optional(),
  imei: z.string().trim().max(30).optional(),
  issue: z.string().trim().min(5).max(2000),
  physicalCondition: z.string().trim().max(2000).optional(),
  accessories: z.string().trim().max(1000).optional(),
  initialEstimate: z.coerce.number().min(0),
  deposit: z.coerce.number().min(0),
  promisedAt: z.string().optional(),
  photosJson: z.string().optional()
});
