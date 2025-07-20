import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { locationService } from '../services/locationService';

const OptimizedLocationPicker = ({ onLocationSelect, onError, showLabels = true }) => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedLGA, setSelectedLGA] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingUnit, setSelectedPollingUnit] = useState('');
  
  const [states, setStates] = useState([]);
  const [lgas, setLGAs] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingUnits, setPollingUnits] = useState([]);
  
  const [loading, setLoading] = useState({
    states: false,
    lgas: false,
    wards: false,
    pollingUnits: false
  });

  // Load initial states
  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    setLoading(prev => ({ ...prev, states: true }));
    try {
      console.log('📍 Loading states...');
      const statesData = await locationService.getStates();
      setStates(statesData);
      console.log('✅ States loaded:', statesData.length);
    } catch (error) {
      console.error('❌ Error loading states:', error);
      onError && onError('Failed to load states');
      Alert.alert('Error', 'Failed to load states');
    } finally {
      setLoading(prev => ({ ...prev, states: false }));
    }
  };

  const loadLGAs = async (stateId) => {
    if (!stateId) {
      setLGAs([]);
      return;
    }

    setLoading(prev => ({ ...prev, lgas: true }));
    try {
      console.log('🏘️ Loading LGAs for state:', stateId);
      const lgasData = await locationService.getLGAs(stateId);
      setLGAs(lgasData);
      console.log('✅ LGAs loaded:', lgasData.length);
    } catch (error) {
      console.error('❌ Error loading LGAs:', error);
      onError && onError('Failed to load Local Governments');
      Alert.alert('Error', 'Failed to load Local Governments');
      setLGAs([]);
    } finally {
      setLoading(prev => ({ ...prev, lgas: false }));
    }
  };

  const loadWards = async (lgaId) => {
    if (!lgaId) {
      setWards([]);
      return;
    }

    setLoading(prev => ({ ...prev, wards: true }));
    try {
      console.log('🏡 Loading wards for LGA:', lgaId);
      const wardsData = await locationService.getWards(lgaId);
      setWards(wardsData);
      console.log('✅ Wards loaded:', wardsData.length);
    } catch (error) {
      console.error('❌ Error loading wards:', error);
      onError && onError('Failed to load wards');
      Alert.alert('Error', 'Failed to load wards');
      setWards([]);
    } finally {
      setLoading(prev => ({ ...prev, wards: false }));
    }
  };

  const loadPollingUnits = async (wardId) => {
    if (!wardId) {
      setPollingUnits([]);
      return;
    }

    setLoading(prev => ({ ...prev, pollingUnits: true }));
    try {
      console.log('🗳️ Loading polling units for ward:', wardId);
      const pollingUnitsData = await locationService.getPollingUnits(wardId);
      setPollingUnits(pollingUnitsData);
      console.log('✅ Polling units loaded:', pollingUnitsData.length);
    } catch (error) {
      console.error('❌ Error loading polling units:', error);
      onError && onError('Failed to load polling units');
      Alert.alert('Error', 'Failed to load polling units');
      setPollingUnits([]);
    } finally {
      setLoading(prev => ({ ...prev, pollingUnits: false }));
    }
  };

  // Handle state selection
  const handleStateChange = async (stateId) => {
    console.log('🔄 State changed to:', stateId);
    setSelectedState(stateId);
    setSelectedLGA('');
    setSelectedWard('');
    setSelectedPollingUnit('');
    setLGAs([]);
    setWards([]);
    setPollingUnits([]);

    if (stateId) {
      await loadLGAs(stateId);
    }

    updateSelection({
      state: stateId,
      lga: '',
      ward: '',
      pollingUnit: ''
    });
  };

  // Handle LGA selection
  const handleLGAChange = async (lgaId) => {
    console.log('🔄 LGA changed to:', lgaId);
    setSelectedLGA(lgaId);
    setSelectedWard('');
    setSelectedPollingUnit('');
    setWards([]);
    setPollingUnits([]);

    if (lgaId) {
      await loadWards(lgaId);
    }

    updateSelection({
      state: selectedState,
      lga: lgaId,
      ward: '',
      pollingUnit: ''
    });
  };

  // Handle ward selection
  const handleWardChange = async (wardId) => {
    console.log('🔄 Ward changed to:', wardId);
    setSelectedWard(wardId);
    setSelectedPollingUnit('');
    setPollingUnits([]);

    if (wardId) {
      await loadPollingUnits(wardId);
    }

    updateSelection({
      state: selectedState,
      lga: selectedLGA,
      ward: wardId,
      pollingUnit: ''
    });
  };

  // Handle polling unit selection
  const handlePollingUnitChange = (pollingUnitId) => {
    console.log('🔄 Polling unit changed to:', pollingUnitId);
    setSelectedPollingUnit(pollingUnitId);

    updateSelection({
      state: selectedState,
      lga: selectedLGA,
      ward: selectedWard,
      pollingUnit: pollingUnitId
    });
  };

  // Update parent component with selection
  const updateSelection = (selection) => {
    if (onLocationSelect) {
      const selectedData = {
        state: selection.state ? states.find(s => s.id === selection.state) : null,
        lga: selection.lga ? lgas.find(l => l.id === selection.lga) : null,
        ward: selection.ward ? wards.find(w => w.id === selection.ward) : null,
        pollingUnit: selection.pollingUnit ? pollingUnits.find(p => p.id === selection.pollingUnit) : null
      };

      onLocationSelect(selectedData);
    }
  };

  return (
    <View style={styles.container}>
      {/* State Picker */}
      <View style={styles.pickerContainer}>
        {showLabels && <Text style={styles.label}>State</Text>}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedState}
            onValueChange={handleStateChange}
            style={styles.picker}
            enabled={!loading.states}
          >
            <Picker.Item 
              label={loading.states ? "Loading states..." : "Select State"} 
              value="" 
              color="#999"
            />
            {states.map((state) => (
              <Picker.Item
                key={state.id}
                label={state.name}
                value={state.id}
              />
            ))}
          </Picker>
        </View>
        {states.length > 0 && (
          <Text style={styles.counter}>{states.length} states</Text>
        )}
      </View>

      {/* LGA Picker */}
      {selectedState && (
        <View style={styles.pickerContainer}>
          {showLabels && <Text style={styles.label}>Local Government Area</Text>}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedLGA}
              onValueChange={handleLGAChange}
              style={styles.picker}
              enabled={!loading.lgas && lgas.length > 0}
            >
              <Picker.Item 
                label={loading.lgas ? "Loading LGAs..." : lgas.length === 0 ? "No LGAs available" : "Select LGA"} 
                value="" 
                color="#999"
              />
              {lgas.map((lga) => (
                <Picker.Item
                  key={lga.id}
                  label={lga.name}
                  value={lga.id}
                />
              ))}
            </Picker>
          </View>
          {lgas.length > 0 && (
            <Text style={styles.counter}>{lgas.length} LGAs</Text>
          )}
        </View>
      )}

      {/* Ward Picker */}
      {selectedLGA && (
        <View style={styles.pickerContainer}>
          {showLabels && <Text style={styles.label}>Ward</Text>}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedWard}
              onValueChange={handleWardChange}
              style={styles.picker}
              enabled={!loading.wards && wards.length > 0}
            >
              <Picker.Item 
                label={loading.wards ? "Loading wards..." : wards.length === 0 ? "No wards available" : "Select Ward"} 
                value="" 
                color="#999"
              />
              {wards.map((ward) => (
                <Picker.Item
                  key={ward.id}
                  label={ward.name}
                  value={ward.id}
                />
              ))}
            </Picker>
          </View>
          {wards.length > 0 && (
            <Text style={styles.counter}>{wards.length} wards</Text>
          )}
        </View>
      )}

      {/* Polling Unit Picker */}
      {selectedWard && (
        <View style={styles.pickerContainer}>
          {showLabels && <Text style={styles.label}>Polling Unit</Text>}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedPollingUnit}
              onValueChange={handlePollingUnitChange}
              style={styles.picker}
              enabled={!loading.pollingUnits && pollingUnits.length > 0}
            >
              <Picker.Item 
                label={loading.pollingUnits ? "Loading polling units..." : pollingUnits.length === 0 ? "No polling units available" : "Select Polling Unit"} 
                value="" 
                color="#999"
              />
              {pollingUnits.map((unit) => (
                <Picker.Item
                  key={unit.id}
                  label={unit.name}
                  value={unit.id}
                />
              ))}
            </Picker>
          </View>
          {pollingUnits.length > 0 && (
            <Text style={styles.counter}>{pollingUnits.length} polling units</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  counter: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
});

export default OptimizedLocationPicker;
