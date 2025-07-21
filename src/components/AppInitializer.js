import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AppInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting app initialization...');
        
        // Add a small delay to ensure all modules are loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if critical services are available
        const checks = [
          { name: 'Firebase Auth', check: () => require('../services/firebase').auth },
          { name: 'AsyncStorage', check: () => require('@react-native-async-storage/async-storage') },
          { name: 'Navigation', check: () => require('@react-navigation/native') },
        ];

        for (const { name, check } of checks) {
          try {
            const service = check();
            console.log(`✅ ${name} loaded successfully`);
          } catch (error) {
            console.warn(`⚠️ ${name} failed to load:`, error.message);
          }
        }

        console.log('🎉 App initialization completed');
        setIsInitialized(true);
        
      } catch (error) {
        console.error('💥 App initialization failed:', error);
        setInitError(error.message);
        
        // In production, try to continue anyway after a delay
        setTimeout(() => {
          console.log('🔧 Attempting to continue despite initialization errors...');
          setIsInitialized(true);
        }, 3000);
      }
    };

    initializeApp();
  }, []);

  if (initError) {
    return (
      <View style={styles.container}>
        <Ionicons name="warning-outline" size={60} color="#ef4444" />
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
        <Text style={styles.waitMessage}>Attempting to continue...</Text>
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Ionicons name="rocket-outline" size={80} color="#3b82f6" />
        <Text style={styles.title}>CCSA FIMS</Text>
        <Text style={styles.subtitle}>Initializing...</Text>
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  waitMessage: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  loader: {
    marginTop: 16,
  },
});

export default AppInitializer;
