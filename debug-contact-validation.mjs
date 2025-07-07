// Simple test for contactInfo validation
import { z } from 'zod';

// Nigerian phone number validation (11 digits starting with 0)
const phoneSchema = z.string()
  .length(11, 'Phone number must be exactly 11 digits')
  .regex(/^0[7-9]\d{9}$/, 'Invalid Nigerian phone number format');

// Contact info schema
const contactInfoSchema = z.object({
  phoneNumber: phoneSchema,
  whatsAppNumber: phoneSchema.optional().or(z.literal('')),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
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

// Test contactInfo data
const testContactInfo = {
  phoneNumber: '08012345678',
  whatsAppNumber: '',
  email: '',
  address: '123 Main Street, Lagos',
  state: 'LAGOS',
  localGovernment: 'Ikeja',
  ward: 'Ward 1',
  pollingUnit: '',
  cluster: '',
  coordinates: null,
};

console.log('Testing contactInfo validation...');
try {
  const validated = contactInfoSchema.parse(testContactInfo);
  console.log('✅ ContactInfo validation passed!');
} catch (error) {
  console.error('❌ ContactInfo validation failed:');
  console.error(error.issues);
}
