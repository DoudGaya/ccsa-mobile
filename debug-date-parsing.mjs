// Test date parsing
const parseNINDate = (dateString) => {
  if (!dateString) return '';
  
  console.log(`Testing date parsing for: "${dateString}"`);
  
  // Handle dd-mm-yyyy format
  const datePattern = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
  const match = dateString.match(datePattern);
  
  if (match) {
    const [, day, month, year] = match;
    // Convert to ISO format (yyyy-mm-dd)
    const result = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    console.log(`✅ Parsed dd-mm-yyyy: "${dateString}" -> "${result}"`);
    return result;
  }
  
  // If it doesn't match dd-mm-yyyy, try to parse as-is
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const result = date.toISOString().split('T')[0]; // Return yyyy-mm-dd format
    console.log(`✅ Parsed as-is: "${dateString}" -> "${result}"`);
    return result;
  }
  
  console.warn(`❌ Could not parse date: ${dateString}`);
  return '';
};

// Test backend date parsing
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  console.log(`Backend parsing date: "${dateString}"`);
  
  // Try to parse the date string
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn(`❌ Backend: Invalid date format: ${dateString}`);
    return null;
  }
  
  console.log(`✅ Backend: Successfully parsed date: ${dateString} -> ${date.toISOString()}`);
  return date;
};

// Test various date formats
console.log('=== Testing Date Parsing ===');

// Test NIN API format (dd-mm-yyyy)
const testDates = [
  '15-08-1990',  // dd-mm-yyyy
  '5-1-1995',    // d-m-yyyy
  '1990-08-15',  // yyyy-mm-dd
  '1995-01-05',  // yyyy-mm-dd
  '15/08/1990',  // dd/mm/yyyy
  '08/15/1990',  // mm/dd/yyyy
  'invalid-date',
  '',
  null
];

testDates.forEach(dateString => {
  console.log(`\n--- Testing: "${dateString}" ---`);
  const ninParsed = parseNINDate(dateString);
  const backendParsed = parseDate(ninParsed);
  console.log(`Final result: ${backendParsed ? backendParsed.toISOString() : 'null'}`);
});

console.log('\n=== Test Complete ===');
