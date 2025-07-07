import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={80} color="#10b981" />
          </View>
          <Text style={styles.title}>CCSA FIMS</Text>
          <Text style={styles.subtitle}>
            Farmers Information Management System
          </Text>
          <Text style={styles.description}>
            Register and manage Nigerian farmers' data with advanced features including geolocation, search, and certificate generation.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="person-add" size={24} color="#2563eb" />
            <Text style={styles.featureText}>Register Farmers</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="location" size={24} color="#2563eb" />
            <Text style={styles.featureText}>GPS & Mapping</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="search" size={24} color="#2563eb" />
            <Text style={styles.featureText}>Search & Analytics</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="document" size={24} color="#2563eb" />
            <Text style={styles.featureText}>Generate Certificates</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For Enrolment Agents Only
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  feature: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttons: {
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});
