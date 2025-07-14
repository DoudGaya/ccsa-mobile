import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import CropSelect from '../common/CropSelect';
import MultiCropSelect from '../common/MultiCropSelect';
import CustomSelect from '../common/CustomSelect';
import SearchableSelect from '../common/SearchableSelect';
import StateSelect from '../common/StateSelect';
import LGASelect from '../common/LGASelect';
import WardSelect from '../common/WardSelect';
import PollingUnitSelect from '../common/PollingUnitSelect';
import FarmPolygonMapper from '../common/FarmPolygonMapper';
import optimizedLocationService from '../../services/optimizedLocationServiceV2';

const FARM_CATEGORIES = [
  { label: 'Select Farm Category', value: '' },
  { label: 'Arable Farming', value: 'ARABLE' },
  { label: 'Livestock Farming', value: 'LIVESTOCK' },
  { label: 'Mixed Farming', value: 'MIXED' },
  { label: 'Aquaculture', value: 'AQUACULTURE' },
  { label: 'Poultry', value: 'POULTRY' },
  { label: 'Horticulture', value: 'HORTICULTURE' },
];

const FARM_OWNERSHIP = [
  { label: 'Select Ownership Type', value: '' },
  { label: 'Owned', value: 'OWNED' },
  { label: 'Rented', value: 'RENTED' },
  { label: 'Leased', value: 'LEASED' },
  { label: 'Family Land', value: 'FAMILY' },
  { label: 'Community Land', value: 'COMMUNITY' },
];

const FARM_SEASONS = [
  { label: 'Select Farm Season', value: '' },
  { label: 'Wet Season', value: 'WET' },
  { label: 'Dry Season', value: 'DRY' },
  { label: 'Year Round', value: 'YEAR_ROUND' },
];

const CROPS = [
  'Maize', 'Rice', 'Cassava', 'Yam', 'Cocoa', 'Oil Palm', 'Plantain', 'Banana',
  'Tomato', 'Pepper', 'Onion', 'Okra', 'Beans', 'Groundnut', 'Sesame', 'Cotton',
  'Sorghum', 'Millet', 'Cowpea', 'Soybean', 'Sweet Potato', 'Irish Potato',
];

export default function FarmInfoStep({ control, errors, setValue, watch, showTitle = true }) {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState(watch('farmInfo.coordinates'));

  // Watch form values for cascading dropdowns
  const selectedState = watch('farmInfo.state');
  const selectedLocalGovernment = watch('farmInfo.localGovernment');
  const selectedWard = watch('farmInfo.ward');
  
  // State for dropdown options and loading states
  // Note: Individual select components now handle their own loading

  // Reset dependent fields when parent field changes
  useEffect(() => {
    if (selectedState) {
      setValue('farmInfo.localGovernment', '');
      setValue('farmInfo.ward', '');
      setValue('farmInfo.pollingUnit', '');
    }
  }, [selectedState, setValue]);

  useEffect(() => {
    if (selectedLocalGovernment) {
      setValue('farmInfo.ward', '');
      setValue('farmInfo.pollingUnit', '');
    }
  }, [selectedLocalGovernment, setValue]);

  useEffect(() => {
    if (selectedWard) {
      setValue('farmInfo.pollingUnit', '');
    }
  }, [selectedWard, setValue]);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCoordinates(coords);
      setValue('farmInfo.coordinates', coords);
      
      Alert.alert('Location Captured', `Lat: ${coords.latitude.toFixed(6)}, Lng: ${coords.longitude.toFixed(6)}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.header}>
          <Ionicons name="leaf-outline" size={48} color="#10b981" />
          <Text style={styles.title}>Farm Information</Text>
          <Text style={styles.description}>
            Add farm details (Optional - can be completed later)
          </Text>
        </View>
      )}

      <View style={styles.form}>
        {/* State */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>State *</Text>
          <Controller
            control={control}
            name="farmInfo.state"
            render={({ field: { onChange, value } }) => (
              <StateSelect
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Select State"
                error={!!errors?.farmInfo?.state}
              />
            )}
          />
          {errors?.farmInfo?.state && (
            <Text style={styles.errorText}>{errors.farmInfo.state.message}</Text>
          )}
        </View>

        {/* Local Government */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Local Government *</Text>
          <Controller
            control={control}
            name="farmInfo.localGovernment"
            render={({ field: { onChange, value } }) => (
              <LGASelect
                selectedState={selectedState}
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Select Local Government"
                error={!!errors?.farmInfo?.localGovernment}
              />
            )}
          />
          {errors?.farmInfo?.localGovernment && (
            <Text style={styles.errorText}>{errors.farmInfo.localGovernment.message}</Text>
          )}
        </View>

        {/* Ward */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ward *</Text>
          <Controller
            control={control}
            name="farmInfo.ward"
            render={({ field: { onChange, value } }) => (
              <WardSelect
                selectedState={selectedState}
                selectedLGA={selectedLocalGovernment}
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Select Ward"
                error={!!errors?.farmInfo?.ward}
              />
            )}
          />
          {errors?.farmInfo?.ward && (
            <Text style={styles.errorText}>{errors.farmInfo.ward.message}</Text>
          )}
        </View>

        {/* Polling Unit */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Polling Unit *</Text>
          <Controller
            control={control}
            name="farmInfo.pollingUnit"
            render={({ field: { onChange, value } }) => (
              <PollingUnitSelect
                selectedState={selectedState}
                selectedLGA={selectedLocalGovernment}
                selectedWard={selectedWard}
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Select Polling Unit"
                error={!!errors?.farmInfo?.pollingUnit}
              />
            )}
          />
          {errors?.farmInfo?.pollingUnit && (
            <Text style={styles.errorText}>{errors.farmInfo.pollingUnit.message}</Text>
          )}
        </View>

        {/* Farm Location Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Farm Location Description</Text>
          <Controller
            control={control}
            name="farmInfo.farmLocation"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Additional location details (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
            )}
          />
        </View>

        {/* Farm Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Farm Category</Text>
          <Controller
            control={control}
            name="farmInfo.farmCategory"
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                options={FARM_CATEGORIES}
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Select Farm Category"
                error={!!errors?.farmInfo?.farmCategory}
              />
            )}
          />
          {errors?.farmInfo?.farmCategory && (
            <Text style={styles.errorText}>{errors.farmInfo.farmCategory.message}</Text>
          )}
        </View>

        {/* Landforms */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Landforms</Text>
          <Controller
            control={control}
            name="farmInfo.landforms"
            render={({ field: { onChange, value } }) => (
              <View style={styles.radioContainer}>
                <TouchableOpacity
                  style={[styles.radioOption, value === 'lowland' && styles.radioSelected]}
                  onPress={() => onChange('lowland')}
                >
                  <Ionicons
                    name={value === 'lowland' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={value === 'lowland' ? '#013358' : '#9ca3af'}
                  />
                  <Text style={styles.radioText}>Lowland</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioOption, value === 'highland' && styles.radioSelected]}
                  onPress={() => onChange('highland')}
                >
                  <Ionicons
                    name={value === 'highland' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={value === 'highland' ? '#013358' : '#9ca3af'}
                  />
                  <Text style={styles.radioText}>Highland</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        {/* Farm Ownership */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Farm Ownership</Text>
          <Controller
            control={control}
            name="farmInfo.farmOwnership"
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                options={FARM_OWNERSHIP}
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Select Ownership Type"
                error={!!errors?.farmInfo?.farmOwnership}
              />
            )}
          />
          {errors?.farmInfo?.farmOwnership && (
            <Text style={styles.errorText}>{errors.farmInfo.farmOwnership.message}</Text>
          )}
        </View>

        {/* Primary Crop */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Primary Crop</Text>
          <Controller
            control={control}
            name="farmInfo.primaryCrop"
            render={({ field: { onChange, value } }) => (
              <CropSelect
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Select primary crop"
                error={!!errors.farmInfo?.primaryCrop}
              />
            )}
          />
          {errors.farmInfo?.primaryCrop && (
            <Text style={styles.errorText}>{errors.farmInfo.primaryCrop.message}</Text>
          )}
        </View>

        {/* Secondary Crops */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Secondary Crops</Text>
          <Controller
            control={control}
            name="farmInfo.secondaryCrop"
            render={({ field: { onChange, value } }) => (
              <MultiCropSelect
                selectedValues={Array.isArray(value) ? value : (value ? [value] : [])}
                onValuesChange={onChange}
                placeholder="Select secondary crops (optional)"
                error={!!errors.farmInfo?.secondaryCrop}
                maxSelections={5}
              />
            )}
          />
          {errors.farmInfo?.secondaryCrop && (
            <Text style={styles.errorText}>{errors.farmInfo.secondaryCrop.message}</Text>
          )}
          <Text style={styles.helperText}>
            You can select up to 5 secondary crops that are also grown on this farm
          </Text>
        </View>

        {/* Farm Season */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Farm Season</Text>
          <Controller
            control={control}
            name="farmInfo.farmSeason"
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                options={FARM_SEASONS}
                selectedValue={value}
                onValueChange={onChange}
                placeholder="Select Farm Season"
                error={!!errors?.farmInfo?.farmSeason}
              />
            )}
          />
          {errors?.farmInfo?.farmSeason && (
            <Text style={styles.errorText}>{errors.farmInfo.farmSeason.message}</Text>
          )}
        </View>

        {/* GPS Coordinates */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>GPS Coordinates</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={loadingLocation}
          >
            <Ionicons
              name={loadingLocation ? "sync" : "location"}
              size={20}
              color="#ffffff"
            />
            <Text style={styles.locationButtonText}>
              {loadingLocation ? 'Getting Location...' : 'Use My Location'}
            </Text>
          </TouchableOpacity>
          
          {coordinates && (
            <View style={styles.coordinatesDisplay}>
              <Text style={styles.coordinatesText}>
                Latitude: {coordinates.latitude.toFixed(6)}
              </Text>
              <Text style={styles.coordinatesText}>
                Longitude: {coordinates.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        {/* Farm Polygon */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Farm Boundary</Text>
          <FarmPolygonMapper
            onPolygonUpdate={(polygon) => {
              setValue('farmPolygon', polygon);
            }}
            initialPolygon={watch('farmPolygon') || []}
          />
          <Text style={styles.helperText}>
            Walk around farm boundary to capture the area
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle-outline" size={20} color="#10b981" />
          <Text style={styles.infoText}>
            Farm information is optional and can be added or updated later
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={20} color="#10b981" />
          <Text style={styles.infoText}>
            GPS coordinates help with precision agriculture and farm mapping
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  picker: {
    height: 50,
  },
  radioContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioSelected: {
    // Additional styling for selected radio option
  },
  radioText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  cropSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  cropButton: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cropButtonText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#013358',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  locationButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  coordinatesDisplay: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#166534',
    fontFamily: 'monospace',
  },
  polygonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#013358',
    borderStyle: 'dashed',
  },
  polygonButtonText: {
    color: '#013358',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
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
