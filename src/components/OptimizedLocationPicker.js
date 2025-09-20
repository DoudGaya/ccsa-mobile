import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { lazyLocationService } from '../services/lazyLocationService';

const LocationPicker = ({ 
  onLocationChange, 
  initialValues = {}, 
  required = true,
  showPollingUnits = true 
}) => {
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingUnits, setPollingUnits] = useState([]);
  
  const [selectedState, setSelectedState] = useState(initialValues.state || '');
  const [selectedLGA, setSelectedLGA] = useState(initialValues.lga || '');
  const [selectedWard, setSelectedWard] = useState(initialValues.ward || '');
  const [selectedPollingUnit, setSelectedPollingUnit] = useState(initialValues.pollingUnit || '');
  
  const [loading, setLoading] = useState(false);

  // Load states on component mount
  useEffect(() => {
    loadStates();
  }, []);

  // Load LGAs when state changes
  useEffect(() => {
    if (selectedState) {
      loadLGAs(selectedState);
      // Reset dependent selections
      setSelectedLGA('');
      setSelectedWard('');
      setSelectedPollingUnit('');
      setWards([]);
      setPollingUnits([]);
    }
  }, [selectedState]);

  // Load wards when LGA changes
  useEffect(() => {
    if (selectedLGA) {
      loadWards(selectedLGA);
      // Reset dependent selections
      setSelectedWard('');
      setSelectedPollingUnit('');
      setPollingUnits([]);
    }
  }, [selectedLGA]);

  // Load polling units when ward changes
  useEffect(() => {
    if (selectedWard && showPollingUnits) {
      loadPollingUnits(selectedWard);
      // Reset dependent selection
      setSelectedPollingUnit('');
    }
  }, [selectedWard, showPollingUnits]);

  // Notify parent component of location changes
  useEffect(() => {
    const locationData = {
      state: selectedState,
      lga: selectedLGA,
      ward: selectedWard,
      pollingUnit: showPollingUnits ? selectedPollingUnit : null,
      stateDetails: states.find(s => s.value === selectedState),
      lgaDetails: lgas.find(l => l.value === selectedLGA),
      wardDetails: wards.find(w => w.value === selectedWard),
      pollingUnitDetails: showPollingUnits ? pollingUnits.find(p => p.value === selectedPollingUnit) : null,
    };
    
    onLocationChange && onLocationChange(locationData);
  }, [selectedState, selectedLGA, selectedWard, selectedPollingUnit, states, lgas, wards, pollingUnits, showPollingUnits, onLocationChange]);

  const loadStates = () => {
    try {
      const statesData = lazyLocationService.getStates();
      console.log('🏛️ OptimizedLocationPicker: Loaded states:', statesData.length);
      setStates(statesData);
    } catch (error) {
      console.error('❌ Error loading states:', error);
      Alert.alert('Error', 'Failed to load states data');
    }
  };

  const loadLGAs = async (stateId) => {
    try {
      setLoading(true);
      console.log('🏘️ OptimizedLocationPicker: Loading LGAs for state:', stateId);
      const lgasData = await lazyLocationService.getLGAs(stateId);
      console.log('🏘️ OptimizedLocationPicker: Loaded LGAs:', lgasData.length);
      setLgas(lgasData);
    } catch (error) {
      console.error('❌ Error loading LGAs:', error);
      Alert.alert('Error', 'Failed to load local governments data');
    } finally {
      setLoading(false);
    }
  };

  const loadWards = async (lgaId) => {
    try {
      setLoading(true);
      console.log('🏡 OptimizedLocationPicker: Loading wards for LGA:', lgaId);
      const wardsData = await lazyLocationService.getWards(lgaId);
      console.log('🏡 OptimizedLocationPicker: Loaded wards:', wardsData.length);
      setWards(wardsData);
    } catch (error) {
      console.error('❌ Error loading wards:', error);
      Alert.alert('Error', 'Failed to load wards data');
    } finally {
      setLoading(false);
    }
  };

  const loadPollingUnits = async (wardId) => {
    try {
      setLoading(true);
      console.log('🗳️ OptimizedLocationPicker: Loading polling units for ward:', wardId);
      const pollingUnitsData = await lazyLocationService.getPollingUnits(wardId);
      console.log('🗳️ OptimizedLocationPicker: Loaded polling units:', pollingUnitsData.length);
      setPollingUnits(pollingUnitsData);
    } catch (error) {
      console.error('❌ Error loading polling units:', error);
      Alert.alert('Error', 'Failed to load polling units data');
    } finally {
      setLoading(false);
    }
  };

  const resetLocation = () => {
    setSelectedState('');
    setSelectedLGA('');
    setSelectedWard('');
    setSelectedPollingUnit('');
    setLgas([]);
    setWards([]);
    setPollingUnits([]);
  };

  return (
    <View style={styles.container}>
      {/* Header with stats */}
      <View style={styles.header}>
        <Text style={styles.title}>Location Selection</Text>
        <Text style={styles.subtitle}>
          {LOCATION_STATS.totalStates} states, {LOCATION_STATS.totalLGAs} LGAs, {LOCATION_STATS.totalWards} wards
        </Text>
      </View>

      {/* State Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>
          State {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedState}
            onValueChange={setSelectedState}
            style={styles.picker}
            enabled={states.length > 0}
          >
            <Picker.Item label="Select State" value="" />
            {states.map(state => (
              <Picker.Item
                key={state.id}
                label={state.label}
                value={state.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* LGA Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>
          Local Government {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={[styles.pickerWrapper, !selectedState && styles.disabled]}>
          <Picker
            selectedValue={selectedLGA}
            onValueChange={setSelectedLGA}
            style={styles.picker}
            enabled={selectedState && lgas.length > 0 && !loading}
          >
            <Picker.Item 
              label={selectedState ? "Select Local Government" : "Select State First"} 
              value="" 
            />
            {lgas.map(lga => (
              <Picker.Item
                key={lga.id}
                label={lga.label}
                value={lga.value}
              />
            ))}
          </Picker>
          {loading && (
            <ActivityIndicator 
              size="small" 
              color="#007AFF" 
              style={styles.loadingIndicator} 
            />
          )}
        </View>
      </View>

      {/* Ward Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>
          Ward {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={[styles.pickerWrapper, !selectedLGA && styles.disabled]}>
          <Picker
            selectedValue={selectedWard}
            onValueChange={setSelectedWard}
            style={styles.picker}
            enabled={selectedLGA && wards.length > 0 && !loading}
          >
            <Picker.Item 
              label={selectedLGA ? "Select Ward" : "Select Local Government First"} 
              value="" 
            />
            {wards.map(ward => (
              <Picker.Item
                key={ward.id}
                label={ward.label}
                value={ward.value}
              />
            ))}
          </Picker>
          {loading && (
            <ActivityIndicator 
              size="small" 
              color="#007AFF" 
              style={styles.loadingIndicator} 
            />
          )}
        </View>
      </View>

      {/* Polling Unit Picker (optional) */}
      {showPollingUnits && (
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>
            Polling Unit {required && <Text style={styles.required}>*</Text>}
          </Text>
          <View style={[styles.pickerWrapper, !selectedWard && styles.disabled]}>
            <Picker
              selectedValue={selectedPollingUnit}
              onValueChange={setSelectedPollingUnit}
              style={styles.picker}
              enabled={selectedWard && pollingUnits.length > 0 && !loading}
            >
              <Picker.Item 
                label={selectedWard ? "Select Polling Unit" : "Select Ward First"} 
                value="" 
              />
              {pollingUnits.map(unit => (
                <Picker.Item
                  key={unit.id}
                  label={unit.label}
                  value={unit.value}
                />
              ))}
            </Picker>
            {loading && (
              <ActivityIndicator 
                size="small" 
                color="#007AFF" 
                style={styles.loadingIndicator} 
              />
            )}
          </View>
        </View>
      )}

      {/* Reset Button */}
      {(selectedState || selectedLGA || selectedWard || selectedPollingUnit) && (
        <TouchableOpacity style={styles.resetButton} onPress={resetLocation}>
          <Text style={styles.resetButtonText}>Reset Location</Text>
        </TouchableOpacity>
      )}

      {/* Selected Location Summary */}
      {selectedState && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Selected Location:</Text>
          <Text style={styles.summaryText}>
            {states.find(s => s.value === selectedState)?.label || 'Unknown State'}
            {selectedLGA && lgas.find(l => l.value === selectedLGA)?.label && ` → ${lgas.find(l => l.value === selectedLGA).label}`}
            {selectedWard && wards.find(w => w.value === selectedWard)?.label && ` → ${wards.find(w => w.value === selectedWard).label}`}
            {selectedPollingUnit && showPollingUnits && pollingUnits.find(p => p.value === selectedPollingUnit)?.label && ` → ${pollingUnits.find(p => p.value === selectedPollingUnit).label}`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  disabled: {
    backgroundColor: '#F8F8F8',
    opacity: 0.6,
  },
  picker: {
    height: 50,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  summary: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeft: 4,
    borderLeftColor: '#007AFF',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default LocationPicker;
