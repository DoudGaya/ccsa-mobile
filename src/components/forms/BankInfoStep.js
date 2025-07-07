import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';
import CustomSelect from '../common/CustomSelect';

// Nigerian Banks
const NIGERIAN_BANKS = [
  { label: 'Select Bank', value: '' },
  { label: 'Access Bank', value: 'ACCESS_BANK' },
  { label: 'Citibank Nigeria', value: 'CITIBANK' },
  { label: 'Ecobank Nigeria', value: 'ECOBANK' },
  { label: 'Fidelity Bank', value: 'FIDELITY_BANK' },
  { label: 'First Bank of Nigeria', value: 'FIRST_BANK' },
  { label: 'First City Monument Bank', value: 'FCMB' },
  { label: 'Guaranty Trust Bank', value: 'GTB' },
  { label: 'Heritage Bank', value: 'HERITAGE_BANK' },
  { label: 'Keystone Bank', value: 'KEYSTONE_BANK' },
  { label: 'Polaris Bank', value: 'POLARIS_BANK' },
  { label: 'Providus Bank', value: 'PROVIDUS_BANK' },
  { label: 'Stanbic IBTC Bank', value: 'STANBIC_IBTC' },
  { label: 'Standard Chartered Bank', value: 'STANDARD_CHARTERED' },
  { label: 'Sterling Bank', value: 'STERLING_BANK' },
  { label: 'Union Bank of Nigeria', value: 'UNION_BANK' },
  { label: 'United Bank for Africa', value: 'UBA' },
  { label: 'Unity Bank', value: 'UNITY_BANK' },
  { label: 'Wema Bank', value: 'WEMA_BANK' },
  { label: 'Zenith Bank', value: 'ZENITH_BANK' },
];

export default function BankInfoStep({ control, errors }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="card-outline" size={48} color="#2563eb" />
        <Text style={styles.title}>Banking Information</Text>
        <Text style={styles.description}>
          Enter the farmer's banking details for financial transactions
        </Text>
      </View>

      <View style={styles.form}>
        {/* BVN */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bank Verification Number (BVN) *</Text>
          <Controller
            control={control}
            name="bankInfo.bvn"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="finger-print" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.bankInfo?.bvn && styles.inputError]}
                  placeholder="Enter 11-digit BVN"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  maxLength={11}
                  secureTextEntry={true}
                />
              </View>
            )}
          />
          {errors.bankInfo?.bvn && (
            <Text style={styles.errorText}>{errors.bankInfo.bvn.message}</Text>
          )}
          <Text style={styles.helperText}>
            BVN is required for identity verification and must be unique
          </Text>
        </View>

        {/* Bank Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bank Name *</Text>
          <Controller
            control={control}
            name="bankInfo.bankName"
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                options={NIGERIAN_BANKS}
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Select Bank"
                error={!!errors.bankInfo?.bankName}
              />
            )}
          />
          {errors.bankInfo?.bankName && (
            <Text style={styles.errorText}>{errors.bankInfo.bankName.message}</Text>
          )}
        </View>

        {/* Account Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Number *</Text>
          <Controller
            control={control}
            name="bankInfo.accountNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="card" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.bankInfo?.accountNumber && styles.inputError]}
                  placeholder="Enter 10-digit account number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            )}
          />
          {errors.bankInfo?.accountNumber && (
            <Text style={styles.errorText}>{errors.bankInfo.accountNumber.message}</Text>
          )}
        </View>

        {/* Account Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Name *</Text>
          <Controller
            control={control}
            name="bankInfo.accountName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.bankInfo?.accountName && styles.inputError]}
                  placeholder="Enter account holder name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              </View>
            )}
          />
          {errors.bankInfo?.accountName && (
            <Text style={styles.errorText}>{errors.bankInfo.accountName.message}</Text>
          )}
          <Text style={styles.helperText}>
            Name should match the bank account holder's name exactly
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.infoItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#10b981" />
          <Text style={styles.infoText}>
            All banking information is encrypted and secured
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="lock-closed-outline" size={20} color="#10b981" />
          <Text style={styles.infoText}>
            BVN and account details are validated for authenticity
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle-outline" size={20} color="#2563eb" />
          <Text style={styles.infoText}>
            Banking details are required for subsidy payments and financial inclusion programs
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
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  info: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#065f46',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
