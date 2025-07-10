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

// Farm validation schema - make everything optional since farm info is typically optional
const farmSchema = z.object({
  farmInfo: z.object({
    farmLocation: z.string().optional(),
    farmSize: z.string().optional(),
    farmCategory: z.string().optional(),
    landforms: z.string().optional(),
    farmOwnership: z.string().optional(),
    farmState: z.string().optional(),
    farmLocalGovernment: z.string().optional(),
    farmingSeason: z.string().optional(),
    farmWard: z.string().optional(),
    farmPollingUnit: z.string().optional(),
    primaryCrop: z.string().optional(),
    secondaryCrop: z.string().optional(),
    farmingExperience: z.string().optional(),
    farmSeason: z.string().optional(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  }).optional(),
  farmLatitude: z.string().optional(),
  farmLongitude: z.string().optional(),
  farmPolygon: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.string().optional(),
    accuracy: z.number().optional(),
  })).optional(),
  soilType: z.string().optional(),
  soilPH: z.string().optional(),
  soilFertility: z.string().optional(),
  farmCoordinates: z.any().optional(),
  coordinateSystem: z.string().optional(),
  farmArea: z.string().optional(),
  farmElevation: z.string().optional(),
  year: z.string().optional(),
  yieldSeason: z.string().optional(),
  crop: z.string().optional(),
  quantity: z.string().optional(),
}).passthrough(); // Allow additional fields that might be added by components

export default function AddFarmScreen({ navigation, route }) {
  const { farmerId, farmer } = route.params || {};
  const [loading, setLoading] = useState(false);

  // Safety check for farmer data
  React.useEffect(() => {
    if (!farmerId || !farmer) {
      console.error('Missing farmerId or farmer data in route params');
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
        farmState: '',
        farmLocalGovernment: '',
        farmingSeason: '',
        farmWard: '',
        farmPollingUnit: '',
        primaryCrop: '',
        secondaryCrop: '',
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
      year: '',
      yieldSeason: '',
      crop: '',
      quantity: '',
    },
  });

  const onSubmit = async (data) => {
    console.log('=== ADD FARM SUBMISSION START ===');
    console.log('Form data received:', JSON.stringify(data, null, 2));
    
    try {
      setLoading(true);

      // Safety check
      if (!farmerId || !farmer) {
        console.error('Missing farmer information:', { farmerId, farmer });
        throw new Error('Missing farmer information');
      }

      // Flatten the nested structure and convert string numbers to actual numbers
      const processedData = {
        // Flatten farmInfo fields
        farmLocation: data.farmInfo?.farmLocation || '',
        farmSize: data.farmInfo?.farmSize ? parseFloat(data.farmInfo.farmSize) : null,
        farmCategory: data.farmInfo?.farmCategory || '',
        landforms: data.farmInfo?.landforms || '',
        farmOwnership: data.farmInfo?.farmOwnership || '',
        farmState: data.farmInfo?.farmState || '',
        farmLocalGovernment: data.farmInfo?.farmLocalGovernment || '',
        farmingSeason: data.farmInfo?.farmingSeason || '',
        farmWard: data.farmInfo?.farmWard || '',
        farmPollingUnit: data.farmInfo?.farmPollingUnit || '',
        primaryCrop: data.farmInfo?.primaryCrop || '',
        secondaryCrop: data.farmInfo?.secondaryCrop || '',
        farmingExperience: data.farmInfo?.farmingExperience ? parseInt(data.farmInfo.farmingExperience) : null,
        farmSeason: data.farmInfo?.farmSeason || '',
        
        // Include farm coordinates from farmInfo
        farmLatitude: data.farmInfo?.coordinates?.latitude || (data.farmLatitude ? parseFloat(data.farmLatitude) : null),
        farmLongitude: data.farmInfo?.coordinates?.longitude || (data.farmLongitude ? parseFloat(data.farmLongitude) : null),
        
        // Include other farm fields
        farmPolygon: data.farmPolygon || [],
        soilType: data.soilType || '',
        soilPH: data.soilPH ? parseFloat(data.soilPH) : null,
        soilFertility: data.soilFertility || '',
        farmCoordinates: data.farmInfo?.coordinates || data.farmCoordinates,
        coordinateSystem: data.coordinateSystem || 'WGS84',
        farmArea: data.farmArea ? parseFloat(data.farmArea) : null,
        farmElevation: data.farmElevation ? parseFloat(data.farmElevation) : null,
        year: data.year ? parseFloat(data.year) : null,
        yieldSeason: data.yieldSeason || '',
        crop: data.crop ? parseFloat(data.crop) : null,
        quantity: data.quantity ? parseFloat(data.quantity) : null,
      };

      console.log('Creating farm with data:', processedData);
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
      console.log('=== ADD FARM SUBMISSION END ===');
    }
  };

  // Add form validation error handler
  const onFormError = (errors) => {
    console.log('=== FORM VALIDATION ERRORS ===');
    console.log('Validation errors:', JSON.stringify(errors, null, 2));
    
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
              console.log('Submit button pressed');
              console.log('Form errors:', errors);
              console.log('Has errors:', Object.keys(errors).length > 0);
              
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
    backgroundColor: '#2563eb',
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
