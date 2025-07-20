import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, Platform } from 'react-native';

const AndroidDebugScreen = () => {
  const [debugInfo, setDebugInfo] = useState([]);

  useEffect(() => {
    const debug = [];
    
    // Platform check
    debug.push(`Platform: ${Platform.OS} ${Platform.Version}`);
    
    // Check if we're in development mode
    debug.push(`Development: ${__DEV__}`);
    
    // Check environment variables
    debug.push(`API_BASE_URL: ${process.env.EXPO_PUBLIC_API_BASE_URL ? 'Set' : 'Not Set'}`);
    debug.push(`Firebase Config: ${process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not Set'}`);
    
    // Check navigation
    debug.push(`Navigation available: ${typeof navigation !== 'undefined'}`);
    
    console.log('Android Debug Info:', debug);
    setDebugInfo(debug);
    
    // Alert for immediate feedback
    if (Platform.OS === 'android') {
      Alert.alert('Android Debug', `App loaded successfully on Android ${Platform.Version}`);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Android Debug Info</Text>
      {debugInfo.map((info, index) => (
        <Text key={index} style={styles.debugText}>{info}</Text>
      ))}
      <ActivityIndicator size="large" color="#013358" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#013358',
  },
  debugText: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
});

export default AndroidDebugScreen;
