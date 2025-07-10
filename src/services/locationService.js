import nigeriaData from '../../assets/nigeria.json';

class LocationService {
  constructor() {
    this.data = nigeriaData;
    this.statesCache = null;
    this.lgaCache = new Map();
    this.wardCache = new Map();
    this.pollingUnitCache = new Map();
    
    console.log('LocationService initialized with', this.data?.length || 0, 'states');
  }

  // Get all states with caching
  getStates() {
    if (this.statesCache) {
      return this.statesCache;
    }

    try {
      this.statesCache = this.data.map(state => ({
        id: state.state,
        name: this.formatName(state.state),
        value: state.state
      }));
      
      console.log('States loaded:', this.statesCache.length);
      return this.statesCache;
    } catch (error) {
      console.error('Error loading states:', error);
      return [];
    }
  }

  // Get local governments for a specific state with caching
  getLocalGovernments(stateId) {
    if (!stateId) return [];
    
    const cacheKey = stateId;
    if (this.lgaCache.has(cacheKey)) {
      return this.lgaCache.get(cacheKey);
    }

    try {
      const state = this.data.find(s => s.state === stateId);
      if (!state || !state.lgas) {
        console.warn('State not found or has no LGAs:', stateId);
        return [];
      }

      const lgas = state.lgas.map(lga => ({
        id: lga.lga,
        name: this.formatName(lga.lga),
        value: lga.lga
      }));

      this.lgaCache.set(cacheKey, lgas);
      console.log('LGAs loaded for', stateId, ':', lgas.length);
      return lgas;
    } catch (error) {
      console.error('Error loading LGAs for', stateId, ':', error);
      return [];
    }
  }

  // Get wards for a specific local government with caching
  getWards(stateId, lgaId) {
    if (!stateId || !lgaId) return [];
    
    const cacheKey = `${stateId}-${lgaId}`;
    if (this.wardCache.has(cacheKey)) {
      return this.wardCache.get(cacheKey);
    }

    try {
      const state = this.data.find(s => s.state === stateId);
      if (!state || !state.lgas) return [];

      const lga = state.lgas.find(l => l.lga === lgaId);
      if (!lga || !lga.wards) {
        console.warn('LGA not found or has no wards:', lgaId);
        return [];
      }

      const wards = lga.wards.map(ward => ({
        id: ward.ward,
        name: this.formatName(ward.ward),
        value: ward.ward
      }));

      this.wardCache.set(cacheKey, wards);
      console.log('Wards loaded for', lgaId, ':', wards.length);
      return wards;
    } catch (error) {
      console.error('Error loading wards for', lgaId, ':', error);
      return [];
    }
  }

  // Get polling units for a specific ward with caching
  getPollingUnits(stateId, lgaId, wardId) {
    if (!stateId || !lgaId || !wardId) return [];
    
    const cacheKey = `${stateId}-${lgaId}-${wardId}`;
    if (this.pollingUnitCache.has(cacheKey)) {
      return this.pollingUnitCache.get(cacheKey);
    }

    try {
      const state = this.data.find(s => s.state === stateId);
      if (!state || !state.lgas) return [];

      const lga = state.lgas.find(l => l.lga === lgaId);
      if (!lga || !lga.wards) return [];

      const ward = lga.wards.find(w => w.ward === wardId);
      if (!ward || !ward.polling_units) {
        console.warn('Ward not found or has no polling units:', wardId);
        return [];
      }

      const units = ward.polling_units.map((unit, index) => ({
        id: `${wardId}-${index}`,
        name: this.formatName(unit),
        value: unit
      }));

      this.pollingUnitCache.set(cacheKey, units);
      console.log('Polling units loaded for', wardId, ':', units.length);
      return units;
    } catch (error) {
      console.error('Error loading polling units for', wardId, ':', error);
      return [];
    }
  }

  // Search states
  searchStates(query) {
    if (!query) return this.getStates();
    
    const lowercaseQuery = query.toLowerCase();
    return this.getStates().filter(state =>
      state.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Search local governments
  searchLocalGovernments(stateId, query) {
    const lgas = this.getLocalGovernments(stateId);
    if (!query) return lgas;
    
    const lowercaseQuery = query.toLowerCase();
    return lgas.filter(lga =>
      lga.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Search wards
  searchWards(stateId, lgaId, query) {
    const wards = this.getWards(stateId, lgaId);
    if (!query) return wards;
    
    const lowercaseQuery = query.toLowerCase();
    return wards.filter(ward =>
      ward.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Search polling units
  searchPollingUnits(stateId, lgaId, wardId, query) {
    const units = this.getPollingUnits(stateId, lgaId, wardId);
    if (!query) return units;
    
    const lowercaseQuery = query.toLowerCase();
    return units.filter(unit =>
      unit.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Format names from kebab-case to Title Case
  formatName(name) {
    if (!name) return '';
    
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Get formatted options for dropdowns
  getFormattedStates() {
    return [
      { label: 'Select State', value: '' },
      ...this.getStates().map(state => ({
        label: state.name,
        value: state.value
      }))
    ];
  }

  getFormattedLocalGovernments(stateId) {
    if (!stateId) return [{ label: 'Select State First', value: '' }];
    
    return [
      { label: 'Select Local Government', value: '' },
      ...this.getLocalGovernments(stateId).map(lga => ({
        label: lga.name,
        value: lga.value
      }))
    ];
  }

  getFormattedWards(stateId, lgaId) {
    if (!stateId || !lgaId) return [{ label: 'Select Local Government First', value: '' }];
    
    return [
      { label: 'Select Ward', value: '' },
      ...this.getWards(stateId, lgaId).map(ward => ({
        label: ward.name,
        value: ward.value
      }))
    ];
  }

  getFormattedPollingUnits(stateId, lgaId, wardId) {
    if (!stateId || !lgaId || !wardId) return [{ label: 'Select Ward First', value: '' }];
    
    return [
      { label: 'Select Polling Unit', value: '' },
      ...this.getPollingUnits(stateId, lgaId, wardId).map(unit => ({
        label: unit.name,
        value: unit.value
      }))
    ];
  }
}

export const locationService = new LocationService();
