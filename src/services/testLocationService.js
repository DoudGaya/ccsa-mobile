import testData from '../assets/nigeria-test.json';

class TestLocationService {
  constructor() {
    this.data = testData;
    console.log('TestLocationService initialized with', this.data?.length || 0, 'states');
  }

  // Get all states
  getStates() {
    try {
      const states = this.data.map(state => ({
        id: state.state,
        name: this.formatName(state.state),
        value: state.state
      }));
      
      console.log('TestLocationService: States loaded:', states.length);
      return states;
    } catch (error) {
      console.error('TestLocationService: Error loading states:', error);
      return [];
    }
  }

  // Get local governments for a specific state
  getLocalGovernments(stateId) {
    if (!stateId) return [];
    
    try {
      const state = this.data.find(s => s.state === stateId);
      if (!state || !state.lgas) {
        console.warn('TestLocationService: State not found or has no LGAs:', stateId);
        return [];
      }

      const lgas = state.lgas.map(lga => ({
        id: lga.lga,
        name: this.formatName(lga.lga),
        value: lga.lga
      }));

      console.log('TestLocationService: LGAs loaded for', stateId, ':', lgas.length);
      return lgas;
    } catch (error) {
      console.error('TestLocationService: Error loading LGAs for', stateId, ':', error);
      return [];
    }
  }

  // Get wards for a specific local government
  getWards(stateId, lgaId) {
    if (!stateId || !lgaId) return [];
    
    try {
      const state = this.data.find(s => s.state === stateId);
      if (!state || !state.lgas) return [];

      const lga = state.lgas.find(l => l.lga === lgaId);
      if (!lga || !lga.wards) {
        console.warn('TestLocationService: LGA not found or has no wards:', lgaId);
        return [];
      }

      const wards = lga.wards.map(ward => ({
        id: ward.ward,
        name: this.formatName(ward.ward),
        value: ward.ward
      }));

      console.log('TestLocationService: Wards loaded for', lgaId, ':', wards.length);
      return wards;
    } catch (error) {
      console.error('TestLocationService: Error loading wards for', lgaId, ':', error);
      return [];
    }
  }

  // Get polling units for a specific ward
  getPollingUnits(stateId, lgaId, wardId) {
    if (!stateId || !lgaId || !wardId) return [];
    
    try {
      const state = this.data.find(s => s.state === stateId);
      if (!state || !state.lgas) return [];

      const lga = state.lgas.find(l => l.lga === lgaId);
      if (!lga || !lga.wards) return [];

      const ward = lga.wards.find(w => w.ward === wardId);
      if (!ward || !ward.polling_units) {
        console.warn('TestLocationService: Ward not found or has no polling units:', wardId);
        return [];
      }

      const units = ward.polling_units.map((unit, index) => ({
        id: `${wardId}-${index}`,
        name: this.formatName(unit),
        value: unit
      }));

      console.log('TestLocationService: Polling units loaded for', wardId, ':', units.length);
      return units;
    } catch (error) {
      console.error('TestLocationService: Error loading polling units for', wardId, ':', error);
      return [];
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

export const testLocationService = new TestLocationService();
