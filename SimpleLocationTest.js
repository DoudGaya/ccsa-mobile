import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const SimpleLocationTest = () => {
  const [testResults, setTestResults] = useState([]);
  
  const addTestResult = (test, result, data = null) => {
    setTestResults(prev => [...prev, { test, result, data, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testStatesLoading = async () => {
    try {
      addTestResult('Loading states.json', 'STARTED');
      
      // Test direct import
      const statesData = require('./assets/location/states.json');
      addTestResult('Direct require states.json', 'SUCCESS', `${statesData.length} states`);
      
      // Test first 3 states
      const firstThree = statesData.slice(0, 3);
      addTestResult('First 3 states', 'SUCCESS', firstThree.map(s => s.name).join(', '));
      
    } catch (error) {
      addTestResult('Loading states.json', 'ERROR', error.message);
    }
  };

  const testLgasLoading = async () => {
    try {
      addTestResult('Loading lgas-by-state.json', 'STARTED');
      
      const lgasData = require('./assets/location/lgas-by-state.json');
      const states = Object.keys(lgasData);
      addTestResult('Direct require lgas-by-state.json', 'SUCCESS', `${states.length} states with LGAs`);
      
      // Test Lagos LGAs
      const lagosLgas = lgasData['lagos'] || [];
      addTestResult('Lagos LGAs', 'SUCCESS', `${lagosLgas.length} LGAs in Lagos`);
      
    } catch (error) {
      addTestResult('Loading lgas-by-state.json', 'ERROR', error.message);
    }
  };

  const testServiceInit = async () => {
    try {
      addTestResult('OptimizedLocationService init', 'STARTED');
      
      const optimizedLocationService = require('./src/services/optimizedLocationServiceV2').default;
      addTestResult('Service import', 'SUCCESS', 'Service imported');
      
      // Test getStates method
      const states = await optimizedLocationService.getStates();
      addTestResult('getStates() method', 'SUCCESS', `${states.length} states loaded`);
      
      // Test formatted states
      const formattedStates = await optimizedLocationService.getFormattedStates();
      addTestResult('getFormattedStates() method', 'SUCCESS', `${formattedStates.length} formatted states`);
      
    } catch (error) {
      addTestResult('OptimizedLocationService test', 'ERROR', error.message);
    }
  };

  const runAllTests = () => {
    setTestResults([]);
    testStatesLoading();
    testLgasLoading();
    testServiceInit();
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Location Service Debug Test</Text>
      
      <TouchableOpacity style={styles.button} onPress={runAllTests}>
        <Text style={styles.buttonText}>Run All Tests</Text>
      </TouchableOpacity>

      <View style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <View key={index} style={[
            styles.resultItem, 
            result.result === 'SUCCESS' ? styles.success : 
            result.result === 'ERROR' ? styles.error : styles.info
          ]}>
            <Text style={styles.resultTitle}>{result.test}</Text>
            <Text style={styles.resultStatus}>{result.result}</Text>
            {result.data && <Text style={styles.resultData}>{result.data}</Text>}
            <Text style={styles.resultTime}>{result.timestamp}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  success: {
    backgroundColor: '#d4edda',
    borderLeftColor: '#28a745',
  },
  error: {
    backgroundColor: '#f8d7da',
    borderLeftColor: '#dc3545',
  },
  info: {
    backgroundColor: '#d1ecf1',
    borderLeftColor: '#17a2b8',
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2c3e50',
  },
  resultStatus: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  resultData: {
    fontSize: 12,
    color: '#495057',
    marginTop: 4,
    fontStyle: 'italic',
  },
  resultTime: {
    fontSize: 10,
    color: '#adb5bd',
    marginTop: 4,
  },
});

export default SimpleLocationTest;
