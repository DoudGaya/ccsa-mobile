import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Clipboard 
} from 'react-native';

const IPDiscovery = () => {
  const [ipInfo, setIpInfo] = useState({});
  const [isScanning, setIsScanning] = useState(false);

  // Get network information
  const getNetworkInfo = async () => {
    const info = {
      timestamp: new Date().toLocaleString(),
      detectedIPs: [],
      suggestions: []
    };

    // Try to get local network info through various methods
    try {
      // Method 1: Try to detect local network through WebRTC (may not work in all environments)
      if (typeof RTCPeerConnection !== 'undefined') {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        
        pc.onicecandidate = (ice) => {
          if (ice && ice.candidate && ice.candidate.candidate) {
            const candidate = ice.candidate.candidate;
            const ipRegex = /(\d+\.\d+\.\d+\.\d+)/;
            const match = candidate.match(ipRegex);
            if (match && !info.detectedIPs.includes(match[1])) {
              info.detectedIPs.push(match[1]);
              setIpInfo({ ...info });
            }
          }
        };
      }
    } catch (error) {
      console.log('WebRTC method failed:', error);
    }

    // Add common network suggestions based on typical configurations
    info.suggestions = [
      '192.168.1.x (Most common home networks)',
      '192.168.0.x (Common router default)',
      '192.168.10.x (Your current config)',
      '10.0.0.x (Corporate networks)',
      '172.16.x.x (Corporate networks)',
      'localhost (Development)'
    ];

    setIpInfo(info);
  };

  // Scan for backend server on detected/suggested IPs
  const scanForBackend = async () => {
    setIsScanning(true);
    
    // Get common IP ranges to scan
    const ipRanges = [
      '192.168.1',
      '192.168.0', 
      '192.168.10',
      '10.0.0',
      '172.16.0'
    ];

    const results = [];
    const ports = [3000, 3001, 8000, 8080, 5000];

    for (const range of ipRanges) {
      // Test common IPs in each range
      const testIPs = [
        `${range}.1`,     // Router
        `${range}.100`,   // Common
        `${range}.101`,
        `${range}.138`,   // Your old config
        `${range}.220`    // Your .env config
      ];

      for (const ip of testIPs) {
        for (const port of ports) {
          try {
            const url = `http://${ip}:${port}/api/test`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(url, {
              method: 'GET',
              signal: controller.signal,
              headers: { 'Content-Type': 'application/json' }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              results.push({
                ip,
                port,
                url: `http://${ip}:${port}/api`,
                status: 'Found Backend!',
                response: await response.json()
              });
            }
          } catch (error) {
            // Silently continue scanning
            continue;
          }
        }
      }
    }

    setIpInfo(prev => ({ ...prev, scanResults: results }));
    setIsScanning(false);

    if (results.length === 0) {
      Alert.alert(
        'No Backend Found', 
        'No backend servers detected. Make sure your backend is running and try the manual IP discovery methods below.'
      );
    }
  };

  const copyToClipboard = (text) => {
    if (Clipboard && Clipboard.setString) {
      Clipboard.setString(text);
      Alert.alert('Copied!', `Copied "${text}" to clipboard`);
    } else {
      Alert.alert('Copy This', text);
    }
  };

  const showInstructions = () => {
    Alert.alert(
      'How to Find Your IP Address',
      `WINDOWS:
1. Open Command Prompt (cmd)
2. Type: ipconfig
3. Look for "IPv4 Address" under your network adapter

MAC/LINUX:
1. Open Terminal
2. Type: ifconfig (Mac) or ip addr (Linux)
3. Look for inet address

COMMON PATTERNS:
• Home WiFi: Usually 192.168.1.x or 192.168.0.x
• Corporate: Often 10.x.x.x or 172.16.x.x
• Development: localhost or 127.0.0.1

Your backend server IP should be the same as your computer's IP.`,
      [{ text: 'OK' }]
    );
  };

  const updateEnvFile = (apiUrl) => {
    Alert.alert(
      'Update .env File',
      `1. Open your .env file
2. Update this line:
EXPO_PUBLIC_API_BASE_URL=${apiUrl}

3. Save the file
4. Restart your development server:
   expo start -c

Would you like to copy the URL?`,
      [
        { text: 'Copy URL', onPress: () => copyToClipboard(apiUrl) },
        { text: 'OK' }
      ]
    );
  };

  useEffect(() => {
    getNetworkInfo();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IP Address Discovery</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.button} onPress={scanForBackend} disabled={isScanning}>
          <Text style={styles.buttonText}>
            {isScanning ? 'Scanning Network...' : 'Auto-Scan for Backend'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={showInstructions}>
          <Text style={styles.buttonText}>Show IP Discovery Instructions</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.results}>
        {ipInfo.scanResults && ipInfo.scanResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Found Backend Servers</Text>
            {ipInfo.scanResults.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.successText}>Backend Found!</Text>
                <Text style={styles.resultText}>IP: {result.ip}:{result.port}</Text>
                <Text style={styles.resultText}>API URL: {result.url}</Text>
                <TouchableOpacity 
                  style={styles.updateButton}
                  onPress={() => updateEnvFile(result.url)}
                >
                  <Text style={styles.updateButtonText}>Use This IP</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Suggestions</Text>
          {ipInfo.suggestions && ipInfo.suggestions.map((suggestion, index) => (
            <Text key={index} style={styles.suggestionText}>• {suggestion}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Configuration</Text>
          <Text style={styles.configText}>From .env: 192.168.10.220:3000</Text>
          <Text style={styles.configText}>Fallback: 192.168.10.138:3000</Text>
          <Text style={styles.helpText}>
            If these don't work, your computer's IP has likely changed.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manual Steps</Text>
          <Text style={styles.stepText}>1. Find your computer's IP address (see instructions above)</Text>
          <Text style={styles.stepText}>2. Make sure your backend server is running</Text>
          <Text style={styles.stepText}>3. Update your .env file with the new IP</Text>
          <Text style={styles.stepText}>4. Restart your development server</Text>
        </View>
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
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonSecondary: {
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    paddingLeft: 10,
  },
  configText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 10,
  },
  updateButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default IPDiscovery;
