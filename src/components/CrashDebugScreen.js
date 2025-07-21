import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

const CrashDebugScreen = ({ onClose }) => {
  const [logs, setLogs] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [appInfo, setAppInfo] = useState({});

  useEffect(() => {
    collectDebugInfo();
  }, []);

  const collectDebugInfo = async () => {
    try {
      // Collect device information
      const device = {
        brand: Device.brand,
        manufacturer: Device.manufacturer,
        modelName: Device.modelName,
        osName: Device.osName,
        osVersion: Device.osVersion,
        platformApiLevel: Device.platformApiLevel,
        totalMemory: Device.totalMemory,
        isDevice: Device.isDevice,
        deviceType: Device.deviceType,
      };
      setDeviceInfo(device);

      // Collect app information
      const app = {
        applicationName: Application.applicationName,
        applicationId: Application.applicationId,
        nativeApplicationVersion: Application.nativeApplicationVersion,
        nativeBuildVersion: Application.nativeBuildVersion,
      };
      setAppInfo(app);

      // Collect console logs from AsyncStorage if stored
      try {
        const storedLogs = await AsyncStorage.getItem('crash_logs');
        if (storedLogs) {
          setLogs(JSON.parse(storedLogs));
        }
      } catch (logError) {
        console.log('No stored logs found');
      }

      // Test critical services
      await testServices();

    } catch (error) {
      console.error('Error collecting debug info:', error);
    }
  };

  const testServices = async () => {
    const testResults = [];
    
    // Test Firebase
    try {
      const { auth } = require('../services/firebase');
      testResults.push({
        service: 'Firebase Auth',
        status: auth ? 'Available' : 'Failed',
        details: auth ? 'Service loaded' : 'Service not available'
      });
    } catch (firebaseError) {
      testResults.push({
        service: 'Firebase Auth',
        status: 'Error',
        details: firebaseError.message
      });
    }

    // Test AsyncStorage
    try {
      await AsyncStorage.setItem('test_key', 'test_value');
      await AsyncStorage.removeItem('test_key');
      testResults.push({
        service: 'AsyncStorage',
        status: 'Working',
        details: 'Read/write test passed'
      });
    } catch (storageError) {
      testResults.push({
        service: 'AsyncStorage',
        status: 'Failed',
        details: storageError.message
      });
    }

    // Test Network
    try {
      const response = await fetch('https://google.com', { method: 'HEAD' });
      testResults.push({
        service: 'Network',
        status: response.ok ? 'Connected' : 'Limited',
        details: `Status: ${response.status}`
      });
    } catch (networkError) {
      testResults.push({
        service: 'Network',
        status: 'Failed',
        details: networkError.message
      });
    }

    setLogs(prev => [...prev, ...testResults]);
  };

  const exportDebugInfo = async () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      deviceInfo,
      appInfo,
      logs,
      platform: Platform.OS,
      crashType: 'Logo -> Blank Screen -> Crash',
      buildType: __DEV__ ? 'Development' : 'Production'
    };

    try {
      await AsyncStorage.setItem('full_debug_info', JSON.stringify(debugData, null, 2));
      Alert.alert(
        'Debug Info Exported',
        'Debug information has been saved. You can extract this from the APK for analysis.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Export Failed', error.message);
    }
  };

  const clearLogs = async () => {
    try {
      await AsyncStorage.removeItem('crash_logs');
      await AsyncStorage.removeItem('full_debug_info');
      setLogs([]);
      Alert.alert('Logs Cleared', 'All debug logs have been cleared.');
    } catch (error) {
      Alert.alert('Clear Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🐛 Crash Debug Tool</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Device Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Device Information</Text>
          <View style={styles.infoGrid}>
            <Text style={styles.infoLabel}>Brand:</Text>
            <Text style={styles.infoValue}>{deviceInfo.brand || 'Unknown'}</Text>
            <Text style={styles.infoLabel}>Model:</Text>
            <Text style={styles.infoValue}>{deviceInfo.modelName || 'Unknown'}</Text>
            <Text style={styles.infoLabel}>OS:</Text>
            <Text style={styles.infoValue}>{deviceInfo.osName} {deviceInfo.osVersion}</Text>
            <Text style={styles.infoLabel}>Memory:</Text>
            <Text style={styles.infoValue}>{deviceInfo.totalMemory ? `${Math.round(deviceInfo.totalMemory / 1024 / 1024 / 1024)}GB` : 'Unknown'}</Text>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 App Information</Text>
          <View style={styles.infoGrid}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{appInfo.applicationName || 'CCSA FIMS'}</Text>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>{appInfo.nativeApplicationVersion || '1.0.0'}</Text>
            <Text style={styles.infoLabel}>Build:</Text>
            <Text style={styles.infoValue}>{appInfo.nativeBuildVersion || '1'}</Text>
            <Text style={styles.infoLabel}>Mode:</Text>
            <Text style={styles.infoValue}>{__DEV__ ? 'Development' : 'Production'}</Text>
          </View>
        </View>

        {/* Service Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Service Status</Text>
          {logs.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <View style={styles.logHeader}>
                <Text style={styles.logService}>{log.service || 'Unknown'}</Text>
                <Text style={[
                  styles.logStatus,
                  { color: getStatusColor(log.status) }
                ]}>
                  {log.status || 'Unknown'}
                </Text>
              </View>
              <Text style={styles.logDetails}>{log.details || 'No details'}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={exportDebugInfo}>
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Export Debug Info</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButtonSecondary} onPress={clearLogs}>
            <Ionicons name="trash-outline" size={20} color="#666" />
            <Text style={styles.actionButtonTextSecondary}>Clear Logs</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📋 Debug Instructions</Text>
          <Text style={styles.instructionsText}>
            1. Export debug info before the app crashes{'\n'}
            2. Use ADB to extract: adb backup -apk -shared ccsa.mobile{'\n'}
            3. Extract AsyncStorage data from backup{'\n'}
            4. Look for 'full_debug_info' key{'\n'}
            5. Share this data for crash analysis
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Working':
    case 'Available':
    case 'Connected':
      return '#10b981';
    case 'Failed':
    case 'Error':
      return '#ef4444';
    case 'Limited':
    case 'Warning':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoLabel: {
    width: '30%',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  infoValue: {
    width: '70%',
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 8,
  },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 12,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logService: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  logStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  logDetails: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  actions: {
    marginVertical: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  actionButtonTextSecondary: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructions: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
});

export default CrashDebugScreen;
