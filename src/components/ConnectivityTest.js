import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const ConnectivityTest = () => {
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test, status, message, details = null) => {
    setResults(prev => [...prev, { test, status, message, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    // Test 1: Environment Variables
    addResult('Environment', 'info', `API_BASE_URL: ${process.env.EXPO_PUBLIC_API_BASE_URL || 'undefined'}`);
    
    // Test 2: Basic internet connectivity
    try {
      addResult('Internet', 'testing', 'Testing basic internet connectivity...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD', 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      addResult('Internet', 'success', `Internet OK (Status: ${response.status})`);
    } catch (error) {
      addResult('Internet', 'error', `Internet failed: ${error.message}`);
    }

    // Test 3: API Health endpoint
    try {
      addResult('API Health', 'testing', 'Testing API health endpoint...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('https://ccsa-mobile-api.vercel.app/api/health', {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        addResult('API Health', 'success', `API Health OK (Status: ${response.status})`, data);
      } else {
        const errorText = await response.text();
        addResult('API Health', 'warning', `API Health returned ${response.status}`, errorText);
      }
    } catch (error) {
      addResult('API Health', 'error', `API Health failed: ${error.message}`);
    }

    // Test 4: Temp NIN endpoint
    try {
      addResult('Temp NIN', 'testing', 'Testing temp NIN endpoint...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('https://ccsa-mobile-api.vercel.app/api/temp-nin/lookup?nin=12345678901', {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        addResult('Temp NIN', 'success', `Temp NIN OK (Status: ${response.status})`, data);
      } else {
        const errorText = await response.text();
        addResult('Temp NIN', 'warning', `Temp NIN returned ${response.status}`, errorText);
      }
    } catch (error) {
      addResult('Temp NIN', 'error', `Temp NIN failed: ${error.message}`);
    }

    setTesting(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'testing': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'testing': return '🔄';
      default: return 'ℹ️';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connectivity Diagnostic</Text>
      
      <TouchableOpacity 
        style={[styles.button, testing && styles.buttonDisabled]} 
        onPress={runTests}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Running Tests...' : 'Run Connectivity Tests'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>{getStatusIcon(result.status)}</Text>
              <Text style={styles.resultTest}>{result.test}</Text>
              <Text style={styles.resultTime}>{result.timestamp}</Text>
            </View>
            <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
              {result.message}
            </Text>
            {result.details && (
              <Text style={styles.resultDetails}>
                {typeof result.details === 'string' 
                  ? result.details 
                  : JSON.stringify(result.details, null, 2)
                }
              </Text>
            )}
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
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  resultIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  resultTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  resultMessage: {
    fontSize: 14,
    marginBottom: 5,
  },
  resultDetails: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
});

export default ConnectivityTest;
