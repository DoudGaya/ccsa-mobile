import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { farmService } from '../services/farmService';
import LoadingScreen from './LoadingScreen';
import FarmInfoStep from '../components/forms/FarmInfoStep';

// Farm validation schema
const farmSchema = z.object({
  farmSize: z.string().optional(),
  primaryCrop: z.string().optional(),
  produceCategory: z.string().optional(),
  farmOwnership: z.string().optional(),
  farmState: z.string().optional(),
  farmLocalGovernment: z.string().optional(),
  farmingSeason: z.string().optional(),
  farmWard: z.string().optional(),
  farmPollingUnit: z.string().optional(),
  secondaryCrop: z.string().optional(),
  farmingExperience: z.string().optional(),
  farmLatitude: z.string().optional(),
  farmLongitude: z.string().optional(),
  farmPolygon: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
  })).optional(),
  soilType: z.string().optional(),
  soilPH: z.string().optional(),
  soilFertility: z.string().optional(),
  farmCoordinates: z.object({}).optional(),
  coordinateSystem: z.string().optional(),
  farmArea: z.string().optional(),
  farmElevation: z.string().optional(),
  year: z.string().optional(),
  yieldSeason: z.string().optional(),
  crop: z.string().optional(),
  quantity: z.string().optional(),
});

export default function AddFarmScreen({ navigation, route }) {
  const { farmerId, farmer } = route.params;
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      farmSize: '',
      primaryCrop: '',
      produceCategory: '',
      farmOwnership: '',
      farmState: '',
      farmLocalGovernment: '',
      farmingSeason: '',
      farmWard: '',
      farmPollingUnit: '',
      secondaryCrop: '',
      farmingExperience: '',
      farmLatitude: '',
      farmLongitude: '',
      farmPolygon: [],
      soilType: '',
      soilPH: '',
      soilFertility: '',
      farmCoordinates: null,
      coordinateSystem: 'WGS84',
      farmArea: '',
      farmElevation: '',
      year: '',
      yieldSeason: '',
      crop: '',
      quantity: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Convert string numbers to actual numbers where needed
      const processedData = {
        ...data,
        farmSize: data.farmSize ? parseFloat(data.farmSize) : null,
        farmingExperience: data.farmingExperience ? parseInt(data.farmingExperience) : null,
        farmLatitude: data.farmLatitude ? parseFloat(data.farmLatitude) : null,
        farmLongitude: data.farmLongitude ? parseFloat(data.farmLongitude) : null,
        soilPH: data.soilPH ? parseFloat(data.soilPH) : null,
        farmArea: data.farmArea ? parseFloat(data.farmArea) : null,
        farmElevation: data.farmElevation ? parseFloat(data.farmElevation) : null,
        year: data.year ? parseFloat(data.year) : null,
        crop: data.crop ? parseFloat(data.crop) : null,
        quantity: data.quantity ? parseFloat(data.quantity) : null,
      };

      await farmService.createFarm(farmerId, processedData);
      
      Alert.alert(
        'Success', 
        'Farm added successfully!',
        [
          { 
            text: 'Add Another Farm', 
            onPress: () => {
              // Reset form for another farm
              navigation.replace('AddFarm', { farmerId, farmer });
            }
          },
          { 
            text: 'Done', 
            onPress: () => navigation.navigate('FarmersList') 
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add farm');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Adding farm..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Farm</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Farmer Info Summary */}
        <View style={styles.farmerSummary}>
          <Text style={styles.farmerSummaryTitle}>Adding farm for:</Text>
          <Text style={styles.farmerName}>
            {farmer.firstName} {farmer.lastName}
          </Text>
          <Text style={styles.farmerNin}>NIN: {farmer.nin}</Text>
        </View>

        {/* Form */}
        <ScrollView style={styles.formContainer}>
          <FarmInfoStep
            control={control}
            errors={errors}
            showTitle={false}
          />
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Adding Farm...' : 'Add Farm'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 34,
  },
  farmerSummary: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  farmerSummaryTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  farmerNin: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  formContainer: {
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
