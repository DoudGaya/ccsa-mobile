import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import optimizedLocationService from './src/services/optimizedLocationServiceV2';

const FinalLocationTest = () => {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [lgas, setLgas] = useState([]);
  const [selectedLga, setSelectedLga] = useState('');
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState('');
  const [pollingUnits, setPollingUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
    setStates([]);
    setLgas([]);
    setWards([]);
    setPollingUnits([]);
    setSelectedState('');
    setSelectedLga('');
    setSelectedWard('');
  };

  const testStatesLoading = async () => {
    try {
      setLoading(true);
      addResult('🏛️ Testing states loading...', 'info');
      
      const statesData = await optimizedLocationService.getStates();
      addResult(`✅ States loaded: ${statesData.length} states`, 'success');
      
      const formattedStates = await optimizedLocationService.getFormattedStates();
      addResult(`✅ Formatted states: ${formattedStates.length} options`, 'success');
      
      setStates(formattedStates);
      
      // Show first 5 states
      const firstFive = statesData.slice(0, 5).map(s => s.name).join(', ');
      addResult(`📋 First 5 states: ${firstFive}`, 'info');
      
    } catch (error) {
      addResult(`❌ Error loading states: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testLgasLoading = async (stateValue) => {
    try {
      setLoading(true);
      addResult(`🏘️ Testing LGAs for ${stateValue}...`, 'info');
      
      const lgasData = await optimizedLocationService.getLgasForState(stateValue);
      addResult(`✅ LGAs loaded: ${lgasData.length} LGAs`, 'success');
      
      const formattedLgas = await optimizedLocationService.getFormattedLocalGovernments(stateValue);
      addResult(`✅ Formatted LGAs: ${formattedLgas.length} options`, 'success');
      
      setLgas(formattedLgas);
      setSelectedState(stateValue);
      
    } catch (error) {
      addResult(`❌ Error loading LGAs: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testWardsLoading = async (stateValue, lgaValue) => {
    try {
      setLoading(true);
      addResult(`🏡 Testing wards for ${stateValue}-${lgaValue}...`, 'info');
      
      const wardsData = await optimizedLocationService.getWardsForLga(stateValue, lgaValue);
      addResult(`✅ Wards loaded: ${wardsData.length} wards`, 'success');
      
      const formattedWards = await optimizedLocationService.getFormattedWards(stateValue, lgaValue);
      addResult(`✅ Formatted wards: ${formattedWards.length} options`, 'success');
      
      setWards(formattedWards);
      setSelectedLga(lgaValue);
      
    } catch (error) {
      addResult(`❌ Error loading wards: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testPollingUnitsLoading = async (stateValue, lgaValue, wardValue) => {
    try {
      setLoading(true);
      addResult(`🗳️ Testing polling units for ${stateValue}-${lgaValue}-${wardValue}...`, 'info');
      
      const pollingData = await optimizedLocationService.getPollingUnitsForWard(stateValue, lgaValue, wardValue);
      addResult(`✅ Polling units loaded: ${pollingData.length} units`, 'success');
      
      const formattedPolling = await optimizedLocationService.getFormattedPollingUnits(stateValue, lgaValue, wardValue);
      addResult(`✅ Formatted polling units: ${formattedPolling.length} options`, 'success');
      
      setPollingUnits(formattedPolling);
      setSelectedWard(wardValue);
      
    } catch (error) {
      addResult(`❌ Error loading polling units: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testStatesLoading();
  }, []);

  const renderOptions = (options, title, onSelect) => (
    <View style={styles.optionsContainer}>
      <Text style={styles.sectionTitle}>{title} ({options.length})</Text>
      <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
        {options.slice(0, 10).map((option, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.optionItem}
            onPress={() => onSelect && onSelect(option.value)}
          >
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
        {options.length > 10 && (
          <Text style={styles.moreText}>... and {options.length - 10} more</Text>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🇳🇬 Final Location Dropdown Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={clearResults}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Clear & Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testStatesLoading}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Reload States</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Test Results */}
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Test Results:</Text>
          {testResults.map((result, index) => (
            <View key={index} style={[
              styles.resultItem, 
              result.type === 'success' ? styles.successResult : 
              result.type === 'error' ? styles.errorResult : styles.infoResult
            ]}>
              <Text style={styles.resultText}>{result.message}</Text>
              <Text style={styles.resultTime}>{result.time}</Text>
            </View>
          ))}
        </View>

        {/* States */}
        {states.length > 0 && renderOptions(states, 'States', (value) => {
          if (value) testLgasLoading(value);
        })}

        {/* LGAs */}
        {lgas.length > 0 && renderOptions(lgas, 'LGAs', (value) => {
          if (value && selectedState) testWardsLoading(selectedState, value);
        })}

        {/* Wards */}
        {wards.length > 0 && renderOptions(wards, 'Wards', (value) => {
          if (value && selectedState && selectedLga) testPollingUnitsLoading(selectedState, selectedLga, value);
        })}

        {/* Polling Units */}
        {pollingUnits.length > 0 && renderOptions(pollingUnits, 'Polling Units')}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#2c3e50',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#e74c3c',
  },
  secondaryButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  resultsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  resultItem: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
    borderLeftWidth: 3,
  },
  successResult: {
    backgroundColor: '#d4edda',
    borderLeftColor: '#28a745',
  },
  errorResult: {
    backgroundColor: '#f8d7da',
    borderLeftColor: '#dc3545',
  },
  infoResult: {
    backgroundColor: '#d1ecf1',
    borderLeftColor: '#17a2b8',
  },
  resultText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  resultTime: {
    fontSize: 10,
    color: '#6c757d',
    marginTop: 2,
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionsList: {
    maxHeight: 200,
  },
  optionItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  optionText: {
    fontSize: 14,
    color: '#495057',
  },
  moreText: {
    fontStyle: 'italic',
    color: '#6c757d',
    textAlign: 'center',
    padding: 8,
  },
});

export default FinalLocationTest;
