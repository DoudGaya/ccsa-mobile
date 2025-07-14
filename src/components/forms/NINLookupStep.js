import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';

export default function NINLookupStep({ 
  control, 
  errors, 
  onNINLookup, 
  ninValidated = false, 
  onNINChange 
}) {
  const [nin, setNin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localValidationSuccess, setLocalValidationSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Use the parent's ninValidated state as the source of truth
  const validationSuccess = ninValidated || localValidationSuccess;

  const handleLookup = async () => {
    if (nin.length !== 11) {
      Alert.alert('Invalid NIN', 'NIN must be exactly 11 digits');
      return;
    }
    
    setIsLoading(true);
    setLocalValidationSuccess(false);
    setHasError(false);
    setErrorMessage('');
    
    try {
      await onNINLookup(nin);
      setLocalValidationSuccess(true);
      setHasError(false);
      setErrorMessage('');
    } catch (error) {
      console.error('NIN lookup failed:', error);
      setLocalValidationSuccess(false);
      setHasError(true);
      
      // Check if it's a duplicate NIN error
      const isDuplicateNIN = error.message.includes('already been registered') || 
                           error.message.includes('already exists');
      
      // Check if it's a network timeout error
      const isNetworkError = error.message.includes('Network request timed out') || 
                           error.message.includes('network') || 
                           error.message.includes('timeout') ||
                           error.message.includes('Unable to connect');
      
      let errorMsg;
      if (isDuplicateNIN) {
        errorMsg = error.message; // Use the full message from the backend which includes farmer details
      } else if (isNetworkError) {
        errorMsg = 'Network connection failed. Please check your internet connection and try again.';
      } else {
        errorMsg = error.message || 'Unable to validate this NIN. Please check the number and try again.';
      }
      
      setErrorMessage(errorMsg);
      
      // Show alert for duplicate NIN errors and non-network errors
      if (isDuplicateNIN || !isNetworkError) {
        Alert.alert(
          isDuplicateNIN ? 'NIN Already Registered' : 'NIN Validation Failed', 
          errorMsg
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="card-outline" size={48} color="#013358" />
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
                    // Reset validation state when user changes NIN
                    if (validationSuccess) {
                      setLocalValidationSuccess(false);
                      if (onNINChange) {
                        onNINChange();
                      }
                    }
                    // Reset error state when user changes NIN
                    if (hasError) {
                      setHasError(false);
                      setErrorMessage('');
                    }
                  }}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  maxLength={11}
                  editable={!isLoading}
                />
                {nin.length === 11 && !validationSuccess && !isLoading && (
                  <TouchableOpacity style={styles.lookupButton} onPress={handleLookup}>
                    <Ionicons name="search" size={20} color="#ffffff" />
                  </TouchableOpacity>
                )}
                {isLoading && (
                  <ActivityIndicator size="small" color="#013358" style={styles.loadingIcon} />
                )}
                {validationSuccess && (
                  <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                  </View>
                )}
              </View>
            )}
          />
          {errors.nin && (
            <Text style={styles.errorText}>{errors.nin.message}</Text>
          )}
        </View>

        {!validationSuccess && nin.length === 11 && !isLoading && !hasError && (
          <TouchableOpacity style={styles.lookupButtonLarge} onPress={handleLookup}>
            <Ionicons name="search" size={24} color="#ffffff" />
            <Text style={styles.lookupButtonText}>Lookup NIN</Text>
          </TouchableOpacity>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#013358" />
            <Text style={styles.loadingText}>Validating NIN...</Text>
          </View>
        )}

        {hasError && !isLoading && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#dc2626" />
            <Text style={styles.errorTitle}>Validation Failed</Text>
            <Text style={styles.errorDescription}>
              {errorMessage}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleLookup}>
              <Ionicons name="refresh" size={20} color="#ffffff" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {validationSuccess && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#059669" />
            <Text style={styles.successText}>NIN Validated Successfully!</Text>
            <Text style={styles.successDescription}>
              Personal information has been retrieved and will be pre-filled in the next step.
            </Text>
          </View>
        )}

        {nin.length === 11 && !validationSuccess && !isLoading && !hasError && (
          <View style={styles.warningContainer}>
            <Ionicons name="alert-circle" size={48} color="#f59e0b" />
            <Text style={styles.warningText}>NIN Validation Required</Text>
            <Text style={styles.warningDescription}>
              Please click "Lookup NIN" to validate this number before proceeding.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle-outline" size={20} color="#013358" />
          <Text style={styles.infoText}>
            NIN must be unique and will be used to identify the farmer
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#013358" />
          <Text style={styles.infoText}>
            All data is securely encrypted and stored
          </Text>
        </View>
        {!validationSuccess && (
          <View style={styles.warningItem}>
            <Ionicons name="warning-outline" size={20} color="#f59e0b" />
            <Text style={styles.warningText}>
              NIN validation must be successful before proceeding to the next step
            </Text>
          </View>
        )}
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
    backgroundColor: '#013358',
    padding: 12,
    margin: 4,
    borderRadius: 8,
  },
  lookupButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#013358',
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
  loadingIcon: {
    marginRight: 16,
  },
  successIcon: {
    marginRight: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 8,
    marginBottom: 4,
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
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  errorDescription: {
    fontSize: 16,
    color: '#991b1b',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  warningContainer: {
    alignItems: 'center',
    backgroundColor: '#fefbf2',
    padding: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  warningDescription: {
    fontSize: 16,
    color: '#b45309',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
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
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
});
