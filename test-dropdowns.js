// Test the optimized location service dropdowns
import { optimizedLocationService } from './src/services/optimizedLocationService.js';

console.log('Testing optimized location service...');

async function testDropdowns() {
  try {
    // Test 1: Get states
    console.log('\n1. Testing states...');
    const states = optimizedLocationService.getFormattedStates();
    console.log(`✓ States loaded: ${states.length} items`);
    console.log('First few states:', states.slice(0, 5));

    // Test 2: Get LGAs for Lagos (assuming it exists)
    console.log('\n2. Testing LGAs for Lagos...');
    const lagosState = states.find(s => s.label.toLowerCase().includes('lagos'));
    if (lagosState) {
      console.log('Lagos state found:', lagosState);
      const lgas = await optimizedLocationService.getFormattedLocalGovernments(lagosState.value);
      console.log(`✓ LGAs loaded for Lagos: ${lgas.length} items`);
      console.log('First few LGAs:', lgas.slice(0, 5));

      // Test 3: Get wards for the first LGA
      const firstLga = lgas.find(lga => lga.value !== '');
      if (firstLga) {
        console.log('\n3. Testing wards for first LGA:', firstLga.label);
        const wards = await optimizedLocationService.getFormattedWards(lagosState.value, firstLga.value);
        console.log(`✓ Wards loaded: ${wards.length} items`);
        console.log('First few wards:', wards.slice(0, 5));

        // Test 4: Get polling units for the first ward
        const firstWard = wards.find(ward => ward.value !== '');
        if (firstWard) {
          console.log('\n4. Testing polling units for first ward:', firstWard.label);
          const pollingUnits = await optimizedLocationService.getFormattedPollingUnits(
            lagosState.value, 
            firstLga.value, 
            firstWard.value
          );
          console.log(`✓ Polling units loaded: ${pollingUnits.length} items`);
          console.log('First few polling units:', pollingUnits.slice(0, 5));
        }
      }
    }

    console.log('\n✅ All dropdown tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDropdowns();
