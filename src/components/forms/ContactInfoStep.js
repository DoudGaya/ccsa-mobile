import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';
import CustomSelect from '../common/CustomSelect';
import SearchableSelect from '../common/SearchableSelect';
import StateSelect from '../common/StateSelect';
import LGASelect from '../common/LGASelect';
import WardSelect from '../common/WardSelect';
import PollingUnitSelect from '../common/PollingUnitSelect';
import * as Location from 'expo-location';
import optimizedLocationService from '../../services/optimizedLocationService';

export default function ContactInfoStep({ control, errors, setValue, watch }) {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const coordinates = watch('contactInfo.coordinates');
  
  // Watch form values for cascading dropdowns
  const selectedState = watch('contactInfo.state');
  const selectedLocalGovernment = watch('contactInfo.localGovernment');
  const selectedWard = watch('contactInfo.ward');
  
  // State for dropdown options and loading states
  // Note: Individual select components now handle their own loading

  // Reset dependent fields when parent field changes
  useEffect(() => {
    if (selectedState) {
      setValue('contactInfo.localGovernment', '');
      setValue('contactInfo.ward', '');
      setValue('contactInfo.pollingUnit', '');
    }
  }, [selectedState, setValue]);

  useEffect(() => {
    if (selectedLocalGovernment) {
      setValue('contactInfo.ward', '');
      setValue('contactInfo.pollingUnit', '');
    }
  }, [selectedLocalGovernment, setValue]);

  useEffect(() => {
    if (selectedWard) {
      setValue('contactInfo.pollingUnit', '');
    }
  }, [selectedWard, setValue]);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setValue('contactInfo.coordinates', coords);
      
      Alert.alert(
        'Location Captured', 
        `Latitude: ${coords.latitude.toFixed(6)}\nLongitude: ${coords.longitude.toFixed(6)}`
      );
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLoadingLocation(false);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="location-outline" size={48} color="#2563eb" />
        <Text style={styles.title}>Contact Information</Text>
        <Text style={styles.description}>
          Enter the farmer's address and location details
        </Text>
      </View>

      <View style={styles.form}>
        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <Controller
            control={control}
            name="contactInfo.phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.contactInfo?.phoneNumber && styles.inputError]}
                  placeholder="e.g., 08012345678"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
            )}
          />
          {errors.contactInfo?.phoneNumber && (
            <Text style={styles.errorText}>{errors.contactInfo.phoneNumber.message}</Text>
          )}
        </View>

        {/* WhatsApp Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>WhatsApp Number</Text>
          <Controller
            control={control}
            name="contactInfo.whatsAppNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="logo-whatsapp" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.contactInfo?.whatsAppNumber && styles.inputError]}
                  placeholder="e.g., 08012345678 (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
            )}
          />
          {errors.contactInfo?.whatsAppNumber && (
            <Text style={styles.errorText}>{errors.contactInfo.whatsAppNumber.message}</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <Controller
            control={control}
            name="contactInfo.email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.contactInfo?.email && styles.inputError]}
                  placeholder="farmer@example.com (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}
          />
          {errors.contactInfo?.email && (
            <Text style={styles.errorText}>{errors.contactInfo.email.message}</Text>
          )}
        </View>

        {/* Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address *</Text>
          <Controller
            control={control}
            name="contactInfo.address"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="home-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.contactInfo?.address && styles.inputError]}
                  placeholder="Enter full address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            )}
          />
          {errors.contactInfo?.address && (
            <Text style={styles.errorText}>{errors.contactInfo.address.message}</Text>
          )}
        </View>

        {/* State */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>State *</Text>
          <Controller
            control={control}
            name="contactInfo.state"
            render={({ field: { onChange, value } }) => (
              <StateSelect
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Select State"
                error={!!errors.contactInfo?.state}
              />
            )}
          />
          {errors.contactInfo?.state && (
            <Text style={styles.errorText}>{errors.contactInfo.state.message}</Text>
          )}
        </View>

        {/* Local Government */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Local Government Area *</Text>
          <Controller
            control={control}
            name="contactInfo.localGovernment"
            render={({ field: { onChange, value } }) => (
              <LGASelect
                selectedState={selectedState}
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Select Local Government"
                error={!!errors.contactInfo?.localGovernment}
              />
            )}
          />
          {errors.contactInfo?.localGovernment && (
            <Text style={styles.errorText}>{errors.contactInfo.localGovernment.message}</Text>
          )}
        </View>

        {/* Ward */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ward *</Text>
          <Controller
            control={control}
            name="contactInfo.ward"
            render={({ field: { onChange, value } }) => (
              <WardSelect
                selectedState={selectedState}
                selectedLGA={selectedLocalGovernment}
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Select Ward"
                error={!!errors.contactInfo?.ward}
              />
            )}
          />
          {errors.contactInfo?.ward && (
            <Text style={styles.errorText}>{errors.contactInfo.ward.message}</Text>
          )}
        </View>

        {/* Polling Unit */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Polling Unit</Text>
          <Controller
            control={control}
            name="contactInfo.pollingUnit"
            render={({ field: { onChange, value } }) => (
              <PollingUnitSelect
                selectedState={selectedState}
                selectedLGA={selectedLocalGovernment}
                selectedWard={selectedWard}
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Select Polling Unit (Optional)"
                error={!!errors.contactInfo?.pollingUnit}
              />
            )}
          />
          {errors.contactInfo?.pollingUnit && (
            <Text style={styles.errorText}>{errors.contactInfo.pollingUnit.message}</Text>
          )}
        </View>

        {/* GPS Coordinates for Farmer Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Farmer Location (GPS)</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={loadingLocation}
          >
            <Ionicons
              name={loadingLocation ? "sync" : "location"}
              size={20}
              color="#ffffff"
            />
            <Text style={styles.locationButtonText}>
              {loadingLocation ? 'Getting Location...' : 'Capture Current Location'}
            </Text>
          </TouchableOpacity>
          
          {coordinates && (
            <View style={styles.coordinatesDisplay}>
              <Text style={styles.coordinatesText}>
                Latitude: {coordinates.latitude.toFixed(6)}
              </Text>
              <Text style={styles.coordinatesText}>
                Longitude: {coordinates.longitude.toFixed(6)}
              </Text>
            </View>
          )}
          <Text style={styles.helperText}>
            This captures the farmer's current location for verification
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle-outline" size={20} color="#2563eb" />
          <Text style={styles.infoText}>
            Accurate location information helps with farmer identification and outreach
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
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  inputIcon: {
    marginLeft: 16,
    marginTop: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  info: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  locationButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  coordinatesDisplay: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
