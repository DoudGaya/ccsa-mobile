import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { ninService } from '../services/ninService';

export default function NINDiagnostic() {
  const [testNin, setTestNin] = useState('12345678901'); // Test NIN
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (test, status, message, data = null) => {
    const result = {
      id: Date.now(),
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString(),
    };
    setResults(prev => [result, ...prev]);
  };

  const testConnectivity = async () => {
    setLoading(true);
    addResult('Connectivity Test', 'running', 'Testing NIN service connectivity...');
    
    try {
      const result = await ninService.testConnection();
      addResult(
        'Connectivity Test',
        result.success ? 'success' : 'error',
        result.message,
        result.details
      );
    } catch (error) {
      addResult('Connectivity Test', 'error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testNinLookup = async () => {
    if (!testNin || testNin.length !== 11) {
      Alert.alert('Invalid NIN', 'Please enter an 11-digit NIN');
      return;
    }

    setLoading(true);
    addResult('NIN Lookup Test', 'running', `Testing NIN lookup for: ${testNin}`);
    
    try {
      const result = await ninService.lookupNIN(testNin);
      addResult(
        'NIN Lookup Test',
        'success',
        `NIN lookup successful for ${result.firstName} ${result.lastName}`,
        result
      );
    } catch (error) {
      addResult('NIN Lookup Test', 'error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'running': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'running': return '🔄';
      default: return '📋';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NIN Service Diagnostics</Text>
        <Text style={styles.subtitle}>Test NIN service connectivity and functionality</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Tests</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={testConnectivity}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '🔄 Testing...' : '🧪 Test Connectivity'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NIN Lookup Test</Text>
        
        <TextInput
          style={styles.input}
          value={testNin}
          onChangeText={setTestNin}
          placeholder="Enter 11-digit NIN"
          maxLength={11}
          keyboardType="numeric"
        />
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testNinLookup}
          disabled={loading || !testNin || testNin.length !== 11}
        >
          <Text style={styles.buttonText}>
            {loading ? '🔄 Looking up...' : '🔍 Test NIN Lookup'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.note}>
          Note: Use 12345678901 for testing with mock data
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <TouchableOpacity onPress={clearResults} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {results.length === 0 ? (
          <View style={styles.emptyResults}>
            <Text style={styles.emptyText}>No test results yet</Text>
            <Text style={styles.emptySubtext}>Run a test to see results here</Text>
          </View>
        ) : (
          results.map((result) => (
            <View key={result.id} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTest}>
                  {getStatusIcon(result.status)} {result.test}
                </Text>
                <Text style={styles.resultTime}>{result.timestamp}</Text>
              </View>
              
              <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
                {result.message}
              </Text>
              
              {result.data && (
                <View style={styles.resultData}>
                  <Text style={styles.dataLabel}>Data:</Text>
                  <Text style={styles.dataText}>
                    {JSON.stringify(result.data, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  note: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  resultItem: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  resultTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  resultMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  resultData: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  dataText: {
    fontSize: 11,
    color: '#374151',
    fontFamily: 'monospace',
  },
});
