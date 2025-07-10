const fs = require('fs');
const path = require('path');

// Helper function to format names properly
function formatName(name) {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper function to create directory if it doesn't exist
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

console.log('🚀 Starting location data restructuring...');

try {
  // Read the original nigeria.json file
  const nigeriaDataPath = path.join(__dirname, 'assets', 'nigeria.json');
  if (!fs.existsSync(nigeriaDataPath)) {
    throw new Error('nigeria.json not found in assets folder');
  }

  const nigeriaData = JSON.parse(fs.readFileSync(nigeriaDataPath, 'utf8'));
  console.log(`📊 Loaded ${nigeriaData.length} states from nigeria.json`);

  // Ensure location directory exists
  const locationDir = path.join(__dirname, 'assets', 'location');
  ensureDir(locationDir);

  // 1. Create states.json
  console.log('📝 Creating states.json...');
  const states = nigeriaData.map(state => ({
    id: state.state,
    name: formatName(state.state),
    value: state.state
  })).sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(
    path.join(locationDir, 'states.json'),
    JSON.stringify(states, null, 2)
  );
  console.log(`✅ Created states.json with ${states.length} states`);

  // 2. Create LGAs by state
  console.log('📝 Creating lgas-by-state.json...');
  const lgasByState = {};
  nigeriaData.forEach(state => {
    if (state.lgas && state.lgas.length > 0) {
      lgasByState[state.state] = state.lgas.map(lga => ({
        id: lga.lga,
        name: formatName(lga.lga),
        value: lga.lga,
        state: state.state
      })).sort((a, b) => a.name.localeCompare(b.name));
    }
  });

  fs.writeFileSync(
    path.join(locationDir, 'lgas-by-state.json'),
    JSON.stringify(lgasByState, null, 2)
  );
  
  const totalLgas = Object.values(lgasByState).reduce((sum, lgas) => sum + lgas.length, 0);
  console.log(`✅ Created lgas-by-state.json with ${totalLgas} LGAs across ${Object.keys(lgasByState).length} states`);

  // 3. Create wards by LGA (combined file)
  console.log('📝 Creating wards-by-lga.json...');
  const wardsByLga = {};
  nigeriaData.forEach(state => {
    if (state.lgas) {
      state.lgas.forEach(lga => {
        const key = `${state.state}-${lga.lga}`;
        if (lga.wards && lga.wards.length > 0) {
          wardsByLga[key] = lga.wards.map(ward => ({
            id: ward.ward,
            name: formatName(ward.ward),
            value: ward.ward,
            lga: lga.lga,
            state: state.state
          })).sort((a, b) => a.name.localeCompare(b.name));
        }
      });
    }
  });

  fs.writeFileSync(
    path.join(locationDir, 'wards-by-lga.json'),
    JSON.stringify(wardsByLga, null, 2)
  );
  
  const totalWards = Object.values(wardsByLga).reduce((sum, wards) => sum + wards.length, 0);
  console.log(`✅ Created wards-by-lga.json with ${totalWards} wards`);

  // 4. Create individual polling units files by state (for better performance)
  console.log('📝 Creating polling units files by state...');
  const pollingStatsDir = path.join(locationDir, 'polling-by-state');
  ensureDir(pollingStatsDir);

  let totalPollingUnits = 0;
  const statePollingStats = {};

  nigeriaData.forEach(state => {
    const statePollingUnits = {};
    let statePollingCount = 0;

    if (state.lgas) {
      state.lgas.forEach(lga => {
        if (lga.wards) {
          lga.wards.forEach(ward => {
            const wardKey = `${state.state}-${lga.lga}-${ward.ward}`;
            if (ward.polling_units && ward.polling_units.length > 0) {
              statePollingUnits[wardKey] = ward.polling_units.map((pu, index) => ({
                id: pu,
                name: formatName(pu),
                value: pu,
                ward: ward.ward,
                lga: lga.lga,
                state: state.state
              })).sort((a, b) => a.name.localeCompare(b.name));
              
              statePollingCount += statePollingUnits[wardKey].length;
            }
          });
        }
      });
    }

    if (statePollingCount > 0) {
      fs.writeFileSync(
        path.join(pollingStatsDir, `${state.state}.json`),
        JSON.stringify(statePollingUnits, null, 2)
      );
      statePollingStats[state.state] = statePollingCount;
      totalPollingUnits += statePollingCount;
    }
  });

  console.log(`✅ Created ${Object.keys(statePollingStats).length} state polling files with ${totalPollingUnits} total polling units`);

  // 5. Create file size analysis
  console.log('\n📊 File Size Analysis:');
  const files = [
    'states.json',
    'lgas-by-state.json',
    'wards-by-lga.json'
  ];

  files.forEach(file => {
    const filePath = path.join(locationDir, file);
    const stats = fs.statSync(filePath);
    console.log(`   ${file}: ${(stats.size / 1024).toFixed(2)} KB`);
  });

  // Show polling files sizes
  console.log('   Polling files by state:');
  Object.entries(statePollingStats).forEach(([state, count]) => {
    const filePath = path.join(pollingStatsDir, `${state}.json`);
    const stats = fs.statSync(filePath);
    console.log(`     ${state}.json: ${(stats.size / 1024).toFixed(2)} KB (${count} units)`);
  });

  // 6. Create metadata file
  const metadata = {
    lastUpdated: new Date().toISOString(),
    totalStates: states.length,
    totalLgas: totalLgas,
    totalWards: totalWards,
    totalPollingUnits: totalPollingUnits,
    statePollingStats: statePollingStats
  };

  fs.writeFileSync(
    path.join(locationDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  console.log('\n🎉 Location data restructuring completed successfully!');
  console.log(`📈 Summary: ${states.length} states, ${totalLgas} LGAs, ${totalWards} wards, ${totalPollingUnits} polling units`);

} catch (error) {
  console.error('❌ Error during restructuring:', error.message);
  process.exit(1);
}
