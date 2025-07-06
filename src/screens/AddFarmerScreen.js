import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { farmerSchema, ninSchema } from '../utils/validation';
import { useFarmerStore } from '../store/farmerStore';
import { farmerService } from '../services/farmerService';
import { ninService, testNetworkConnectivity } from '../services/ninService';
import LoadingScreen from './LoadingScreen';

// Import form steps
import NINLookupStep from '../components/forms/NINLookupStep';
import PersonalInfoStep from '../components/forms/PersonalInfoStep';
import ContactInfoStep from '../components/forms/ContactInfoStep';
import BankInfoStep from '../components/forms/BankInfoStep';
import RefereeInfoStep from '../components/forms/RefereeInfoStep';
import FarmInfoStep from '../components/forms/FarmInfoStep';

const STEPS = [
  { id: 1, title: 'NIN Lookup', component: NINLookupStep },
  { id: 2, title: 'Personal Info', component: PersonalInfoStep },
  { id: 3, title: 'Contact Info', component: ContactInfoStep },
  { id: 4, title: 'Bank Info', component: BankInfoStep },
  { id: 5, title: 'Referees', component: RefereeInfoStep },
  { id: 6, title: 'Farm Info', component: FarmInfoStep },
];

export default function AddFarmerScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ninData, setNinData] = useState(null);
  const [ninValidated, setNinValidated] = useState(false);
  const { addFarmer } = useFarmerStore();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      nin: '',
      personalInfo: {
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phoneNumber: '',
        whatsAppNumber: '',
        employmentStatus: '',
        highestQualification: '',
        maritalStatus: '',
      },
      contactInfo: {
        address: '',
        state: '',
        localGovernment: '',
        ward: '',
        pollingUnit: '',
        cluster: '',
      },
      bankInfo: {
        bvn: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
      },
      referees: [
        { fullName: '', phoneNumber: '', relation: '' },
      ],
      farmInfo: {
        farmLocation: '',
        farmSize: '',
        farmCategory: '',
        landforms: '',
        farmOwnership: '',
        farmState: '',
        farmLocalGovt: '',
        farmWard: '',
        farmPollingUnit: '',
        primaryCrop: '',
        secondaryCrop: '',
        farmSeason: '',
        coordinates: null,
        farmPolygon: [],
      },
    },
  });

  const nextStep = async () => {
    // Special validation for NIN step - must be validated before proceeding
    if (currentStep === 1 && !ninValidated) {
      Alert.alert(
        'NIN Validation Required',
        'Please complete NIN validation before proceeding to the next step.'
      );
      return;
    }

    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 1: return ['nin'];
      case 2: return ['personalInfo'];
      case 3: return ['contactInfo'];
      case 4: return ['bankInfo'];
      case 5: return ['referees'];
      case 6: return ['farmInfo'];
      default: return [];
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Check for unique fields
      const conflicts = await farmerService.checkUniqueFields(
        data.nin,
        data.personalInfo.email,
        data.personalInfo.phoneNumber,
        data.bankInfo.bvn
      );

      if (conflicts.length > 0) {
        Alert.alert(
          'Duplicate Data Found',
          `The following fields are already registered: ${conflicts.join(', ')}`
        );
        return;
      }

      await addFarmer(data);
      Alert.alert('Success', 'Farmer registered successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('FarmersList') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to register farmer');
    } finally {
      setLoading(false);
    }
  };

  const handleNINLookup = async (nin) => {
    try {
      setLoading(true);
      
      // Validate NIN format first
      const ninValidation = ninSchema.safeParse(nin);
      if (!ninValidation.success) {
        throw new Error('Please enter a valid 11-digit NIN');
      }

      // Test network connectivity first (without auth)
      console.log('Testing network connectivity...');
      try {
        const testResult = await testNetworkConnectivity(nin);
        console.log('Network test successful:', testResult);
      } catch (networkError) {
        console.error('Network test failed:', networkError);
        // Still continue with the main lookup in case the test endpoint doesn't work
      }

      // Check if farmer already exists
      try {
        const existingFarmer = await farmerService.getFarmerByNin(nin);
        if (existingFarmer) {
          throw new Error('A farmer with this NIN is already registered');
        }
      } catch (error) {
        console.log('Could not check existing farmer (might be auth issue):', error.message);
        // Continue anyway if this fails due to auth
      }

      // Try NIN lookup
      const ninData = await ninService.lookupNIN(nin);
      
      setValue('nin', nin);
      setNinData(ninData);
      setNinValidated(true);
      
      // Pre-fill form with fetched data
      setValue('personalInfo.firstName', ninData.firstName || '');
      setValue('personalInfo.middleName', ninData.middleName || '');
      setValue('personalInfo.lastName', ninData.lastName || '');
      setValue('personalInfo.dateOfBirth', ninData.dateOfBirth || '');
      setValue('personalInfo.gender', ninData.gender?.toUpperCase() || '');
      
      return ninData;
    } catch (error) {
      console.error('NIN lookup failed:', error);
      setNinValidated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (loading && currentStep === 1) {
    return <LoadingScreen message="Looking up NIN..." />;
  }

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header with Progress */}
        <View style={styles.header}>
          <Text style={styles.title}>Add New Farmer</Text>
          <Text style={styles.stepText}>
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
          </Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentStep / STEPS.length) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Form Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <CurrentStepComponent
            control={control}
            errors={errors}
            setValue={setValue}
            watch={watch}
            onNINLookup={handleNINLookup}
            ninData={ninData}
            ninValidated={ninValidated}
            onNINChange={() => setNinValidated(false)}
          />
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={prevStep}>
              <Ionicons name="arrow-back" size={20} color="#6b7280" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.navigationRight}>
            {currentStep < STEPS.length ? (
              <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
              >
                {loading ? (
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                ) : (
                  <Text style={styles.submitButtonText}>Register Farmer</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  navigationRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#ffffff',
    marginRight: 8,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});
