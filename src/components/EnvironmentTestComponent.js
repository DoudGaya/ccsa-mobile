// Mobile app environment test
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export const EnvironmentTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, result) => {
    setTestResults(prev => [...prev, {
      test,
      result: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runEnvironmentTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Test environment variables
      addResult('API Base URL', process.env.EXPO_PUBLIC_API_BASE_URL);
      addResult('Debug Network', process.env.EXPO_PUBLIC_DEBUG_NETWORK);
      addResult('Node Environment', process.env.NODE_ENV);
      
      // Test simple fetch to health endpoint
      addResult('Testing Health Endpoint', 'Starting...');
      
      try {
        const response = await fetch('https://ccsa-mobile-api.vercel.app/api/health', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        addResult('Health Response Status', response.status);
        addResult('Health Response OK', response.ok);
        
        const data = await response.json();
        addResult('Health Response Data', data);
        
      } catch (error) {
        addResult('Health Endpoint Error', `${error.name}: ${error.message}`);
      }
      
      // Test farmers endpoint without auth
      addResult('Testing Farmers Endpoint (No Auth)', 'Starting...');
      
      try {
        const response = await fetch('https://ccsa-mobile-api.vercel.app/api/farmers', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        addResult('Farmers Response Status', response.status);
        addResult('Farmers Response OK', response.ok);
        
        const data = await response.json();
        addResult('Farmers Response Data', data);
        
      } catch (error) {
        addResult('Farmers Endpoint Error', `${error.name}: ${error.message}`);
      }
      
    } catch (error) {
      addResult('Environment Tests Error', `${error.name}: ${error.message}`);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    runEnvironmentTests();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Environment & API Test</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={runEnvironmentTests}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Running Tests...' : 'Run Tests Again'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.testName}>{result.test}</Text>
            <Text style={styles.timestamp}>{result.timestamp}</Text>
            <Text style={styles.resultText}>{result.result}</Text>
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
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
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
});
