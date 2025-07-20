// Quick verification of the hierarchical data import
import hierarchicalData from '../data/states-and-lgas-and-wards-and-polling-units.json';

console.log('Hierarchical data verification:');
console.log('Type:', typeof hierarchicalData);
console.log('Is Array:', Array.isArray(hierarchicalData));
console.log('Length:', hierarchicalData ? hierarchicalData.length : 'undefined');

if (hierarchicalData && Array.isArray(hierarchicalData) && hierarchicalData.length > 0) {
  console.log('✅ Data imported successfully');
  
  // Find Kano
  const kano = hierarchicalData.find(state => state.state === 'kano');
  if (kano) {
    console.log('✅ Kano found with', kano.lgas.length, 'LGAs');
    console.log('First 3 Kano LGAs:', kano.lgas.slice(0, 3).map(l => l.lga));
  } else {
    console.log('❌ Kano not found');
  }
  
  // Find Jigawa
  const jigawa = hierarchicalData.find(state => state.state === 'jigawa');
  if (jigawa) {
    console.log('✅ Jigawa found with', jigawa.lgas.length, 'LGAs');
    console.log('First 3 Jigawa LGAs:', jigawa.lgas.slice(0, 3).map(l => l.lga));
  } else {
    console.log('❌ Jigawa not found');
  }
} else {
  console.log('❌ Data import failed');
}

export default function DataVerificationScreen() {
  return null; // This is just a test component
}
