import { z } from 'zod';

// Nigerian NIN validation (11 digits)
export const ninSchema = z.string()
  .length(11, 'NIN must be exactly 11 digits')
  .regex(/^\d{11}$/, 'NIN must contain only digits');

// Nigerian phone number validation (11 digits starting with 0)
export const phoneSchema = z.string()
  .length(11, 'Phone number must be exactly 11 digits')
  .regex(/^0[7-9]\d{9}$/, 'Invalid Nigerian phone number format');

// BVN validation (11 digits)
export const bvnSchema = z.string()
  .length(11, 'BVN must be exactly 11 digits')
  .regex(/^\d{11}$/, 'BVN must contain only digits');

// Account number validation (10 digits)
export const accountNumberSchema = z.string()
  .length(10, 'Account number must be exactly 10 digits')
  .regex(/^\d{10}$/, 'Account number must contain only digits');

// Personal info schema
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.union([
    z.string().min(1),
    z.literal(''),
    z.undefined(),
  ]).optional(),
  gender: z.enum(['M', 'F', 'MALE', 'FEMALE'], { required_error: 'Gender is required' }),
  maritalStatus: z.string().min(1, 'Marital status is required'),
  employmentStatus: z.string().min(1, 'Employment status is required'),
  state: z.string().optional(),
  lga: z.string().optional(),
});

// Contact info schema
export const contactInfoSchema = z.object({
  phoneNumber: phoneSchema,
  whatsAppNumber: z.union([
    phoneSchema,
    z.literal(''),
    z.undefined(),
  ]).optional(),
  email: z.union([
    z.string().email('Invalid email format'),
    z.literal(''),
    z.undefined(),
  ]).optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  state: z.string().min(1, 'State is required'),
  localGovernment: z.string().min(1, 'Local Government is required'),
  ward: z.string().min(1, 'Ward is required'),
  pollingUnit: z.string().optional(),
  cluster: z.string().optional(),
  coordinates: z.union([
    z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
    z.null(),
    z.undefined(),
  ]).optional(),
});

// Bank info schema
export const bankInfoSchema = z.object({
  bvn: bvnSchema,
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: accountNumberSchema,
  accountName: z.string().min(2, 'Account name must be at least 2 characters'),
});

// Referee schema
export const refereeSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: phoneSchema,
  relation: z.string().min(1, 'Relation is required'),
});

// Farm info schema (optional)
export const farmInfoSchema = z.object({
  farmLocation: z.string().optional(),
  farmSize: z.string().optional(),
  farmCategory: z.string().optional(),
  landforms: z.enum(['lowland', 'highland']).optional(),
  farmOwnership: z.string().optional(),
  farmState: z.string().optional(),
  farmLocalGovt: z.string().optional(),
  farmWard: z.string().optional(),
  farmPollingUnit: z.string().optional(),
  primaryCrop: z.string().optional(),
  secondaryCrop: z.string().optional(),
  farmSeason: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  farmPolygon: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
  })).optional(),
});

// Complete farmer schema
export const farmerSchema = z.object({
  nin: ninSchema,
  personalInfo: personalInfoSchema,
  contactInfo: contactInfoSchema,
  bankInfo: bankInfoSchema,
  referees: z.array(refereeSchema).min(1, 'At least one referee is required').max(3, 'Maximum 3 referees allowed'),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Registration schema
export const registrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phoneNumber: phoneSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
});
