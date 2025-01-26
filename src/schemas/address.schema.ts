import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().optional(),
  barangay: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  region: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

export type AddressSchemaType = z.infer<typeof addressSchema>;
