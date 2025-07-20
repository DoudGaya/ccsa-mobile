import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import LocationPicker from '../components/LocationPicker';

const ExampleFormWithLocation = () => {
  const [formData, setFormData] = useState({
    farmerName: '',
    location: {
      state: '',
      lga: '',
      ward: '',
      pollingUnit: ''
    }
  });

  const handleLocationChange = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData
    }));
  };

  const handleSubmit = () => {
    if (!formData.location.state || !formData.location.lga || !formData.location.ward) {
      Alert.alert('Validation Error', 'Please select at least State, LGA, and Ward');
      return;
    }

    console.log('Form submitted with data:', formData);
    Alert.alert('Success', 'Form submitted successfully!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Farmer Registration Form</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Information</Text>
        
        <LocationPicker
          onLocationChange={handleLocationChange}
          initialValues={formData.location}
          style={styles.locationPicker}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Selected Location:</Text>
        <Text>State: {formData.location.state || 'Not selected'}</Text>
        <Text>LGA: {formData.location.lga || 'Not selected'}</Text>
        <Text>Ward: {formData.location.ward || 'Not selected'}</Text>
        <Text>Polling Unit: {formData.location.pollingUnit || 'Not selected'}</Text>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Form</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  locationPicker: {
    // Custom styles for the LocationPicker if needed
  },
  summary: {
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExampleFormWithLocation;
