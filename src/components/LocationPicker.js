import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { lazyLocationService } from '../services/lazyLocationService';

const LocationPicker = ({ 
  onLocationChange, 
  initialValues = {}, 
  disabled = false,
  style 
}) => {
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [localGovernments, setLocalGovernments] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingUnits, setPollingUnits] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [selectedState, setSelectedState] = useState(initialValues.state || '');
  const [selectedLGA, setSelectedLGA] = useState(initialValues.lga || '');
  const [selectedWard, setSelectedWard] = useState(initialValues.ward || '');
  const [selectedPollingUnit, setSelectedPollingUnit] = useState(initialValues.pollingUnit || '');

  // Load states on component mount
  useEffect(() => {
    loadStates();
    loadStats();
  }, []);

  // Load LGAs when state changes
  useEffect(() => {
    if (selectedState) {
      loadLocalGovernments(selectedState);
    } else {
      setLocalGovernments([]);
      setWards([]);
      setPollingUnits([]);
      setSelectedLGA('');
      setSelectedWard('');
      setSelectedPollingUnit('');
    }
  }, [selectedState]);

  // Load wards when LGA changes
  useEffect(() => {
    if (selectedLGA) {
      loadWards(selectedLGA);
    } else {
      setWards([]);
      setPollingUnits([]);
      setSelectedWard('');
      setSelectedPollingUnit('');
    }
  }, [selectedLGA]);

  // Load polling units when ward changes
  useEffect(() => {
    if (selectedWard) {
      loadPollingUnits(selectedWard);
    } else {
      setPollingUnits([]);
      setSelectedPollingUnit('');
    }
  }, [selectedWard]);

  // Notify parent component of changes
  useEffect(() => {
    if (onLocationChange) {
      onLocationChange({
        state: selectedState,
        lga: selectedLGA,
        ward: selectedWard,
        pollingUnit: selectedPollingUnit
      });
    }
  }, [selectedState, selectedLGA, selectedWard, selectedPollingUnit, onLocationChange]);

  const loadStates = async () => {
    try {
      setLoading(true);
      const statesData = lazyLocationService.getStates();
      setStates(statesData);
    } catch (error) {
      console.error('Error loading states:', error);
      Alert.alert('Error', 'Failed to load states. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = () => {
    try {
      const locationStats = lazyLocationService.getLocationStats();
      setStats(locationStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadLocalGovernments = async (stateId) => {
    if (!stateId) return;
    
    try {
      setLoading(true);
      const lgasData = await lazyLocationService.getLGAs(stateId);
      setLocalGovernments(lgasData);
    } catch (error) {
      console.error('Error loading local governments:', error);
      Alert.alert('Error', 'Failed to load local governments.');
    } finally {
      setLoading(false);
    }
  };

  const loadWards = async (lgaId) => {
    if (!lgaId) return;
    
    try {
      setLoading(true);
      const wardsData = await lazyLocationService.getWards(lgaId);
      setWards(wardsData);
    } catch (error) {
      console.error('Error loading wards:', error);
      Alert.alert('Error', 'Failed to load wards.');
    } finally {
      setLoading(false);
    }
  };

  const loadPollingUnits = async (wardId) => {
    if (!wardId) return;
    
    try {
      setLoading(true);
      const pollingUnitsData = await lazyLocationService.getPollingUnits(wardId);
      setPollingUnits(pollingUnitsData);
    } catch (error) {
      console.error('Error loading polling units:', error);
      Alert.alert('Error', 'Failed to load polling units.');
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (value) => {
    if (value !== selectedState) {
      setSelectedState(value);
      setSelectedLGA('');
      setSelectedWard('');
      setSelectedPollingUnit('');
    }
  };

  const handleLGAChange = (value) => {
    if (value !== selectedLGA) {
      setSelectedLGA(value);
      setSelectedWard('');
      setSelectedPollingUnit('');
    }
  };

  const handleWardChange = (value) => {
    if (value !== selectedWard) {
      setSelectedWard(value);
      setSelectedPollingUnit('');
    }
  };

  const handlePollingUnitChange = (value) => {
    setSelectedPollingUnit(value);
  };

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* State Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>State *</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedState}
            onValueChange={handleStateChange}
            enabled={!disabled && !loading}
            style={styles.picker}
          >
            <Picker.Item label="Select State" value="" />
            {states.map((state) => (
              <Picker.Item
                key={state.id}
                label={state.name}
                value={state.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Local Government Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Local Government *</Text>
        <View style={[styles.pickerWrapper, !selectedState && styles.pickerDisabled]}>
          <Picker
            selectedValue={selectedLGA}
            onValueChange={handleLGAChange}
            enabled={!disabled && !loading && selectedState}
            style={styles.picker}
          >
            <Picker.Item label="Select LGA" value="" />
            {localGovernments.map((lga) => (
              <Picker.Item
                key={lga.id}
                label={lga.name}
                value={lga.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Ward Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Ward *</Text>
        <View style={[styles.pickerWrapper, !selectedLGA && styles.pickerDisabled]}>
          <Picker
            selectedValue={selectedWard}
            onValueChange={handleWardChange}
            enabled={!disabled && !loading && selectedLGA}
            style={styles.picker}
          >
            <Picker.Item label="Select Ward" value="" />
            {wards.map((ward) => (
              <Picker.Item
                key={ward.id}
                label={ward.name}
                value={ward.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Polling Unit Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Polling Unit</Text>
        <View style={[styles.pickerWrapper, !selectedWard && styles.pickerDisabled]}>
          <Picker
            selectedValue={selectedPollingUnit}
            onValueChange={handlePollingUnitChange}
            enabled={!disabled && !loading && selectedWard}
            style={styles.picker}
          >
            <Picker.Item label="Select Polling Unit" value="" />
            {pollingUnits.map((unit) => (
              <Picker.Item
                key={unit.id}
                label={unit.name}
                value={unit.value}
              />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  pickerDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  picker: {
    height: 50,
  },
});

export default LocationPicker;
