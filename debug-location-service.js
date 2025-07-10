const fs = require('fs');
const path = require('path');

console.log('=== DEBUG LOCATION SERVICE ===');

try {
  // Read the nigeria.json file
  const nigeriaDataPath = path.join(__dirname, 'assets', 'nigeria.json');
  console.log('Reading file from:', nigeriaDataPath);
  
  const rawData = fs.readFileSync(nigeriaDataPath, 'utf8');
  console.log('File size (MB):', (rawData.length / 1024 / 1024).toFixed(2));
  
  const nigeriaData = JSON.parse(rawData);
  
  // Check if data loads
  console.log('Nigeria data loaded:', !!nigeriaData);
  console.log('Nigeria data type:', typeof nigeriaData);
  console.log('Nigeria data length:', Array.isArray(nigeriaData) ? nigeriaData.length : 'Not an array');

  if (Array.isArray(nigeriaData) && nigeriaData.length > 0) {
    console.log('First state:', nigeriaData[0]);
    
    // Check Abia state specifically
    const abiaState = nigeriaData.find(state => state.state === 'abia');
    if (abiaState) {
      console.log('Abia state found:', abiaState.state);
      console.log('Abia LGAs count:', abiaState.lgas ? abiaState.lgas.length : 'No LGAs');
      
      if (abiaState.lgas && abiaState.lgas.length > 0) {
        const firstLga = abiaState.lgas[0];
        console.log('First LGA:', firstLga.lga);
        console.log('First LGA wards count:', firstLga.wards ? firstLga.wards.length : 'No wards');
        
        if (firstLga.wards && firstLga.wards.length > 0) {
          const firstWard = firstLga.wards[0];
          console.log('First ward:', firstWard.ward);
          console.log('First ward polling units count:', firstWard.polling_units ? firstWard.polling_units.length : 'No polling units');
        }
      }
    } else {
      console.log('Abia state not found');
    }
    
    // Test formatting function
    const formatName = (name) => {
      if (!name) return '';
      return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };
    
    // Test getting states
    try {
      const states = nigeriaData.map(state => ({
        id: state.state,
        name: formatName(state.state),
        value: state.state
      }));
      console.log('States processed successfully:', states.length);
      console.log('First few states:', states.slice(0, 3));
    } catch (error) {
      console.error('Error processing states:', error);
    }
    
  } else {
    console.error('Nigeria data is not a valid array');
  }
  
} catch (error) {
  console.error('Error loading nigeria.json:', error.message);
}

console.log('=== END DEBUG ===');
