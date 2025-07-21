import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View, Text } from 'react-native';
import 'react-native-url-polyfill/auto';

// Test minimal app without components that might have import issues
export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.title}>🔧 Component Import Test</Text>
        <Text style={styles.subtitle}>
          If you see this, basic imports work. The issue is with a specific component.
        </Text>
        <StatusBar 
          style="dark" 
          backgroundColor="transparent"
          translucent={Platform.OS === 'android'}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
