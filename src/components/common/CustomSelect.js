import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const CustomSelect = ({ 
  options, 
  selectedValue, 
  onValueChange, 
  placeholder = 'Select an option',
  style,
  error = false,
  disabled = false 
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // For iOS, use a modal with a list
  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity
          style={[
            styles.selectButton,
            error && styles.selectButtonError,
            disabled && styles.selectButtonDisabled
          ]}
          onPress={() => !disabled && setModalVisible(true)}
          disabled={disabled}
        >
          <Text style={[
            styles.selectButtonText,
            !selectedValue && styles.placeholderText,
            disabled && styles.disabledText
          ]}>
            {displayText}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={disabled ? '#9ca3af' : '#6b7280'} 
          />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Option</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      item.value === selectedValue && styles.selectedOption
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      item.value === selectedValue && styles.selectedOptionText
                    ]}>
                      {item.label}
                    </Text>
                    {item.value === selectedValue && (
                      <Ionicons name="checkmark" size={20} color="#2563eb" />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.optionsList}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // For Android, use the native Picker
  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.pickerContainer,
        error && styles.pickerContainerError,
        disabled && styles.pickerContainerDisabled
      ]}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={[styles.picker, disabled && styles.pickerDisabled]}
          enabled={!disabled}
        >
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    minHeight: 48,
  },
  selectButtonError: {
    borderColor: '#ef4444',
  },
  selectButtonDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  disabledText: {
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  selectedOptionText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  pickerContainerError: {
    borderColor: '#ef4444',
  },
  pickerContainerDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  pickerDisabled: {
    color: '#9ca3af',
  },
});

export default CustomSelect;
