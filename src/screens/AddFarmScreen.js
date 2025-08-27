import React, { useState, useEffect } from 'react';
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
import { farmInfoSchema } from '../utils/validation';
import { farmService } from '../services/farmService';
import { calculateFarmSizeFromPolygon, processFarmDataWithSize, validateFarmCoordinates } from '../utils/farmCalculations';
import LoadingScreen from './LoadingScreen';
import FarmInfoStep from '../components/forms/FarmInfoStep';

// Extended farm validation schema - making key fields required
const farmSchema = z.object({
  farmInfo: farmInfoSchema,
  farmLatitude: z.string().optional(),
  farmLongitude: z.string().optional(),
  farmPolygon: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.string().optional(),
    accuracy: z.number().optional(),
  })).optional().default([]), // Made optional with default
  soilType: z.string().min(1, 'Soil type is required'),
  soilPH: z.string().optional(),
  soilFertility: z.string().min(1, 'Soil fertility information is required'),
  farmCoordinates: z.any().optional(),
  coordinateSystem: z.string().optional(),
  farmArea: z.string().optional(), // This will be calculated automatically
  farmElevation: z.string().optional(),
  year: z.string().min(1, 'Year is required'),
  yieldSeason: z.string().min(1, 'Yield season is required'),
  crop: z.string().optional(), // Made optional as it's additional details
  quantity: z.string().min(1, 'Quantity information is required'),
}).passthrough(); // Allow additional fields that might be added by components

export default function AddFarmScreen({ navigation, route }) {
  const { farmerId, farmer } = route.params || {};
  const [loading, setLoading] = useState(false);

  // Safety check for farmer data
  React.useEffect(() => {
    if (!farmerId || !farmer) {
      Alert.alert(
        'Error',
        'Missing farmer information. Returning to farmers list.',
        [{ text: 'OK', onPress: () => navigation.navigate('FarmersList') }]
      );
    }
  }, [farmerId, farmer, navigation]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      farmInfo: {
        farmLocation: '',
        farmSize: '',
        farmCategory: '',
        landforms: '',
        farmOwnership: '',
        state: '',
        localGovernment: '',
        farmingSeason: '',
        ward: '',
        pollingUnit: '',
        primaryCrop: '',
        secondaryCrop: [],
        farmingExperience: '',
        farmSeason: '',
        coordinates: null,
      },
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
      year: new Date().getFullYear().toString(),
      yieldSeason: '',
      crop: '',
      quantity: '',
    },
  });

  // Watch for farmPolygon changes and auto-calculate farm size
  const watchedPolygon = watch('farmPolygon');
  
  useEffect(() => {
    if (watchedPolygon && Array.isArray(watchedPolygon) && watchedPolygon.length > 0) {
      try {
        // Calculate farm size from polygon coordinates
        const calculatedSize = calculateFarmSizeFromPolygon(watchedPolygon);
        
        if (calculatedSize > 0) {
          // Update the farmSize field with calculated value
          setValue('farmInfo.farmSize', calculatedSize.toString());
        }
      } catch (error) {
        // Silently handle farm size calculation errors
        console.log('Farm size calculation error:', error);
      }
    }
  }, [watchedPolygon, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Safety check
      if (!farmerId || !farmer) {
        throw new Error('Missing farmer information');
      }

      // Flatten the nested farmInfo structure to match API expectations
      const flattenedData = {
        // Extract and flatten farmInfo fields
        farmSize: data.farmInfo?.farmSize || '',
        primaryCrop: data.farmInfo?.primaryCrop || '',
        produceCategory: data.farmInfo?.farmCategory || '',
        farmOwnership: data.farmInfo?.farmOwnership || '',
        farmState: data.farmInfo?.state || '',
        farmLocalGovernment: data.farmInfo?.localGovernment || '',
        farmingSeason: data.farmInfo?.farmSeason || '',
        farmWard: data.farmInfo?.ward || '',
        farmPollingUnit: data.farmInfo?.pollingUnit || '',
        secondaryCrop: Array.isArray(data.farmInfo?.secondaryCrop) 
          ? data.farmInfo.secondaryCrop.join(', ') 
          : (data.farmInfo?.secondaryCrop || ''),
        farmingExperience: data.farmInfo?.farmingExperience || '',
        
        // Coordinates from farmInfo
        farmLatitude: data.farmInfo?.coordinates?.latitude?.toString() || '',
        farmLongitude: data.farmInfo?.coordinates?.longitude?.toString() || '',
        
        // Top-level fields
        farmPolygon: data.farmPolygon || [],
        soilType: data.soilType || '',
        soilPH: data.soilPH || '',
        soilFertility: data.soilFertility || '',
        farmCoordinates: data.farmCoordinates || null,
        coordinateSystem: data.coordinateSystem || 'WGS84',
        farmArea: data.farmArea || '',
        farmElevation: data.farmElevation || '',
        year: data.year || '',
        yieldSeason: data.yieldSeason || '',
        crop: data.crop || '',
        quantity: data.quantity || '',
      };

      // Use the enhanced farm processing utility to handle data and calculate farm size
      const processedData = processFarmDataWithSize(flattenedData);

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
            text: 'View Farmer', 
            onPress: () => navigation.navigate('FarmerDetails', { farmerId, farmer })
          },
          { 
            text: 'Done (Add New Farmer)', 
            onPress: () => {
              // Navigate back to the tab navigator and then to AddFarmer tab
              navigation.navigate('MainApp', { 
                screen: 'MainTabs', 
                params: { screen: 'AddFarmer' } 
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Farm creation error:', error);
      Alert.alert('Error', error.message || 'Failed to add farm');
    } finally {
      setLoading(false);
    }
  };

  // Add form validation error handler
  const onFormError = (errors) => {
    // Get first error message to show user
    const errorPaths = Object.keys(errors);
    const firstErrorPath = errorPaths[0];
    const firstError = errors[firstErrorPath];
    const errorMessage = firstError?.message || 'Please check the form for errors';
    
    Alert.alert(
      'Form Validation Error', 
      `${firstErrorPath}: ${errorMessage}\n\nTotal errors: ${errorPaths.length}`,
      [
        { text: 'Fix Errors', style: 'cancel' },
        { 
          text: 'Submit Anyway', 
          style: 'destructive',
          onPress: () => {
            // Force submission with current data
            const currentData = watch();
            onSubmit(currentData);
          }
        }
      ]
    );
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
        {/* Farmer Info Summary */}
        <View style={styles.farmerSummary}>
          <Text style={styles.farmerSummaryTitle}>Adding farm for:</Text>
          <Text style={styles.farmerName}>
            {farmer?.firstName || 'Unknown'} {farmer?.lastName || 'Farmer'}
          </Text>
          <Text style={styles.farmerNin}>NIN: {farmer?.nin || 'Unknown'}</Text>
        </View>

        {/* Form */}
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.formWrapper}>
            <FarmInfoStep
              control={control}
              errors={errors}
              setValue={setValue}
              watch={watch}
              showTitle={false}
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => {
              // Try form submission
              const submitFunction = handleSubmit(onSubmit, onFormError);
              submitFunction();
            }}
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
    backgroundColor: '#f9fafb',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  farmerSummary: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  farmerSummaryTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  farmerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  farmerNin: {
    fontSize: 14,
    color: '#6b7280',
  },
  formContainer: {
    flex: 1,
  },
  formWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#013358',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
