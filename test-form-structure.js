// Quick test to verify form structure
const testFormData = {
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

console.log('Form data structure test:');
console.log(JSON.stringify(testFormData, null, 2));

// Test how backend transforms the data
const transformedData = {
  nin: testFormData.nin,
  // Personal info from NIN
  firstName: testFormData.personalInfo.firstName,
  middleName: testFormData.personalInfo.middleName,
  lastName: testFormData.personalInfo.lastName,
  dateOfBirth: testFormData.personalInfo.dateOfBirth ? new Date(testFormData.personalInfo.dateOfBirth) : null,
  gender: testFormData.personalInfo.gender,
  state: testFormData.personalInfo.state || testFormData.contactInfo.state,
  lga: testFormData.personalInfo.lga || testFormData.contactInfo.localGovernment,
  maritalStatus: testFormData.personalInfo.maritalStatus,
  employmentStatus: testFormData.personalInfo.employmentStatus,
  // Contact info (manual entry)
  phone: testFormData.contactInfo.phoneNumber,
  email: testFormData.contactInfo.email || null,
  whatsAppNumber: testFormData.contactInfo.whatsAppNumber || null,
  address: testFormData.contactInfo.address,
  ward: testFormData.contactInfo.ward,
  latitude: testFormData.contactInfo.coordinates?.latitude,
  longitude: testFormData.contactInfo.coordinates?.longitude,
  // Bank info
  bankName: testFormData.bankInfo.bankName,
  accountNumber: testFormData.bankInfo.accountNumber,
  bvn: testFormData.bankInfo.bvn,
};

console.log('\nTransformed data for backend:');
console.log(JSON.stringify(transformedData, null, 2));

// Test referee transformation
const transformedReferees = testFormData.referees.map(referee => ({
  firstName: referee.fullName.split(' ')[0] || '',
  lastName: referee.fullName.split(' ').slice(1).join(' ') || '',
  phone: referee.phoneNumber,
  relationship: referee.relation,
}));

console.log('\nTransformed referees:');
console.log(JSON.stringify(transformedReferees, null, 2));
