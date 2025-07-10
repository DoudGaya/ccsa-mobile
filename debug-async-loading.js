// Debug the async loading in React Native context
import { optimizedLocationService } from './src/services/optimizedLocationService.js';

console.log('🔍 Debugging location service async loading...');

async function debugAsyncLoading() {
  try {
    console.log('\n1. Testing async states loading...');
    const states = await optimizedLocationService.getFormattedStates();
    console.log(`✅ States loaded: ${states.length} items`);
    
    if (states.length > 0) {
      console.log('✅ First few states:', states.slice(0, 5).map(s => s.label));
      
      // Test LGA loading
      const firstState = states.find(s => s.value !== '');
      if (firstState) {
        console.log('\n2. Testing LGA loading for:', firstState.label);
        const lgas = await optimizedLocationService.getFormattedLocalGovernments(firstState.value);
        console.log(`✅ LGAs loaded: ${lgas.length} items`);
        
        if (lgas.length > 0) {
          console.log('✅ First few LGAs:', lgas.slice(0, 3).map(l => l.label));
          
          // Test ward loading
          const firstLga = lgas.find(l => l.value !== '');
          if (firstLga) {
            console.log('\n3. Testing ward loading for:', firstLga.label);
            const wards = await optimizedLocationService.getFormattedWards(firstState.value, firstLga.value);
            console.log(`✅ Wards loaded: ${wards.length} items`);
            
            if (wards.length > 0) {
              console.log('✅ First few wards:', wards.slice(0, 3).map(w => w.label));
              
              // Test polling unit loading
              const firstWard = wards.find(w => w.value !== '');
              if (firstWard) {
                console.log('\n4. Testing polling unit loading for:', firstWard.label);
                const pollingUnits = await optimizedLocationService.getFormattedPollingUnits(
                  firstState.value, 
                  firstLga.value, 
                  firstWard.value
                );
                console.log(`✅ Polling units loaded: ${pollingUnits.length} items`);
                console.log('✅ First few polling units:', pollingUnits.slice(0, 3).map(p => p.label));
              }
            }
          }
        }
      }
    } else {
      console.log('❌ No states loaded - this is the problem!');
    }

    console.log('\n🎉 All async tests completed successfully!');
  } catch (error) {
    console.error('❌ Async test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}

// Run the debug test
debugAsyncLoading();
