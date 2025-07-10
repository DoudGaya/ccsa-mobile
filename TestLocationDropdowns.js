import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import SearchableSelect from './src/components/common/SearchableSelect';
import { optimizedLocationService } from './src/services/optimizedLocationService';

export default function TestLocationDropdowns() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedLGA, setSelectedLGA] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingUnit, setSelectedPollingUnit] = useState('');

  const [stateOptions, setStateOptions] = useState([]);
  const [lgaOptions, setLgaOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);
  const [pollingUnitOptions, setPollingUnitOptions] = useState([]);

  useEffect(() => {
    const loadStates = async () => {
      console.log('TestLocationDropdowns: Loading states...');
      try {
        const states = await optimizedLocationService.getFormattedStates();
        console.log('TestLocationDropdowns: States loaded:', states.length);
        setStateOptions(states);
      } catch (error) {
        console.error('TestLocationDropdowns: Error loading states:', error);
      }
    };
    
    loadStates();
  }, []);

  useEffect(() => {
    const loadLgas = async () => {
      console.log('TestLocationDropdowns: State changed to:', selectedState);
      if (selectedState) {
        try {
          const lgas = await optimizedLocationService.getFormattedLocalGovernments(selectedState);
          console.log('TestLocationDropdowns: LGAs loaded:', lgas.length);
          setLgaOptions(lgas);
          
          // Reset dependent fields
          setSelectedLGA('');
          setSelectedWard('');
          setSelectedPollingUnit('');
          setWardOptions([]);
          setPollingUnitOptions([]);
        } catch (error) {
          console.error('TestLocationDropdowns: Error loading LGAs:', error);
        }
      } else {
        setLgaOptions([]);
        setWardOptions([]);
        setPollingUnitOptions([]);
      }
    };
    
    loadLgas();
  }, [selectedState]);

  useEffect(() => {
    const loadWards = async () => {
      console.log('TestLocationDropdowns: LGA changed to:', selectedLGA);
      if (selectedState && selectedLGA) {
        try {
          const wards = await optimizedLocationService.getFormattedWards(selectedState, selectedLGA);
          console.log('TestLocationDropdowns: Wards loaded:', wards.length);
          setWardOptions(wards);
          
          // Reset dependent fields
          setSelectedWard('');
          setSelectedPollingUnit('');
          setPollingUnitOptions([]);
        } catch (error) {
          console.error('TestLocationDropdowns: Error loading wards:', error);
        }
      } else {
        setWardOptions([]);
        setPollingUnitOptions([]);
      }
    };
    
    loadWards();
  }, [selectedState, selectedLGA]);

  useEffect(() => {
    const loadPollingUnits = async () => {
      console.log('TestLocationDropdowns: Ward changed to:', selectedWard);
      if (selectedState && selectedLGA && selectedWard) {
        try {
          const pollingUnits = await optimizedLocationService.getFormattedPollingUnits(selectedState, selectedLGA, selectedWard);
          console.log('TestLocationDropdowns: Polling units loaded:', pollingUnits.length);
          setPollingUnitOptions(pollingUnits);
          
          // Reset dependent field
          setSelectedPollingUnit('');
        } catch (error) {
          console.error('TestLocationDropdowns: Error loading polling units:', error);
        }
      } else {
        setPollingUnitOptions([]);
      }
    };
    
    loadPollingUnits();
  }, [selectedState, selectedLGA, selectedWard]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Location Dropdown Test</Text>
        
        {/* State */}
        <View style={styles.section}>
          <Text style={styles.label}>State ({stateOptions.length} options)</Text>
          <SearchableSelect
            options={stateOptions}
            selectedValue={selectedState}
            onValueChange={setSelectedState}
            placeholder="Select State"
            searchPlaceholder="Search states..."
          />
          {selectedState && (
            <Text style={styles.selectedText}>Selected: {selectedState}</Text>
          )}
        </View>

        {/* Local Government */}
        <View style={styles.section}>
          <Text style={styles.label}>Local Government ({lgaOptions.length} options)</Text>
          <SearchableSelect
            options={lgaOptions}
            selectedValue={selectedLGA}
            onValueChange={setSelectedLGA}
            placeholder="Select Local Government"
            searchPlaceholder="Search local governments..."
            disabled={!selectedState}
          />
          {selectedLGA && (
            <Text style={styles.selectedText}>Selected: {selectedLGA}</Text>
          )}
        </View>

        {/* Ward */}
        <View style={styles.section}>
          <Text style={styles.label}>Ward ({wardOptions.length} options)</Text>
          <SearchableSelect
            options={wardOptions}
            selectedValue={selectedWard}
            onValueChange={setSelectedWard}
            placeholder="Select Ward"
            searchPlaceholder="Search wards..."
            disabled={!selectedLGA}
          />
          {selectedWard && (
            <Text style={styles.selectedText}>Selected: {selectedWard}</Text>
          )}
        </View>

        {/* Polling Unit */}
        <View style={styles.section}>
          <Text style={styles.label}>Polling Unit ({pollingUnitOptions.length} options)</Text>
          <SearchableSelect
            options={pollingUnitOptions}
            selectedValue={selectedPollingUnit}
            onValueChange={setSelectedPollingUnit}
            placeholder="Select Polling Unit"
            searchPlaceholder="Search polling units..."
            disabled={!selectedWard}
          />
          {selectedPollingUnit && (
            <Text style={styles.selectedText}>Selected: {selectedPollingUnit}</Text>
          )}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Summary:</Text>
          <Text>State: {selectedState || 'None'}</Text>
          <Text>LGA: {selectedLGA || 'None'}</Text>
          <Text>Ward: {selectedWard || 'None'}</Text>
          <Text>Polling Unit: {selectedPollingUnit || 'None'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#374151',
  },
  selectedText: {
    marginTop: 8,
    fontSize: 14,
    color: '#10b981',
    fontStyle: 'italic',
  },
  summary: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
