import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DuplicateFieldAlert({ 
  visible, 
  fieldName, 
  fieldValue, 
  existingRecord,
  onViewRecord,
  onIgnore,
  onCancel 
}) {
  if (!visible) return null;

  const handleViewRecord = () => {
    Alert.alert(
      'Existing Record Found',
      `A ${fieldName} record already exists with this ${fieldValue}.\n\nDetails:\n- Name: ${existingRecord?.name || 'N/A'}\n- Created: ${existingRecord?.createdAt || 'N/A'}\n- Status: ${existingRecord?.status || 'Active'}`,
      [
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        { text: 'Continue Anyway', onPress: onIgnore },
        { text: 'View Full Record', onPress: onViewRecord },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.alertBox}>
        <View style={styles.iconContainer}>
          <Ionicons name="warning" size={24} color="#f59e0b" />
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Duplicate {fieldName} Detected</Text>
          <Text style={styles.message}>
            A record with this {fieldName.toLowerCase()} already exists in the system.
          </Text>
          <Text style={styles.fieldValue}>{fieldValue}</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.viewButton} onPress={handleViewRecord}>
            <Ionicons name="eye-outline" size={16} color="#3b82f6" />
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.ignoreButton} onPress={onIgnore}>
            <Text style={styles.ignoreButtonText}>Continue Anyway</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxWidth: 350,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
  },
  buttonContainer: {
    gap: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    gap: 6,
  },
  viewButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  ignoreButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  ignoreButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
});
