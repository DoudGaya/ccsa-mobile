// Debug validation test
import { z } from 'zod';

// Recreate the validation schemas for testing
const phoneSchema = z.string()
  .length(11, 'Phone number must be exactly 11 digits')
  .regex(/^0[7-9]\d{9}$/, 'Invalid Nigerian phone number format');

const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['M', 'F', 'MALE', 'FEMALE'], { required_error: 'Gender is required' }),
  maritalStatus: z.string().min(1, 'Marital status is required'),
  employmentStatus: z.string().min(1, 'Employment status is required'),
  state: z.string().optional(),
  lga: z.string().optional(),
});

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

const bankInfoSchema = z.object({
  bvn: z.string().length(11, 'BVN must be exactly 11 digits'),
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().length(10, 'Account number must be exactly 10 digits'),
  accountName: z.string().min(2, 'Account name must be at least 2 characters'),
});

const refereeSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: phoneSchema,
  relation: z.string().min(1, 'Relation is required'),
});

const farmerSchema = z.object({
  nin: z.string().length(11, 'NIN must be exactly 11 digits'),
  personalInfo: personalInfoSchema,
  contactInfo: contactInfoSchema,
  bankInfo: bankInfoSchema,
  referees: z.array(refereeSchema).min(1, 'At least one referee is required').max(3, 'Maximum 3 referees allowed'),
});

// Test data structure
const testData = {
  nin: '81392154948',
  personalInfo: {
    firstName: 'ABDULRAHMAN',
    middleName: 'DAUDA',
    lastName: 'GAYA',
    dateOfBirth: '1990-08-15',
    gender: 'MALE',
    maritalStatus: 'SINGLE',
    employmentStatus: 'EMPLOYED',
    state: 'Kano',
    lga: 'Tarauni',
  },
  contactInfo: {
    phoneNumber: '08062249834',
    whatsAppNumber: '08062249834',
    email: 'doudgaya@gmail.com',
    address: 'Abdulrahman Street, Kano',
    state: 'KANO',
    localGovernment: 'Tarauni',
    ward: 'Ku duka',
    pollingUnit: '',
    cluster: '',
    coordinates: null,
  },
  bankInfo: {
    bvn: '22179904743',
    bankName: 'GTB',
    accountNumber: '0164769945',
    accountName: 'ABDULRAHMAN DAUDA GAYA',
  },
  referees: [
    {
      fullName: 'Yusuf Dauda',
      phoneNumber: '08012345678',
      relation: 'Brother',
    },
    {
      fullName: 'Rabi Dauda',
      phoneNumber: '08012345679',
      relation: 'Sister',
    },
    {
      fullName: 'Umar Dauda',
      phoneNumber: '08012345600',
      relation: 'Brother',
    },
  ],
};

console.log('=== Testing Form Validation ===\n');

// Test each section individually
console.log('1. Testing Personal Info...');
try {
  const personalResult = personalInfoSchema.parse(testData.personalInfo);
  console.log('✅ Personal Info validation passed');
} catch (error) {
  console.log('❌ Personal Info validation failed:');
  console.log(error.issues);
}

console.log('\n2. Testing Contact Info...');
try {
  const contactResult = contactInfoSchema.parse(testData.contactInfo);
  console.log('✅ Contact Info validation passed');
} catch (error) {
  console.log('❌ Contact Info validation failed:');
  console.log(error.issues);
}

console.log('\n3. Testing Bank Info...');
try {
  const bankResult = bankInfoSchema.parse(testData.bankInfo);
  console.log('✅ Bank Info validation passed');
} catch (error) {
  console.log('❌ Bank Info validation failed:');
  console.log(error.issues);
}

console.log('\n4. Testing Referees...');
try {
  const refereesResult = z.array(refereeSchema).parse(testData.referees);
  console.log('✅ Referees validation passed');
} catch (error) {
  console.log('❌ Referees validation failed:');
  console.log(error.issues);
}

console.log('\n5. Testing Complete Form...');
try {
  const completeResult = farmerSchema.parse(testData);
  console.log('✅ Complete form validation passed');
} catch (error) {
  console.log('❌ Complete form validation failed:');
  console.log(error.issues);
}

console.log('\n=== Test Complete ===');
