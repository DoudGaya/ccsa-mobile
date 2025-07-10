class OptimizedLocationService {
  constructor() {
    this.cache = {
      states: null,
      lgasByState: {},
      wardsByLga: {},
      pollingUnitsByState: {}
    };
    this.loading = {
      states: false,
      lgas: {},
      wards: {},
      polling: {}
    };
    
    console.log('🚀 OptimizedLocationService v2 initialized');
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
    if (this.cache.pollingUnitsByState[stateValue] && 
        this.cache.pollingUnitsByState[stateValue][cacheKey]) {
      return this.cache.pollingUnitsByState[stateValue][cacheKey];
    }

    const loadingKey = `${stateValue}-${cacheKey}`;
    if (this.loading.polling[loadingKey]) {
      // Wait for current loading to complete
      while (this.loading.polling[loadingKey]) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return (this.cache.pollingUnitsByState[stateValue] && 
              this.cache.pollingUnitsByState[stateValue][cacheKey]) || [];
    }

    try {
      this.loading.polling[loadingKey] = true;
      console.log(`🗳️ Loading polling units for ward: ${cacheKey}...`);

      // Load the state-specific polling units file using a mapping approach
      if (!this.cache.pollingUnitsByState[stateValue]) {
        // Create a mapping for state files since dynamic requires don't work in React Native
        const stateFileMap = {
          'abia': require('../../assets/location/polling-by-state/abia.json'),
          'adamawa': require('../../assets/location/polling-by-state/adamawa.json'),
          'akwa-ibom': require('../../assets/location/polling-by-state/akwa-ibom.json'),
          'anambra': require('../../assets/location/polling-by-state/anambra.json'),
          'abuja': require('../../assets/location/polling-by-state/abuja.json'),
          'bauchi': require('../../assets/location/polling-by-state/bauchi.json'),
          'bayelsa': require('../../assets/location/polling-by-state/bayelsa.json'),
          'benue': require('../../assets/location/polling-by-state/benue.json'),
          'borno': require('../../assets/location/polling-by-state/borno.json'),
          'cross-river': require('../../assets/location/polling-by-state/cross-river.json'),
          'delta': require('../../assets/location/polling-by-state/delta.json'),
          'ebonyi': require('../../assets/location/polling-by-state/ebonyi.json'),
          'edo': require('../../assets/location/polling-by-state/edo.json'),
          'ekiti': require('../../assets/location/polling-by-state/ekiti.json'),
          'enugu': require('../../assets/location/polling-by-state/enugu.json'),
          'gombe': require('../../assets/location/polling-by-state/gombe.json'),
          'imo': require('../../assets/location/polling-by-state/imo.json'),
          'jigawa': require('../../assets/location/polling-by-state/jigawa.json'),
          'kaduna': require('../../assets/location/polling-by-state/kaduna.json'),
          'kano': require('../../assets/location/polling-by-state/kano.json'),
          'katsina': require('../../assets/location/polling-by-state/katsina.json'),
          'kebbi': require('../../assets/location/polling-by-state/kebbi.json'),
          'kogi': require('../../assets/location/polling-by-state/kogi.json'),
          'kwara': require('../../assets/location/polling-by-state/kwara.json'),
          'lagos': require('../../assets/location/polling-by-state/lagos.json'),
          'nasarawa': require('../../assets/location/polling-by-state/nasarawa.json'),
          'niger': require('../../assets/location/polling-by-state/niger.json'),
          'ogun': require('../../assets/location/polling-by-state/ogun.json'),
          'ondo': require('../../assets/location/polling-by-state/ondo.json'),
          'osun': require('../../assets/location/polling-by-state/osun.json'),
          'oyo': require('../../assets/location/polling-by-state/oyo.json'),
          'plateau': require('../../assets/location/polling-by-state/plateau.json'),
          'rivers': require('../../assets/location/polling-by-state/rivers.json'),
          'sokoto': require('../../assets/location/polling-by-state/sokoto.json'),
          'taraba': require('../../assets/location/polling-by-state/taraba.json'),
          'yobe': require('../../assets/location/polling-by-state/yobe.json'),
          'zamfara': require('../../assets/location/polling-by-state/zamfara.json'),
        };

        const pollingData = stateFileMap[stateValue];
        if (pollingData) {
          this.cache.pollingUnitsByState[stateValue] = pollingData;
        } else {
          console.warn(`⚠️ No polling data found for state: ${stateValue}`);
          this.cache.pollingUnitsByState[stateValue] = {};
        }
      }

      const pollingUnits = this.cache.pollingUnitsByState[stateValue][cacheKey] || [];
      
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
      pollingUnitsByState: {}
    };
    console.log('🧹 Location service cache cleared');
  }

  // Get cache stats for debugging
  getCacheStats() {
    return {
      states: !!this.cache.states,
      lgasStates: Object.keys(this.cache.lgasByState).length,
      wardsLgas: Object.keys(this.cache.wardsByLga).length,
      pollingStates: Object.keys(this.cache.pollingUnitsByState).length,
      memoryUsage: JSON.stringify(this.cache).length + ' bytes'
    };
  }
}

// Create and export singleton instance
const optimizedLocationService = new OptimizedLocationService();
export default optimizedLocationService;
