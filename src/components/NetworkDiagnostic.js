import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { ninService } from '../services/ninService';

const NetworkDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({});
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async (testName, testFn) => {
    setDiagnostics(prev => ({ 
      ...prev, 
      [testName]: { status: 'running', message: 'Testing...' } 
    }));
    
    try {
      const start = Date.now();
      const result = await testFn();
      const duration = Date.now() - start;
      
      setDiagnostics(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'success', 
          message: result.message || 'Success',
          duration: `${duration}ms`,
          details: result
        } 
      }));
    } catch (error) {
      setDiagnostics(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'error', 
          message: error.message,
          details: error
        } 
      }));
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setDiagnostics({});

    // Test 1: Basic internet connectivity
    await runDiagnostic('internet', async () => {
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return { 
        message: response.ok ? 'Internet connection OK' : 'Internet connection failed',
        status: response.status 
      };
    });

    // Test 2: API server connectivity (multiple IPs)
    const apiUrls = [
      'http://192.168.10.220:3000/api',  // From .env
      'http://192.168.10.138:3000/api',  // Fallback in code
      'http://localhost:3000/api',       // Local development
    ];

    for (let i = 0; i < apiUrls.length; i++) {
      const url = apiUrls[i];
      const testName = `api_server_${i + 1}`;
      
      await runDiagnostic(testName, async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch(`${url}/test`, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' }
          });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            return { 
              message: `API server accessible at ${url}`,
              status: response.status,
              data 
            };
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          clearTimeout(timeoutId);
          throw new Error(`Cannot reach ${url}: ${error.message}`);
        }
      });
    }

    // Test 3: NIN Service connectivity test
    await runDiagnostic('nin_service', async () => {
      const result = await ninService.testConnection();
      if (result.success) {
        return { message: result.message, details: result.details };
      } else {
        throw new Error(result.message);
      }
    });

    // Test 4: Test NIN lookup with sample NIN
    await runDiagnostic('nin_lookup', async () => {
      try {
        // Use a test NIN (this won't work but will test the API structure)
        const result = await ninService.lookupNIN('12345678901');
        return { message: 'NIN lookup successful', data: result };
      } catch (error) {
        // Expected to fail, but we want to see the error type
        return { 
          message: `NIN lookup error (expected): ${error.message}`,
          errorType: error.constructor.name
        };
      }
    });

    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'running': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const showDetails = (testName, details) => {
    Alert.alert(
      `${testName} Details`,
      JSON.stringify(details, null, 2),
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Diagnostics</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={runAllTests}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Running Tests...' : 'Run Network Tests'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.results}>
        {Object.entries(diagnostics).map(([testName, result]) => (
          <TouchableOpacity
            key={testName}
            style={[styles.resultItem, { borderLeftColor: getStatusColor(result.status) }]}
            onPress={() => showDetails(testName, result.details)}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.testName}>{testName.replace(/_/g, ' ').toUpperCase()}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) }]}>
                <Text style={styles.statusText}>{result.status}</Text>
              </View>
            </View>
            <Text style={styles.message}>{result.message}</Text>
            {result.duration && (
              <Text style={styles.duration}>Duration: {result.duration}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.footer}>
        Tap any test result to see detailed information
      </Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  results: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 10,
  },
});

export default NetworkDiagnostic;
