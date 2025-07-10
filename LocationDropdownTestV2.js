import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import SearchableSelect from './src/components/common/SearchableSelect';
import optimizedLocationService from './src/services/optimizedLocationServiceV2';

const LocationDropdownTest = () => {
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingUnits, setPollingUnits] = useState([]);
  
  const [selectedState, setSelectedState] = useState('');
  const [selectedLga, setSelectedLga] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingUnit, setSelectedPollingUnit] = useState('');
  
  const [loading, setLoading] = useState({
    states: false,
    lgas: false,
    wards: false,
    polling: false
  });

  // Load states on component mount
  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      setLoading(prev => ({ ...prev, states: true }));
      const formattedStates = await optimizedLocationService.getFormattedStates();
      setStates(formattedStates);
      console.log('✅ States loaded in component:', formattedStates.length);
    } catch (error) {
      console.error('❌ Error loading states in component:', error);
    } finally {
      setLoading(prev => ({ ...prev, states: false }));
    }
  };

  // Load LGAs when state changes
  useEffect(() => {
    if (selectedState) {
      loadLgas(selectedState);
    } else {
      setLgas([{ label: 'Select State First', value: '' }]);
      setSelectedLga('');
      setSelectedWard('');
      setSelectedPollingUnit('');
    }
  }, [selectedState]);

  const loadLgas = async (stateValue) => {
    try {
      setLoading(prev => ({ ...prev, lgas: true }));
      const formattedLgas = await optimizedLocationService.getFormattedLocalGovernments(stateValue);
      setLgas(formattedLgas);
      console.log(`✅ LGAs loaded for ${stateValue}:`, formattedLgas.length);
    } catch (error) {
      console.error(`❌ Error loading LGAs for ${stateValue}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, lgas: false }));
    }
  };

  // Load wards when LGA changes
  useEffect(() => {
    if (selectedState && selectedLga) {
      loadWards(selectedState, selectedLga);
    } else {
      setWards([{ label: 'Select LGA First', value: '' }]);
      setSelectedWard('');
      setSelectedPollingUnit('');
    }
  }, [selectedState, selectedLga]);

  const loadWards = async (stateValue, lgaValue) => {
    try {
      setLoading(prev => ({ ...prev, wards: true }));
      const formattedWards = await optimizedLocationService.getFormattedWards(stateValue, lgaValue);
      setWards(formattedWards);
      console.log(`✅ Wards loaded for ${stateValue}-${lgaValue}:`, formattedWards.length);
    } catch (error) {
      console.error(`❌ Error loading wards for ${stateValue}-${lgaValue}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, wards: false }));
    }
  };

  // Load polling units when ward changes
  useEffect(() => {
    if (selectedState && selectedLga && selectedWard) {
      loadPollingUnits(selectedState, selectedLga, selectedWard);
    } else {
      setPollingUnits([{ label: 'Select Ward First', value: '' }]);
      setSelectedPollingUnit('');
    }
  }, [selectedState, selectedLga, selectedWard]);

  const loadPollingUnits = async (stateValue, lgaValue, wardValue) => {
    try {
      setLoading(prev => ({ ...prev, polling: true }));
      const formattedPollingUnits = await optimizedLocationService.getFormattedPollingUnits(stateValue, lgaValue, wardValue);
      setPollingUnits(formattedPollingUnits);
      console.log(`✅ Polling units loaded for ${stateValue}-${lgaValue}-${wardValue}:`, formattedPollingUnits.length);
    } catch (error) {
      console.error(`❌ Error loading polling units for ${stateValue}-${lgaValue}-${wardValue}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, polling: false }));
    }
  };

  const clearCache = () => {
    optimizedLocationService.clearCache();
    console.log('🧹 Cache cleared');
  };

  const showCacheStats = () => {
    const stats = optimizedLocationService.getCacheStats();
    console.log('📊 Cache Stats:', stats);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🇳🇬 Nigeria Location Dropdown Test</Text>
      
      <View style={styles.debugPanel}>
        <TouchableOpacity style={styles.debugButton} onPress={clearCache}>
          <Text style={styles.debugButtonText}>Clear Cache</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.debugButton} onPress={showCacheStats}>
          <Text style={styles.debugButtonText}>Show Cache Stats</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>State:</Text>
        <SearchableSelect
          options={states}
          selectedValue={selectedState}
          onValueChange={setSelectedState}
          placeholder="Select State"
          loading={loading.states}
          disabled={loading.states}
        />
      </View>

      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Local Government Area:</Text>
        <SearchableSelect
          options={lgas}
          selectedValue={selectedLga}
          onValueChange={setSelectedLga}
          placeholder="Select LGA"
          loading={loading.lgas}
          disabled={!selectedState || loading.lgas}
        />
      </View>

      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Ward:</Text>
        <SearchableSelect
          options={wards}
          selectedValue={selectedWard}
          onValueChange={setSelectedWard}
          placeholder="Select Ward"
          loading={loading.wards}
          disabled={!selectedLga || loading.wards}
        />
      </View>

      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Polling Unit:</Text>
        <SearchableSelect
          options={pollingUnits}
          selectedValue={selectedPollingUnit}
          onValueChange={setSelectedPollingUnit}
          placeholder="Select Polling Unit"
          loading={loading.polling}
          disabled={!selectedWard || loading.polling}
        />
      </View>

      <View style={styles.selectionSummary}>
        <Text style={styles.summaryTitle}>Selected Values:</Text>
        <Text style={styles.summaryText}>State: {selectedState || 'None'}</Text>
        <Text style={styles.summaryText}>LGA: {selectedLga || 'None'}</Text>
        <Text style={styles.summaryText}>Ward: {selectedWard || 'None'}</Text>
        <Text style={styles.summaryText}>Polling Unit: {selectedPollingUnit || 'None'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  debugPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  debugButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  debugButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  selectionSummary: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#34495e',
  },
});

export default LocationDropdownTest;
