import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { farmerService } from '../services/farmerService';


export const NetworkTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, result, isError = false) => {
    setTestResults(prev => [...prev, {
      test,
      result: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
      isError,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runNetworkTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('Basic Network Check', 'Starting...');
      addResult('Basic Network Check', 'Completed');
      addResult('Test Google Connectivity', 'Testing...');
      try {
        const response = await fetch('https://www.google.com', { method: 'HEAD' });
        addResult('Test Google Connectivity', `Success: ${response.status}`);
      } catch (error) {
        addResult('Test Google Connectivity', error.message, true);
      }
      
      addResult('Test Vercel API Health', 'Testing...');
      try {
        const response = await fetch('https://ccsa-mobile-api.vercel.app/api/health');
        const data = await response.json();
        addResult('Test Vercel API Health', `Success: ${data.status}`);
      } catch (error) {
        addResult('Test Vercel API Health', error.message, true);
      }
      
      addResult('Test Farmers API (Unauthenticated)', 'Testing...');
      try {
        const response = await fetch('https://ccsa-mobile-api.vercel.app/api/farmers');
        const data = await response.json();
        addResult('Test Farmers API (Unauthenticated)', `Response: ${data.error || 'Unexpected success'}`);
      } catch (error) {
        addResult('Test Farmers API (Unauthenticated)', error.message, true);
      }
      
    } catch (error) {
      addResult('Network Tests', error.message, true);
    }
    
    setLoading(false);
  };

  const testFarmerService = async () => {
    setLoading(true);
    
    try {
      addResult('Farmer Service Test', 'Starting getFarmers...');
      const result = await farmerService.getFarmers(1, 5);
      addResult('Farmer Service Test', 'Success!');
      addResult('Farmer Service Result', result);
    } catch (error) {
      addResult('Farmer Service Test', error.message, true);
    }
    
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Debugging Tool</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#007AFF' }]} 
          onPress={runNetworkTests}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Run Network Tests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#34C759' }]} 
          onPress={testFarmerService}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Farmer Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#FF3B30' }]} 
          onPress={() => setTestResults([])}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      {loading && <Text style={styles.loading}>Running tests...</Text>}

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <View key={index} style={[styles.resultItem, result.isError && styles.errorItem]}>
            <Text style={styles.testName}>{result.test}</Text>
            <Text style={styles.timestamp}>{result.timestamp}</Text>
            <Text style={[styles.resultText, result.isError && styles.errorText]}>
              {result.result}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  button: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    minWidth: 100,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 20,
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  errorItem: {
    borderLeftColor: '#FF3B30',
  },
  testName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 12,
    color: '#333',
  },
  errorText: {
    color: '#FF3B30',
  },
});
