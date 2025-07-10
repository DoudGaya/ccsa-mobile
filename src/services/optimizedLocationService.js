class OptimizedLocationService {
  constructor() {
    this.cache = {
      states: null,
      lgasByState: {},
      wardsByLga: {},
      pollingUnitsByWard: {}
    };
    this.loading = {
      states: false,
      lgas: {},
      wards: {},
      polling: {}
    };
    
    console.log('🚀 OptimizedLocationService initialized');
  }

  // Load states data
  async getStates() {
    if (this.cache.states) {
      return this.cache.states;
    }

    if (this.loading.states) {
      // Wait for current loading to complete
      while (this.loading.states) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return this.cache.states;
    }

    try {
      this.loading.states = true;
      console.log('🏛️ Loading states...');
      
      const statesData = require('../../assets/location/states.json');
      this.cache.states = statesData;
      
      console.log(`✅ Loaded ${statesData.length} states`);
      return statesData;
    } catch (error) {
      console.error('❌ Error loading states:', error);
      throw new Error('Failed to load states data');
    } finally {
      this.loading.states = false;
    }
  }

  // Get formatted states for dropdown
  async getFormattedStates() {
    const states = await this.getStates();
    return [
      { label: 'Select State', value: '' },
      ...states.map(state => ({
        label: state.name,
        value: state.value
      }))
    ];
  }

  // Load LGAs for a specific state
  async getLgasForState(stateValue) {
    if (!stateValue) return [];

    // Check cache first
    if (this.cache.lgasByState[stateValue]) {
      return this.cache.lgasByState[stateValue];
    }

    const cacheKey = stateValue;
    if (this.loading.lgas[cacheKey]) {
      // Wait for current loading to complete
      while (this.loading.lgas[cacheKey]) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return this.cache.lgasByState[stateValue] || [];
    }

    try {
      this.loading.lgas[cacheKey] = true;
      console.log(`🏘️ Loading LGAs for state: ${stateValue}...`);

      // Load the entire LGAs data file once and cache the specific state's LGAs
      if (!this.cache.allLgasByState) {
        const lgasData = require('../../assets/location/lgas-by-state.json');
        this.cache.allLgasByState = lgasData;
      }

      const lgas = this.cache.allLgasByState[stateValue] || [];
      this.cache.lgasByState[stateValue] = lgas;
      
      console.log(`✅ Loaded ${lgas.length} LGAs for ${stateValue}`);
      return lgas;
    } catch (error) {
      console.error(`❌ Error loading LGAs for ${stateValue}:`, error);
      return [];
    } finally {
      this.loading.lgas[cacheKey] = false;
    }
  }

  // Get formatted LGAs for dropdown
  async getFormattedLocalGovernments(stateValue) {
    if (!stateValue) return [{ label: 'Select State First', value: '' }];
    
    const lgas = await this.getLgasForState(stateValue);
    return [
      { label: 'Select Local Government', value: '' },
      ...lgas.map(lga => ({
        label: lga.name,
        value: lga.value
      }))
    ];
  }

  // Load wards for a specific LGA
  async getWardsForLga(stateValue, lgaValue) {
    if (!stateValue || !lgaValue) return [];

    const cacheKey = `${stateValue}-${lgaValue}`;
    
    // Check cache first
    if (this.cache.wardsByLga[cacheKey]) {
      return this.cache.wardsByLga[cacheKey];
    }

    if (this.loading.wards[cacheKey]) {
      // Wait for current loading to complete
      while (this.loading.wards[cacheKey]) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return this.cache.wardsByLga[cacheKey] || [];
    }

    try {
      this.loading.wards[cacheKey] = true;
      console.log(`🏡 Loading wards for LGA: ${stateValue}-${lgaValue}...`);

      // Load the entire wards data file once and cache the specific LGA's wards
      if (!this.cache.allWardsByLga) {
        const wardsData = require('../../assets/location/wards-by-lga.json');
        this.cache.allWardsByLga = wardsData;
      }

      const wards = this.cache.allWardsByLga[cacheKey] || [];
      this.cache.wardsByLga[cacheKey] = wards;
      
      console.log(`✅ Loaded ${wards.length} wards for ${cacheKey}`);
      return wards;
    } catch (error) {
      console.error(`❌ Error loading wards for ${cacheKey}:`, error);
      return [];
    } finally {
      this.loading.wards[cacheKey] = false;
    }
  }

  // Get formatted wards for dropdown
  async getFormattedWards(stateValue, lgaValue) {
    if (!stateValue || !lgaValue) return [{ label: 'Select LGA First', value: '' }];
    
    const wards = await this.getWardsForLga(stateValue, lgaValue);
    return [
      { label: 'Select Ward', value: '' },
      ...wards.map(ward => ({
        label: ward.name,
        value: ward.value
      }))
    ];
  }

  // Load polling units for a specific ward
  async getPollingUnitsForWard(stateValue, lgaValue, wardValue) {
    if (!stateValue || !lgaValue || !wardValue) return [];

    const cacheKey = `${stateValue}-${lgaValue}-${wardValue}`;
    
    // Check cache first
    if (this.cache.pollingUnitsByWard[cacheKey]) {
      return this.cache.pollingUnitsByWard[cacheKey];
    }

    const loadingKey = cacheKey;
    if (this.loading.polling[loadingKey]) {
      // Wait for current loading to complete
      while (this.loading.polling[loadingKey]) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return this.cache.pollingUnitsByWard[cacheKey] || [];
    }

    try {
      this.loading.polling[loadingKey] = true;
      console.log(`🗳️ Loading polling units for ward: ${cacheKey}...`);

      // Load the entire polling units data file once and cache the specific ward's polling units
      if (!this.cache.allPollingUnitsByWard) {
        const pollingData = require('../../assets/location/polling-units-by-ward.json');
        this.cache.allPollingUnitsByWard = pollingData;
      }

      const pollingUnits = this.cache.allPollingUnitsByWard[cacheKey] || [];
      this.cache.pollingUnitsByWard[cacheKey] = pollingUnits;
      
      console.log(`✅ Loaded ${pollingUnits.length} polling units for ${cacheKey}`);
      return pollingUnits;
    } catch (error) {
      console.error(`❌ Error loading polling units for ${cacheKey}:`, error);
      return [];
    } finally {
      this.loading.polling[loadingKey] = false;
    }
  }

  // Get formatted polling units for dropdown
  async getFormattedPollingUnits(stateValue, lgaValue, wardValue) {
    if (!stateValue || !lgaValue || !wardValue) return [{ label: 'Select Ward First', value: '' }];
    
    const pollingUnits = await this.getPollingUnitsForWard(stateValue, lgaValue, wardValue);
    return [
      { label: 'Select Polling Unit', value: '' },
      ...pollingUnits.map(pu => ({
        label: pu.name,
        value: pu.value
      }))
    ];
  }

  // Search functions
  async searchStates(query) {
    const states = await this.getStates();
    if (!query) return states;
    
    const lowercaseQuery = query.toLowerCase();
    return states.filter(state =>
      state.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  async searchLocalGovernments(stateValue, query) {
    const lgas = await this.getLgasForState(stateValue);
    if (!query) return lgas;
    
    const lowercaseQuery = query.toLowerCase();
    return lgas.filter(lga =>
      lga.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  async searchWards(stateValue, lgaValue, query) {
    const wards = await this.getWardsForLga(stateValue, lgaValue);
    if (!query) return wards;
    
    const lowercaseQuery = query.toLowerCase();
    return wards.filter(ward =>
      ward.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  async searchPollingUnits(stateValue, lgaValue, wardValue, query) {
    const units = await this.getPollingUnitsForWard(stateValue, lgaValue, wardValue);
    if (!query) return units;
    
    const lowercaseQuery = query.toLowerCase();
    return units.filter(unit =>
      unit.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Check if any loading is in progress
  isLoading(type, key = null) {
    switch (type) {
      case 'states':
        return this.loading.states;
      case 'lgas':
        return key ? this.loading.lgas[key] : Object.keys(this.loading.lgas).some(k => this.loading.lgas[k]);
      case 'wards':
        return key ? this.loading.wards[key] : Object.keys(this.loading.wards).some(k => this.loading.wards[k]);
      case 'polling':
        return key ? this.loading.polling[key] : Object.keys(this.loading.polling).some(k => this.loading.polling[k]);
      default:
        return false;
    }
  }

  // Check if states are loaded
  areStatesLoaded() {
    return !!this.cache.states;
  }

  // Clear cache (useful for memory management)
  clearCache() {
    this.cache = {
      states: null,
      lgasByState: {},
      wardsByLga: {},
      pollingUnitsByWard: {}
    };
    console.log('🧹 Location service cache cleared');
  }

  // Get cache stats for debugging
  getCacheStats() {
    return {
      states: !!this.cache.states,
      lgasStates: Object.keys(this.cache.lgasByState).length,
      wardsLgas: Object.keys(this.cache.wardsByLga).length,
      pollingWards: Object.keys(this.cache.pollingUnitsByWard).length,
      memoryUsage: JSON.stringify(this.cache).length + ' bytes'
    };
  }
}

// Create and export a singleton instance
export default new OptimizedLocationService();
