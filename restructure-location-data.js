const fs = require('fs');
const path = require('path');

// Read the large nigeria.json file
const nigeriaData = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', 'nigeria.json'), 'utf8'));

// Create states-only file
const states = nigeriaData.map(state => ({
  id: state.state,
  name: state.state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
  value: state.state
}));

// Create LGAs by state
const lgasByState = {};
nigeriaData.forEach(state => {
  if (state.lgas) {
    lgasByState[state.state] = state.lgas.map(lga => ({
      id: lga.lga,
      name: lga.lga.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value: lga.lga,
      state: state.state
    }));
  }
});

// Create wards by LGA
const wardsByLga = {};
nigeriaData.forEach(state => {
  if (state.lgas) {
    state.lgas.forEach(lga => {
      const key = `${state.state}-${lga.lga}`;
      if (lga.wards) {
        wardsByLga[key] = lga.wards.map(ward => ({
          id: ward.ward,
          name: ward.ward.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          value: ward.ward,
          lga: lga.lga,
          state: state.state
        }));
      }
    });
  }
});

// Create polling units by ward
const pollingUnitsByWard = {};
nigeriaData.forEach(state => {
  if (state.lgas) {
    state.lgas.forEach(lga => {
      if (lga.wards) {
        lga.wards.forEach(ward => {
          const key = `${state.state}-${lga.lga}-${ward.ward}`;
          if (ward.polling_units) {
            pollingUnitsByWard[key] = ward.polling_units.map((unit, index) => ({
              id: `${ward.ward}-${index}`,
              name: unit.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              value: unit,
              ward: ward.ward,
              lga: lga.lga,
              state: state.state
            }));
          }
        });
      }
    });
  }
});

// Create assets/location directory
const locationDir = path.join(__dirname, 'assets', 'location');
if (!fs.existsSync(locationDir)) {
  fs.mkdirSync(locationDir, { recursive: true });
}

// Write separate files
fs.writeFileSync(path.join(locationDir, 'states.json'), JSON.stringify(states, null, 2));
fs.writeFileSync(path.join(locationDir, 'lgas-by-state.json'), JSON.stringify(lgasByState, null, 2));
fs.writeFileSync(path.join(locationDir, 'wards-by-lga.json'), JSON.stringify(wardsByLga, null, 2));
fs.writeFileSync(path.join(locationDir, 'polling-units-by-ward.json'), JSON.stringify(pollingUnitsByWard, null, 2));

console.log('Data restructured successfully!');
console.log('States:', states.length);
console.log('LGA groups:', Object.keys(lgasByState).length);
console.log('Ward groups:', Object.keys(wardsByLga).length);
console.log('Polling unit groups:', Object.keys(pollingUnitsByWard).length);

// Create file size report
const statesSize = JSON.stringify(states).length;
const lgasSize = JSON.stringify(lgasByState).length;
const wardsSize = JSON.stringify(wardsByLga).length;
const pollingUnitsSize = JSON.stringify(pollingUnitsByWard).length;


console.log('\nFile sizes:');
console.log('states.json:', (statesSize / 1024).toFixed(2), 'KB');
console.log('lgas-by-state.json:', (lgasSize / 1024).toFixed(2), 'KB');
console.log('wards-by-lga.json:', (wardsSize / 1024).toFixed(2), 'KB');
console.log('polling-units-by-ward.json:', (pollingUnitsSize / 1024 / 1024).toFixed(2), 'MB');
console.log('Total:', ((statesSize + lgasSize + wardsSize + pollingUnitsSize) / 1024 / 1024).toFixed(2), 'MB');
