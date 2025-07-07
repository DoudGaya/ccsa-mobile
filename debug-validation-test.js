const { z } = require('zod');

// Copy the validation schemas here for testing
const ninSchema = z.string()
  .length(11, 'NIN must be exactly 11 digits')
  .regex(/^\d{11}$/, 'NIN must contain only digits');

const phoneSchema = z.string()
  .length(11, 'Phone number must be exactly 11 digits')
  .regex(/^0[7-9]\d{9}$/, 'Invalid Nigerian phone number format');

const bvnSchema = z.string()
  .length(11, 'BVN must be exactly 11 digits')
  .regex(/^\d{11}$/, 'BVN must contain only digits');

const accountNumberSchema = z.string()
  .length(10, 'Account number must be exactly 10 digits')
  .regex(/^\d{10}$/, 'Account number must contain only digits');

const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['M', 'F', 'MALE', 'FEMALE'], { required_error: 'Gender is required' }),
  maritalStatus: z.string().min(1, 'Marital status is required'),
  employmentStatus: z.string().min(1, 'Employment status is required'),
  state: z.string().optional().or(z.literal('')),
  lga: z.string().optional().or(z.literal('')),
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
  bvn: bvnSchema,
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: accountNumberSchema,
  accountName: z.string().min(2, 'Account name must be at least 2 characters'),
});

const refereeSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: phoneSchema,
  relation: z.string().min(1, 'Relation is required'),
});

const farmerSchema = z.object({
  nin: ninSchema,
  personalInfo: personalInfoSchema,
  contactInfo: contactInfoSchema,
  bankInfo: bankInfoSchema,
  referees: z.array(refereeSchema).min(1, 'At least one referee is required').max(3, 'Maximum 3 referees allowed'),
});

// Test data that should match the form structure
const testData = {
  nin: '12345678901',
  personalInfo: {
    firstName: 'John',
    middleName: 'Doe',
    lastName: 'Smith',
    dateOfBirth: '1990-01-15',
    gender: 'MALE',
    maritalStatus: 'SINGLE',
    employmentStatus: 'EMPLOYED',
    state: 'LAGOS',
    lga: 'IKEJA',
  },
  contactInfo: {
    phoneNumber: '08012345678',
    whatsAppNumber: '08012345678',
    email: 'john.doe@email.com',
    address: '123 Main Street, Lagos',
    state: 'LAGOS',
    localGovernment: 'IKEJA',
    ward: 'WARD 1',
    pollingUnit: '',
    cluster: '',
    coordinates: null,
  },
  bankInfo: {
    bvn: '12345678901',
    bankName: 'ACCESS_BANK',
    accountNumber: '1234567890',
    accountName: 'John Doe Smith',
  },
  referees: [
    {
      fullName: 'Jane Doe',
      phoneNumber: '08087654321',
      relation: 'Sister',
    },
  ],
};

console.log('=== VALIDATION TEST START ===');

// Test individual schemas
console.log('\n1. Testing Personal Info Schema:');
try {
  const personalResult = personalInfoSchema.parse(testData.personalInfo);
  console.log('✅ Personal Info validation passed');
} catch (error) {
  console.log('❌ Personal Info validation failed:', error.errors);
}

console.log('\n2. Testing Contact Info Schema:');
try {
  const contactResult = contactInfoSchema.parse(testData.contactInfo);
  console.log('✅ Contact Info validation passed');
} catch (error) {
  console.log('❌ Contact Info validation failed:', error.errors);
}

console.log('\n3. Testing Bank Info Schema:');
try {
  const bankResult = bankInfoSchema.parse(testData.bankInfo);
  console.log('✅ Bank Info validation passed');
} catch (error) {
  console.log('❌ Bank Info validation failed:', error.errors);
}

console.log('\n4. Testing Referee Schema:');
try {
  const refereeResult = refereeSchema.parse(testData.referees[0]);
  console.log('✅ Referee validation passed');
} catch (error) {
  console.log('❌ Referee validation failed:', error.errors);
}

console.log('\n5. Testing Complete Farmer Schema:');
try {
  const farmerResult = farmerSchema.parse(testData);
  console.log('✅ Complete Farmer validation passed');
  console.log('Parsed data:', JSON.stringify(farmerResult, null, 2));
} catch (error) {
  console.log('❌ Complete Farmer validation failed:');
  console.log('Error details:', error.errors);
}

// Test with empty data to see required field errors
console.log('\n6. Testing with empty data:');
const emptyData = {
  nin: '',
  personalInfo: {
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    employmentStatus: '',
    state: '',
    lga: '',
  },
  contactInfo: {
    phoneNumber: '',
    whatsAppNumber: '',
    email: '',
    address: '',
    state: '',
    localGovernment: '',
    ward: '',
    pollingUnit: '',
    cluster: '',
    coordinates: null,
  },
  bankInfo: {
    bvn: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  },
  referees: [],
};

try {
  const emptyResult = farmerSchema.parse(emptyData);
  console.log('✅ Empty data validation passed (unexpected)');
} catch (error) {
  console.log('❌ Empty data validation failed (expected):');
  error.errors.forEach((err, index) => {
    console.log(`  ${index + 1}. ${err.path.join('.')}: ${err.message}`);
  });
}

console.log('\n=== VALIDATION TEST END ===');
