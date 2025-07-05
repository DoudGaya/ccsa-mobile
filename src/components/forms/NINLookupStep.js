import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';

export default function NINLookupStep({ control, errors, onNINLookup }) {
  const [nin, setNin] = useState('');
  const [hasLookedUp, setHasLookedUp] = useState(false);

  const handleLookup = () => {
    if (nin.length !== 11) {
      Alert.alert('Invalid NIN', 'NIN must be exactly 11 digits');
      return;
    }
    onNINLookup(nin);
    setHasLookedUp(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="card-outline" size={48} color="#2563eb" />
        <Text style={styles.title}>NIN Lookup</Text>
        <Text style={styles.description}>
          Enter the farmer's National Identification Number (NIN) to fetch and auto-fill personal information
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>National Identification Number (NIN)</Text>
          <Controller
            control={control}
            name="nin"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="card-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.nin && styles.inputError]}
                  placeholder="Enter 11-digit NIN"
                  value={value || nin}
                  onChangeText={(text) => {
                    setNin(text);
                    onChange(text);
                  }}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  maxLength={11}
                />
                {nin.length === 11 && !hasLookedUp && (
                  <TouchableOpacity style={styles.lookupButton} onPress={handleLookup}>
                    <Ionicons name="search" size={20} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
          {errors.nin && (
            <Text style={styles.errorText}>{errors.nin.message}</Text>
          )}
        </View>

        {!hasLookedUp && nin.length === 11 && (
          <TouchableOpacity style={styles.lookupButtonLarge} onPress={handleLookup}>
            <Ionicons name="search" size={24} color="#ffffff" />
            <Text style={styles.lookupButtonText}>Lookup NIN</Text>
          </TouchableOpacity>
        )}

        {hasLookedUp && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#059669" />
            <Text style={styles.successText}>NIN Found!</Text>
            <Text style={styles.successDescription}>
              Personal information has been pre-filled. You can edit the details in the next step.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle-outline" size={20} color="#2563eb" />
          <Text style={styles.infoText}>
            NIN must be unique and will be used to identify the farmer
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#2563eb" />
          <Text style={styles.infoText}>
            All data is securely encrypted and stored
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 18,
    color: '#1f2937',
    letterSpacing: 1,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  lookupButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    margin: 4,
    borderRadius: 8,
  },
  lookupButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  lookupButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  successContainer: {
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 8,
    marginBottom: 4,
  },
  successDescription: {
    fontSize: 16,
    color: '#065f46',
    textAlign: 'center',
    lineHeight: 22,
  },
  info: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    marginLeft: 8,
    flex: 1,
  },
});
