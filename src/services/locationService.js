// Complete location service with hierarchical data loading
class LocationService {
  constructor() {
    this.data = null;
    this.cache = {
      states: null,
      lgasByState: new Map(),
      wardsByLga: new Map(),
      pollingUnitsByWard: new Map()
    };
    
    console.log('🚀 LocationService initialized');
  }

  // Load the complete data structure
  loadData() {
    if (this.data) {
      return this.data;
    }

    try {
      // Load the complete hierarchical data
      console.log('📂 LocationService: Loading data from ../../data/states-and-lgas-and-wards-and-polling-units.json');
      
      // Try to require the data file
      this.data = require('../../data/states-and-lgas-and-wards-and-polling-units.json');
      
      if (!this.data) {
        console.error('❌ LocationService: Data is null after require');
        throw new Error('Data file returned null');
      }
      
      if (!Array.isArray(this.data)) {
        console.error('❌ LocationService: Data is not an array, type:', typeof this.data);
        throw new Error('Data is not an array');
      }
      
      if (this.data.length === 0) {
        console.error('❌ LocationService: Data array is empty');
        throw new Error('Data array is empty');
      }
      
      console.log('✅ LocationService: Loaded complete data with', this.data.length, 'states');
      console.log('📊 LocationService: Sample states:', this.data.slice(0, 3).map(s => s.state));
      
      // Verify specific states exist
      const kano = this.data.find(s => s.state === 'kano');
      const jigawa = this.data.find(s => s.state === 'jigawa');
      const abia = this.data.find(s => s.state === 'abia');
      
      console.log('🔍 LocationService: State verification:');
      console.log('   - Kano:', kano ? `✅ ${kano.lgas.length} LGAs` : '❌ Not found');
      console.log('   - Jigawa:', jigawa ? `✅ ${jigawa.lgas.length} LGAs` : '❌ Not found');
      console.log('   - Abia:', abia ? `✅ ${abia.lgas.length} LGAs` : '❌ Not found');
      
      return this.data;
    } catch (error) {
      console.error('❌ LocationService: Error loading complete data:', error);
      console.error('❌ LocationService: Error details:', {
        message: error.message,
        stack: error.stack?.split('\n')[0],
        name: error.name
      });
      
      // Try alternative loading method
      console.log('🔄 LocationService: Attempting alternative data loading...');
      try {
        // Import the data using dynamic import (for React Native)
        const alternativeData = require('../../data/states-and-lgas-and-wards-and-polling-units.json');
        if (alternativeData && Array.isArray(alternativeData) && alternativeData.length > 0) {
          console.log('✅ LocationService: Alternative loading successful');
          this.data = alternativeData;
          return this.data;
        }
      } catch (altError) {
        console.error('❌ LocationService: Alternative loading also failed:', altError.message);
      }
      
      throw new Error(`Failed to load location data: ${error.message}`);
    }
  }

  // Get all states
  async getStates() {
    if (this.cache.states) {
      console.log('📋 LocationService: Returning cached states');
      return this.cache.states;
    }

    try {
      const data = this.loadData();
      const formattedStates = data.map(stateData => ({
        id: stateData.state,
        name: this.formatName(stateData.state),
        value: stateData.state,
        label: this.formatName(stateData.state)
      }));

      this.cache.states = formattedStates;
      console.log('✅ LocationService: Loaded states:', formattedStates.length);
      return formattedStates;
    } catch (error) {
      console.error('❌ LocationService: Error loading states:', error);
      throw new Error(`Could not load states data: ${error.message}`);
    }
  }

  // Get LGAs for a specific state
  async getLGAs(stateId) {
    if (!stateId) {
      console.warn('❌ LocationService: No stateId provided to getLGAs');
      return [];
    }

    // Check cache first
    if (this.cache.lgasByState.has(stateId)) {
      console.log(`📋 LocationService: Returning cached LGAs for ${stateId}`);
      return this.cache.lgasByState.get(stateId);
    }

    try {
      console.log(`🏘️ LocationService: Loading LGAs for state ${stateId}`);
      
      const data = this.loadData();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data structure loaded');
      }
      
      const stateData = data.find(s => s.state === stateId);
      
      if (!stateData) {
        console.error(`❌ State '${stateId}' not found in data. Available states:`, data.map(s => s.state).slice(0, 5));
        throw new Error(`State '${stateId}' not found`);
      }
      
      if (!stateData.lgas || !Array.isArray(stateData.lgas)) {
        console.error(`❌ State '${stateId}' has no LGAs or invalid LGAs structure`);
        throw new Error(`State '${stateId}' has no LGAs`);
      }
      
      const formattedLGAs = stateData.lgas.map(lga => ({
        id: lga.lga,
        name: this.formatName(lga.lga),
        value: lga.lga,
        label: this.formatName(lga.lga),
        stateId
      }));

      this.cache.lgasByState.set(stateId, formattedLGAs);
      console.log(`✅ LocationService: Loaded ${formattedLGAs.length} LGAs for ${stateId}`);
      return formattedLGAs;
      
    } catch (error) {
      console.error(`❌ LocationService: Error loading LGAs for [${stateId}]:`, error);
      throw new Error(`Could not load LGA data from any source`);
    }
  }

  // Get wards for a specific LGA
  async getWards(lgaId) {
    if (!lgaId) {
      console.warn('❌ LocationService: No lgaId provided to getWards');
      return [];
    }

    // Check cache first
    if (this.cache.wardsByLga.has(lgaId)) {
      console.log(`📋 LocationService: Returning cached wards for ${lgaId}`);
      return this.cache.wardsByLga.get(lgaId);
    }

    try {
      console.log(`🏡 LocationService: Loading wards for LGA ${lgaId}`);
      
      const data = this.loadData();
      
      // Find the LGA across all states
      let foundWards = [];
      let foundState = null;
      
      for (const stateData of data) {
        if (stateData.lgas) {
          const lgaData = stateData.lgas.find(lga => lga.lga === lgaId);
          if (lgaData && lgaData.wards) {
            foundWards = lgaData.wards;
            foundState = stateData.state;
            break;
          }
        }
      }
      
      if (foundWards.length === 0) {
        console.error(`❌ LGA '${lgaId}' not found in any state`);
        throw new Error(`LGA '${lgaId}' not found`);
      }
      
      const formattedWards = foundWards.map(ward => ({
        id: ward.ward,
        name: this.formatName(ward.ward),
        value: ward.ward,
        label: this.formatName(ward.ward),
        lgaId
      }));

      this.cache.wardsByLga.set(lgaId, formattedWards);
      console.log(`✅ LocationService: Loaded ${formattedWards.length} wards for ${lgaId} (${foundState})`);
      return formattedWards;
      
    } catch (error) {
      console.error(`❌ LocationService: Error loading wards for ${lgaId}:`, error);
      throw new Error(`Could not load ward data for LGA: ${lgaId}`);
    }
  }

  // Get polling units for a specific ward
  async getPollingUnits(wardId) {
    if (!wardId) {
      console.warn('❌ LocationService: No wardId provided to getPollingUnits');
      return [];
    }

    // Check cache first
    if (this.cache.pollingUnitsByWard.has(wardId)) {
      console.log(`📋 LocationService: Returning cached polling units for ${wardId}`);
      return this.cache.pollingUnitsByWard.get(wardId);
    }

    try {
      console.log(`🗳️ LocationService: Loading polling units for ward ${wardId}`);
      
      const data = this.loadData();
      
      // Find the ward across all states and LGAs
      let foundPollingUnits = [];
      let foundLocation = null;
      
      for (const stateData of data) {
        for (const lga of stateData.lgas || []) {
          for (const ward of lga.wards || []) {
            if (ward.ward === wardId) {
              foundPollingUnits = ward.polling_units || [];
              foundLocation = `${stateData.state}/${lga.lga}`;
              break;
            }
          }
          if (foundPollingUnits.length > 0) break;
        }
        if (foundPollingUnits.length > 0) break;
      }
      
      if (foundPollingUnits.length === 0) {
        console.error(`❌ Ward '${wardId}' not found in any LGA`);
        throw new Error(`Ward '${wardId}' not found`);
      }
      
      const formattedPollingUnits = foundPollingUnits.map(unit => ({
        id: unit,
        name: this.formatName(unit),
        value: unit,
        label: this.formatName(unit),
        wardId
      }));

      this.cache.pollingUnitsByWard.set(wardId, formattedPollingUnits);
      console.log(`✅ LocationService: Loaded ${formattedPollingUnits.length} polling units for ${wardId} (${foundLocation})`);
      return formattedPollingUnits;
      
    } catch (error) {
      console.error(`❌ LocationService: Error loading polling units for ${wardId}:`, error);
      throw new Error(`Could not load polling unit data for ward: ${wardId}`);
    }
  }

  // Format names from kebab-case to Title Case
  formatName(name) {
    if (!name) return '';
    
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Clear all caches
  clearCache() {
    this.cache.states = null;
    this.cache.lgasByState.clear();
    this.cache.wardsByLga.clear();
    this.cache.pollingUnitsByWard.clear();
    console.log('🧹 LocationService: Cache cleared');
  }

  // Get location statistics
  getLocationStats() {
    return {
      totalStates: 37,
      totalLGAs: 774,
      totalWards: 8812,
      totalPollingUnits: 176846,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Create and export a single instance
const locationService = new LocationService();
export { locationService };
export default locationService;
