// Test the location data files directly
const fs = require('fs');
const path = require('path');

console.log('Testing location data files...');

function testLocationFiles() {
  try {
    // Test 1: Check states.json
    console.log('\n1. Testing states.json...');
    const statesPath = path.join(__dirname, 'assets/location/states.json');
    const statesData = JSON.parse(fs.readFileSync(statesPath, 'utf8'));
    console.log(`✓ States file loaded: ${statesData.length} states`);
    console.log('First few states:', statesData.slice(0, 3).map(s => s.name));

    // Test 2: Check lgas-by-state.json
    console.log('\n2. Testing lgas-by-state.json...');
    const lgasPath = path.join(__dirname, 'assets/location/lgas-by-state.json');
    const lgasData = JSON.parse(fs.readFileSync(lgasPath, 'utf8'));
    const stateKeys = Object.keys(lgasData);
    console.log(`✓ LGAs file loaded: ${stateKeys.length} states with LGAs`);
    
    // Find Lagos and show its LGAs
    const lagosState = statesData.find(s => s.name.toLowerCase().includes('lagos'));
    if (lagosState && lgasData[lagosState.value]) {
      console.log(`Lagos LGAs: ${lgasData[lagosState.value].length} items`);
      console.log('First few Lagos LGAs:', lgasData[lagosState.value].slice(0, 3).map(lga => lga.name));
    }

    // Test 3: Check wards-by-lga.json
    console.log('\n3. Testing wards-by-lga.json...');
    const wardsPath = path.join(__dirname, 'assets/location/wards-by-lga.json');
    const wardsData = JSON.parse(fs.readFileSync(wardsPath, 'utf8'));
    const wardKeys = Object.keys(wardsData);
    console.log(`✓ Wards file loaded: ${wardKeys.length} LGAs with wards`);
    
    // Test a specific LGA
    const firstWardKey = wardKeys[0];
    if (wardsData[firstWardKey]) {
      console.log(`Sample wards for ${firstWardKey}: ${wardsData[firstWardKey].length} items`);
    }

    // Test 4: Check polling-units-by-ward.json
    console.log('\n4. Testing polling-units-by-ward.json...');
    const pollingPath = path.join(__dirname, 'assets/location/polling-units-by-ward.json');
    const pollingData = JSON.parse(fs.readFileSync(pollingPath, 'utf8'));
    const pollingKeys = Object.keys(pollingData);
    console.log(`✓ Polling units file loaded: ${pollingKeys.length} wards with polling units`);
    
    // Test a specific ward
    const firstPollingKey = pollingKeys[0];
    if (pollingData[firstPollingKey]) {
      console.log(`Sample polling units for ${firstPollingKey}: ${pollingData[firstPollingKey].length} items`);
    }

    console.log('\n✅ All location data files are properly structured!');
    
    // Test file sizes
    console.log('\n📊 File sizes:');
    console.log(`states.json: ${(fs.statSync(statesPath).size / 1024).toFixed(1)} KB`);
    console.log(`lgas-by-state.json: ${(fs.statSync(lgasPath).size / 1024).toFixed(1)} KB`);
    console.log(`wards-by-lga.json: ${(fs.statSync(wardsPath).size / 1024).toFixed(1)} KB`);
    console.log(`polling-units-by-ward.json: ${(fs.statSync(pollingPath).size / 1024 / 1024).toFixed(1)} MB`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLocationFiles();
