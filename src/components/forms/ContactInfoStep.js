import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';

// Nigerian states
const NIGERIAN_STATES = [
  { label: 'Select State', value: '' },
  { label: 'Abia', value: 'ABIA' },
  { label: 'Adamawa', value: 'ADAMAWA' },
  { label: 'Akwa Ibom', value: 'AKWA_IBOM' },
  { label: 'Anambra', value: 'ANAMBRA' },
  { label: 'Bauchi', value: 'BAUCHI' },
  { label: 'Bayelsa', value: 'BAYELSA' },
  { label: 'Benue', value: 'BENUE' },
  { label: 'Borno', value: 'BORNO' },
  { label: 'Cross River', value: 'CROSS_RIVER' },
  { label: 'Delta', value: 'DELTA' },
  { label: 'Ebonyi', value: 'EBONYI' },
  { label: 'Edo', value: 'EDO' },
  { label: 'Ekiti', value: 'EKITI' },
  { label: 'Enugu', value: 'ENUGU' },
  { label: 'FCT', value: 'FCT' },
  { label: 'Gombe', value: 'GOMBE' },
  { label: 'Imo', value: 'IMO' },
  { label: 'Jigawa', value: 'JIGAWA' },
  { label: 'Kaduna', value: 'KADUNA' },
  { label: 'Kano', value: 'KANO' },
  { label: 'Katsina', value: 'KATSINA' },
  { label: 'Kebbi', value: 'KEBBI' },
  { label: 'Kogi', value: 'KOGI' },
  { label: 'Kwara', value: 'KWARA' },
  { label: 'Lagos', value: 'LAGOS' },
  { label: 'Nasarawa', value: 'NASARAWA' },
  { label: 'Niger', value: 'NIGER' },
  { label: 'Ogun', value: 'OGUN' },
  { label: 'Ondo', value: 'ONDO' },
  { label: 'Osun', value: 'OSUN' },
  { label: 'Oyo', value: 'OYO' },
  { label: 'Plateau', value: 'PLATEAU' },
  { label: 'Rivers', value: 'RIVERS' },
  { label: 'Sokoto', value: 'SOKOTO' },
  { label: 'Taraba', value: 'TARABA' },
  { label: 'Yobe', value: 'YOBE' },
  { label: 'Zamfara', value: 'ZAMFARA' },
];

const SAMPLE_CLUSTERS = [
  { label: 'Select Cluster', value: '' },
  { label: 'North Central', value: 'NORTH_CENTRAL' },
  { label: 'North East', value: 'NORTH_EAST' },
  { label: 'North West', value: 'NORTH_WEST' },
  { label: 'South East', value: 'SOUTH_EAST' },
  { label: 'South South', value: 'SOUTH_SOUTH' },
  { label: 'South West', value: 'SOUTH_WEST' },
];

export default function ContactInfoStep({ control, errors }) {
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
              <View style={[styles.pickerContainer, errors.contactInfo?.state && styles.inputError]}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  {NIGERIAN_STATES.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
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
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.contactInfo?.localGovernment && styles.inputError]}
                  placeholder="Enter Local Government Area"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              </View>
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
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.contactInfo?.ward && styles.inputError]}
                  placeholder="Enter Ward"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              </View>
            )}
          />
          {errors.contactInfo?.ward && (
            <Text style={styles.errorText}>{errors.contactInfo.ward.message}</Text>
          )}
        </View>

        {/* Polling Unit */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Polling Unit *</Text>
          <Controller
            control={control}
            name="contactInfo.pollingUnit"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="checkbox-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.contactInfo?.pollingUnit && styles.inputError]}
                  placeholder="Enter Polling Unit"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              </View>
            )}
          />
          {errors.contactInfo?.pollingUnit && (
            <Text style={styles.errorText}>{errors.contactInfo.pollingUnit.message}</Text>
          )}
        </View>

        {/* Cluster */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cluster *</Text>
          <Controller
            control={control}
            name="contactInfo.cluster"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.pickerContainer, errors.contactInfo?.cluster && styles.inputError]}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  {SAMPLE_CLUSTERS.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            )}
          />
          {errors.contactInfo?.cluster && (
            <Text style={styles.errorText}>{errors.contactInfo.cluster.message}</Text>
          )}
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  picker: {
    height: 50,
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
});
