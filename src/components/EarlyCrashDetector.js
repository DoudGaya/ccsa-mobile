import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  Alert,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EarlyCrashDetector = ({ children, onCrashDetected }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [crashDetected, setCrashDetected] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [initializationStep, setInitializationStep] = useState('Starting...');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Step 1: Check for previous crashes
      setInitializationStep('Checking crash history...');
      await checkPreviousCrashes();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Test critical dependencies
      setInitializationStep('Testing dependencies...');
      await testCriticalDependencies();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Initialize storage
      setInitializationStep('Initializing storage...');
      await initializeStorage();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Mark successful startup
      setInitializationStep('Finalizing startup...');
      await markSuccessfulStartup();
      await new Promise(resolve => setTimeout(resolve, 500));

      setInitializationStep('Ready!');
      setIsLoading(false);

    } catch (error) {
      console.error('Early crash detected:', error);
      await logCrash('EARLY_INITIALIZATION', error);
      setCrashDetected(true);
      setIsLoading(false);
      if (onCrashDetected) {
        onCrashDetected(error);
      }
    }
  };

  const checkPreviousCrashes = async () => {
    try {
      const crashCount = await AsyncStorage.getItem('crash_count');
      const lastCrash = await AsyncStorage.getItem('last_crash_time');
      
      if (crashCount && parseInt(crashCount) > 2) {
        const timeSinceLastCrash = Date.now() - parseInt(lastCrash || '0');
        if (timeSinceLastCrash < 60000) { // Less than 1 minute
          throw new Error('Multiple crashes detected in short time');
        }
      }
    } catch (error) {
      if (error.message.includes('Multiple crashes')) {
        throw error;
      }
      // Storage error, continue
      console.warn('Could not check crash history:', error);
    }
  };

  const testCriticalDependencies = async () => {
    try {
      // Test React Native core
      if (!React || !React.useState) {
        throw new Error('React core not available');
      }

      // Test AsyncStorage
      await AsyncStorage.setItem('test_key', 'test_value');
      const testValue = await AsyncStorage.getItem('test_key');
      if (testValue !== 'test_value') {
        throw new Error('AsyncStorage not working');
      }
      await AsyncStorage.removeItem('test_key');

      // Test setTimeout (JavaScript engine)
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          clearTimeout(timer);
          resolve();
        }, 10);
        
        setTimeout(() => {
          clearTimeout(timer);
          reject(new Error('setTimeout not working'));
        }, 100);
      });

    } catch (error) {
      throw new Error(`Critical dependency test failed: ${error.message}`);
    }
  };

  const initializeStorage = async () => {
    try {
      // Initialize app state storage
      const appState = {
        initialized: true,
        initTime: Date.now(),
        version: '1.0.0'
      };
      await AsyncStorage.setItem('app_state', JSON.stringify(appState));
    } catch (error) {
      throw new Error(`Storage initialization failed: ${error.message}`);
    }
  };

  const markSuccessfulStartup = async () => {
    try {
      await AsyncStorage.setItem('last_successful_startup', Date.now().toString());
      await AsyncStorage.removeItem('crash_count'); // Reset crash count on successful startup
    } catch (error) {
      console.warn('Could not mark successful startup:', error);
      // Don't throw here, this is not critical
    }
  };

  const logCrash = async (type, error) => {
    try {
      const crashLog = {
        type,
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        step: initializationStep
      };

      // Increment crash count
      const crashCount = await AsyncStorage.getItem('crash_count');
      const newCrashCount = (parseInt(crashCount) || 0) + 1;
      await AsyncStorage.setItem('crash_count', newCrashCount.toString());
      await AsyncStorage.setItem('last_crash_time', Date.now().toString());

      // Store crash log
      const existingLogs = await AsyncStorage.getItem('crash_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(crashLog);
      await AsyncStorage.setItem('crash_logs', JSON.stringify(logs.slice(-10))); // Keep last 10 crashes

    } catch (logError) {
      console.error('Could not log crash:', logError);
    }
  };

  const resetApp = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert(
        'App Reset',
        'All app data has been cleared. The app will restart.',
        [
          {
            text: 'OK',
            onPress: () => {
              // In a real app, you might use CodePush or ask user to restart
              setCrashDetected(false);
              setIsLoading(true);
              initializeApp();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Reset Failed', 'Could not reset app data: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>{initializationStep}</Text>
          <Text style={styles.loadingSubtext}>Ensuring safe startup...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (crashDetected) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.crashContainer}>
          <Text style={styles.crashTitle}>🚨 Startup Issue Detected</Text>
          <Text style={styles.crashMessage}>
            The app encountered an issue during startup. This could be due to:
          </Text>
          <View style={styles.crashReasons}>
            <Text style={styles.crashReason}>• Previous crash affecting app state</Text>
            <Text style={styles.crashReason}>• Device compatibility issue</Text>
            <Text style={styles.crashReason}>• Corrupted app data</Text>
            <Text style={styles.crashReason}>• Insufficient device resources</Text>
          </View>
          
          <Text style={styles.crashStep}>Failed at: {initializationStep}</Text>
          
          <View style={styles.crashActions}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetApp}
            >
              <Text style={styles.resetButtonText}>Reset App Data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.debugButton} 
              onPress={() => setShowDebug(!showDebug)}
            >
              <Text style={styles.debugButtonText}>
                {showDebug ? 'Hide' : 'Show'} Debug Info
              </Text>
            </TouchableOpacity>
          </View>

          {showDebug && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugTitle}>Debug Information:</Text>
              <Text style={styles.debugText}>Step: {initializationStep}</Text>
              <Text style={styles.debugText}>Platform: {require('react-native').Platform.OS}</Text>
              <Text style={styles.debugText}>Time: {new Date().toISOString()}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#1f2937',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  crashContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  crashTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  crashMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  crashReasons: {
    backgroundColor: '#fef2f2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  crashReason: {
    fontSize: 14,
    color: '#7f1d1d',
    marginBottom: 5,
  },
  crashStep: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  crashActions: {
    gap: 15,
  },
  resetButton: {
    backgroundColor: '#dc2626',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#6b7280',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  debugInfo: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});

export default EarlyCrashDetector;
