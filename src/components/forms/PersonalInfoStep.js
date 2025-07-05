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

const GENDER_OPTIONS = [
  { label: 'Select Gender', value: '' },
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
];

const EMPLOYMENT_STATUS_OPTIONS = [
  { label: 'Select Employment Status', value: '' },
  { label: 'Employed', value: 'EMPLOYED' },
  { label: 'Self-Employed', value: 'SELF_EMPLOYED' },
  { label: 'Unemployed', value: 'UNEMPLOYED' },
  { label: 'Student', value: 'STUDENT' },
  { label: 'Retired', value: 'RETIRED' },
];

const QUALIFICATION_OPTIONS = [
  { label: 'Select Highest Qualification', value: '' },
  { label: 'No Formal Education', value: 'NONE' },
  { label: 'Primary Education', value: 'PRIMARY' },
  { label: 'Secondary Education', value: 'SECONDARY' },
  { label: 'Tertiary Education', value: 'TERTIARY' },
  { label: 'Vocational Training', value: 'VOCATIONAL' },
];

const MARITAL_STATUS_OPTIONS = [
  { label: 'Select Marital Status', value: '' },
  { label: 'Single', value: 'SINGLE' },
  { label: 'Married', value: 'MARRIED' },
  { label: 'Divorced', value: 'DIVORCED' },
  { label: 'Widowed', value: 'WIDOWED' },
];

export default function PersonalInfoStep({ control, errors }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-outline" size={48} color="#2563eb" />
        <Text style={styles.title}>Personal Information</Text>
        <Text style={styles.description}>
          Complete the farmer's personal details
        </Text>
      </View>

      <View style={styles.form}>
        {/* First Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name *</Text>
          <Controller
            control={control}
            name="personalInfo.firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.personalInfo?.firstName && styles.inputError]}
                  placeholder="Enter first name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              </View>
            )}
          />
          {errors.personalInfo?.firstName && (
            <Text style={styles.errorText}>{errors.personalInfo.firstName.message}</Text>
          )}
        </View>

        {/* Middle Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Middle Name</Text>
          <Controller
            control={control}
            name="personalInfo.middleName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter middle name (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              </View>
            )}
          />
        </View>

        {/* Last Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name *</Text>
          <Controller
            control={control}
            name="personalInfo.lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.personalInfo?.lastName && styles.inputError]}
                  placeholder="Enter last name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              </View>
            )}
          />
          {errors.personalInfo?.lastName && (
            <Text style={styles.errorText}>{errors.personalInfo.lastName.message}</Text>
          )}
        </View>

        {/* Date of Birth */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth *</Text>
          <Controller
            control={control}
            name="personalInfo.dateOfBirth"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.personalInfo?.dateOfBirth && styles.inputError]}
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </View>
            )}
          />
          {errors.personalInfo?.dateOfBirth && (
            <Text style={styles.errorText}>{errors.personalInfo.dateOfBirth.message}</Text>
          )}
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender *</Text>
          <Controller
            control={control}
            name="personalInfo.gender"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.pickerContainer, errors.personalInfo?.gender && styles.inputError]}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  {GENDER_OPTIONS.map((option) => (
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
          {errors.personalInfo?.gender && (
            <Text style={styles.errorText}>{errors.personalInfo.gender.message}</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <Controller
            control={control}
            name="personalInfo.email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.personalInfo?.email && styles.inputError]}
                  placeholder="Enter email address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}
          />
          {errors.personalInfo?.email && (
            <Text style={styles.errorText}>{errors.personalInfo.email.message}</Text>
          )}
        </View>

        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <Controller
            control={control}
            name="personalInfo.phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.personalInfo?.phoneNumber && styles.inputError]}
                  placeholder="08012345678"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
            )}
          />
          {errors.personalInfo?.phoneNumber && (
            <Text style={styles.errorText}>{errors.personalInfo.phoneNumber.message}</Text>
          )}
        </View>

        {/* WhatsApp Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>WhatsApp Number</Text>
          <Controller
            control={control}
            name="personalInfo.whatsAppNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="logo-whatsapp" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="08012345678 (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
            )}
          />
        </View>

        {/* Employment Status */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Employment Status *</Text>
          <Controller
            control={control}
            name="personalInfo.employmentStatus"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.pickerContainer, errors.personalInfo?.employmentStatus && styles.inputError]}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
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
          {errors.personalInfo?.employmentStatus && (
            <Text style={styles.errorText}>{errors.personalInfo.employmentStatus.message}</Text>
          )}
        </View>

        {/* Highest Qualification */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Highest Qualification *</Text>
          <Controller
            control={control}
            name="personalInfo.highestQualification"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.pickerContainer, errors.personalInfo?.highestQualification && styles.inputError]}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  {QUALIFICATION_OPTIONS.map((option) => (
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
          {errors.personalInfo?.highestQualification && (
            <Text style={styles.errorText}>{errors.personalInfo.highestQualification.message}</Text>
          )}
        </View>

        {/* Marital Status */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Marital Status *</Text>
          <Controller
            control={control}
            name="personalInfo.maritalStatus"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.pickerContainer, errors.personalInfo?.maritalStatus && styles.inputError]}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  {MARITAL_STATUS_OPTIONS.map((option) => (
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
          {errors.personalInfo?.maritalStatus && (
            <Text style={styles.errorText}>{errors.personalInfo.maritalStatus.message}</Text>
          )}
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
});
