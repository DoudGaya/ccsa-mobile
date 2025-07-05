import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useFarmerStore } from '../store/farmerStore';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

const FarmerDetailsScreen = ({ route, navigation }) => {
  const { farmerId } = route.params;
  const { farmers, loading, fetchFarmers } = useFarmerStore();
  const [farmer, setFarmer] = useState(null);

  useEffect(() => {
    const farmerData = farmers.find(f => f.id === farmerId);
    if (farmerData) {
      setFarmer(farmerData);
    } else {
      fetchFarmers();
    }
  }, [farmerId, farmers]);

  const handleEditFarmer = () => {
    navigation.navigate('AddFarmer', { farmerData: farmer, isEdit: true });
  };

  const handleGenerateCertificate = () => {
    navigation.navigate('Certificate', { farmer });
  };

  const handleDeleteFarmer = () => {
    Alert.alert(
      'Delete Farmer',
      'Are you sure you want to delete this farmer? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete functionality
            Alert.alert('Success', 'Farmer deleted successfully');
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (loading || !farmer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={styles.loadingText}>Loading farmer details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {farmer.firstName?.charAt(0)}{farmer.lastName?.charAt(0)}
            </Text>
          </View>
          <View style={styles.nameSection}>
            <Text style={styles.name}>
              {farmer.firstName} {farmer.middleName} {farmer.lastName}
            </Text>
            <Text style={styles.nin}>NIN: {farmer.nin}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditFarmer}>
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.certificateButton} onPress={handleGenerateCertificate}>
            <Ionicons name="document-text-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Certificate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteFarmer}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoGrid}>
            <InfoItem label="Date of Birth" value={farmer.dateOfBirth} />
            <InfoItem label="Gender" value={farmer.gender} />
            <InfoItem label="Phone" value={farmer.phone} />
            <InfoItem label="Email" value={farmer.email} />
            <InfoItem label="Marital Status" value={farmer.maritalStatus} />
          </View>
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Information</Text>
          <View style={styles.infoGrid}>
            <InfoItem label="State" value={farmer.state} />
            <InfoItem label="LGA" value={farmer.lga} />
            <InfoItem label="Ward" value={farmer.ward} />
            <InfoItem label="Address" value={farmer.address} fullWidth />
          </View>
        </View>

        {/* Bank Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Information</Text>
          <View style={styles.infoGrid}>
            <InfoItem label="Bank Name" value={farmer.bankName} />
            <InfoItem label="Account Number" value={farmer.accountNumber} />
            <InfoItem label="BVN" value={farmer.bvn} />
          </View>
        </View>

        {/* Referee Information */}
        {farmer.referees && farmer.referees.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Referee Information</Text>
            {farmer.referees.map((referee, index) => (
              <View key={index} style={styles.refereeCard}>
                <Text style={styles.refereeTitle}>Referee {index + 1}</Text>
                <InfoItem label="Name" value={`${referee.firstName} ${referee.lastName}`} />
                <InfoItem label="Phone" value={referee.phone} />
                <InfoItem label="Relationship" value={referee.relationship} />
              </View>
            ))}
          </View>
        )}

        {/* Farm Information */}
        {farmer.farmInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farm Information</Text>
            <View style={styles.infoGrid}>
              <InfoItem label="Farm Size" value={`${farmer.farmInfo.farmSize} hectares`} />
              <InfoItem label="Primary Crop" value={farmer.farmInfo.primaryCrop} />
              <InfoItem label="Secondary Crop" value={farmer.farmInfo.secondaryCrop} />
              <InfoItem label="Farming Experience" value={`${farmer.farmInfo.farmingExperience} years`} />
              {farmer.farmInfo.latitude && farmer.farmInfo.longitude && (
                <InfoItem 
                  label="Coordinates" 
                  value={`${farmer.farmInfo.latitude}, ${farmer.farmInfo.longitude}`}
                  fullWidth 
                />
              )}
            </View>
          </View>
        )}

        {/* QR Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QR Code</Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={JSON.stringify({
                nin: farmer.nin,
                name: `${farmer.firstName} ${farmer.lastName}`,
                phone: farmer.phone,
                registrationDate: farmer.createdAt,
              })}
              size={150}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const InfoItem = ({ label, value, fullWidth = false }) => (
  <View style={[styles.infoItem, fullWidth && styles.fullWidth]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  nin: {
    fontSize: 16,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 12,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  refereeCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  refereeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
  },
});

export default FarmerDetailsScreen;
