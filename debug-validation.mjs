// Debug script to check form validation
import { farmerSchema } from '../src/utils/validation.js';

// Test the exact structure that would be sent by the form
const testFormData = {
  nin: '12345678901',
  personalInfo: {
    firstName: 'John',
    middleName: 'Doe',
    lastName: 'Smith',
    dateOfBirth: '1990-01-01',
    gender: 'MALE',
    maritalStatus: 'SINGLE',
    employmentStatus: 'EMPLOYED',
  },
  contactInfo: {
    phoneNumber: '08012345678',
    whatsAppNumber: '08012345678',
    email: 'john@example.com',
    address: '123 Main Street',
    state: 'LAGOS',
    localGovernment: 'Ikeja',
    ward: 'Ward 1',
    pollingUnit: 'PU001',
    cluster: 'SOUTH_WEST',
    coordinates: null,
  },
  bankInfo: {
    bvn: '12345678901',
    bankName: 'Access Bank',
    accountNumber: '1234567890',
    accountName: 'John Doe Smith',
  },
  referees: [
    { fullName: 'Jane Doe', phoneNumber: '08087654321', relation: 'Sister' },
  ],
};

console.log('Testing form validation...');
try {
  const validated = farmerSchema.parse(testFormData);
  console.log('✅ Validation passed!');
  console.log('Validated data:', JSON.stringify(validated, null, 2));
} catch (error) {
  console.error('❌ Validation failed:');
  console.error(error.issues);
}
