import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert 
} from 'react-native';

const BackendDiscovery = () => {
  const [customIP, setCustomIP] = useState('');
  const [customPort, setCustomPort] = useState('3000');
  const [scanResults, setScanResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // Common IP ranges and ports to scan
  const getIPsToScan = (baseIP) => {
    const baseParts = baseIP.split('.');
    const subnet = `${baseParts[0]}.${baseParts[1]}.${baseParts[2]}`;
    const ips = [];
    
    // Scan common IP ranges
    for (let i = 1; i < 255; i++) {
      ips.push(`${subnet}.${i}`);
    }
    
    return ips;
  };

  const commonPorts = [3000, 3001, 3002, 8000, 8080, 5000, 4000];

  const testEndpoint = async (ip, port) => {
    const url = `http://${ip}:${port}/api/test`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data, url };
      } else {
        return { success: false, error: `HTTP ${response.status}`, url };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      return { success: false, error: error.message, url };
    }
  };

  const scanNetwork = async () => {
    setIsScanning(true);
    setScanResults([]);
    
    // Get current device IP to determine subnet
    let baseIPs = ['192.168.1', '192.168.0', '192.168.10', '10.0.0', '172.16.0'];
    
    // If custom IP is provided, use its subnet
    if (customIP) {
      const parts = customIP.split('.');
      if (parts.length >= 3) {
        baseIPs = [`${parts[0]}.${parts[1]}.${parts[2]}`];
      }
    }

    const results = [];
    let totalTests = 0;
    let completedTests = 0;

    // Count total tests
    for (const baseIP of baseIPs) {
      // Test common IPs in each subnet
      const testIPs = [
        `${baseIP}.1`,     // Router
        `${baseIP}.100`,   // Common range
        `${baseIP}.101`,
        `${baseIP}.138`,   // From your original config
        `${baseIP}.220`,   // From your .env
        customIP || `${baseIP}.50`
      ];

      totalTests += testIPs.length * commonPorts.length;
    }

    for (const baseIP of baseIPs) {
      const testIPs = [
        `${baseIP}.1`,
        `${baseIP}.100`,
        `${baseIP}.101`, 
        `${baseIP}.138`,
        `${baseIP}.220`,
        customIP || `${baseIP}.50`
      ];

      for (const ip of testIPs) {
        for (const port of commonPorts) {
          try {
            const result = await testEndpoint(ip, port);
            completedTests++;
            
            if (result.success) {
              results.push({
                ip,
                port,
                status: 'success',
                message: 'Backend server found!',
                data: result.data,
                url: result.url
              });
              
              // Update results immediately when we find a working server
              setScanResults([...results]);
            }
          } catch (error) {
            completedTests++;
          }
          
          // Update progress
          if (completedTests % 10 === 0) {
            setScanResults([...results, {
              status: 'progress',
              message: `Scanned ${completedTests}/${totalTests} endpoints...`,
              progress: (completedTests / totalTests) * 100
            }]);
          }
        }
      }
    }

    // Final results
    setScanResults(results.length > 0 ? results : [{
      status: 'error',
      message: 'No backend servers found',
      details: `Scanned ${totalTests} endpoints`
    }]);
    
    setIsScanning(false);
  };

  const testCustomEndpoint = async () => {
    if (!customIP) {
      Alert.alert('Error', 'Please enter an IP address');
      return;
    }

    setIsScanning(true);
    const result = await testEndpoint(customIP, customPort);
    
    setScanResults([{
      ip: customIP,
      port: customPort,
      status: result.success ? 'success' : 'error',
      message: result.success ? 'Backend server found!' : `Failed: ${result.error}`,
      data: result.data,
      url: result.url
    }]);
    
    setIsScanning(false);
  };

  const getNetworkInfo = () => {
    Alert.alert(
      'Network Discovery Help',
      `This tool scans common IP addresses and ports to find your backend server.

Common scenarios:
• Development: localhost:3000
• Local network: 192.168.x.x:3000
• Docker: Check container IP
• Cloud: Use public IP/domain

If you know your server's IP, enter it in the custom field.

The scan will test these ports: ${commonPorts.join(', ')}`,
      [{ text: 'OK' }]
    );
  };

  const updateEnvironment = (ip, port) => {
    const envUrl = `http://${ip}:${port}/api`;
    Alert.alert(
      'Update Environment',
      `Update your .env file with:

EXPO_PUBLIC_API_BASE_URL=${envUrl}

Then restart your development server.`,
      [
        { text: 'Copy URL', onPress: () => {
          // In a real app, you'd copy to clipboard
          console.log('Copy to clipboard:', envUrl);
        }},
        { text: 'OK' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Server Discovery</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Scan</Text>
        <TouchableOpacity 
          style={[styles.button, isScanning && styles.buttonDisabled]} 
          onPress={scanNetwork}
          disabled={isScanning}
        >
          <Text style={styles.buttonText}>
            {isScanning ? 'Scanning Network...' : 'Scan for Backend Servers'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Custom Address</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="IP Address (e.g., 192.168.1.100)"
            value={customIP}
            onChangeText={setCustomIP}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { flex: 1, marginLeft: 10 }]}
            placeholder="Port"
            value={customPort}
            onChangeText={setCustomPort}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity 
          style={[styles.button, styles.buttonSecondary, isScanning && styles.buttonDisabled]} 
          onPress={testCustomEndpoint}
          disabled={isScanning}
        >
          <Text style={styles.buttonText}>Test Custom Address</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.helpRow}>
        <TouchableOpacity style={styles.helpButton} onPress={getNetworkInfo}>
          <Text style={styles.helpText}>ℹ️ Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.results}>
        <Text style={styles.resultsTitle}>Scan Results</Text>
        {scanResults.map((result, index) => (
          <View 
            key={index} 
            style={[
              styles.resultItem, 
              { borderLeftColor: 
                result.status === 'success' ? '#4CAF50' : 
                result.status === 'progress' ? '#FF9800' : '#F44336' 
              }
            ]}
          >
            {result.status === 'success' && (
              <>
                <Text style={styles.successText}>✅ Found Backend Server!</Text>
                <Text style={styles.resultText}>Address: {result.ip}:{result.port}</Text>
                <Text style={styles.resultText}>URL: {result.url}</Text>
                {result.data && (
                  <Text style={styles.resultText}>
                    Response: {JSON.stringify(result.data).substring(0, 100)}...
                  </Text>
                )}
                <TouchableOpacity 
                  style={styles.updateButton}
                  onPress={() => updateEnvironment(result.ip, result.port)}
                >
                  <Text style={styles.updateButtonText}>Update .env File</Text>
                </TouchableOpacity>
              </>
            )}
            
            {result.status === 'progress' && (
              <>
                <Text style={styles.progressText}>{result.message}</Text>
                {result.progress && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${result.progress}%` }]} />
                  </View>
                )}
              </>
            )}
            
            {result.status === 'error' && (
              <>
                <Text style={styles.errorText}>❌ {result.message}</Text>
                {result.details && <Text style={styles.resultText}>{result.details}</Text>}
              </>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    fontSize: 16,
  },
  helpRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  helpButton: {
    padding: 10,
  },
  helpText: {
    color: '#666',
    fontSize: 14,
  },
  results: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
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
  successText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    color: '#FF9800',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  updateButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginTop: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 2,
  },
});

export default BackendDiscovery;
