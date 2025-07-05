import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useFarmerStore } from '../store/farmerStore';
import LoadingScreen from './LoadingScreen';

export default function CertificateScreen({ navigation }) {
  const [nin, setNin] = useState('');
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { getFarmerByNin } = useFarmerStore();

  const searchFarmerByNin = async () => {
    if (!nin.trim() || nin.trim().length !== 11) {
      Alert.alert('Invalid NIN', 'Please enter a valid 11-digit NIN');
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const foundFarmer = await getFarmerByNin(nin.trim());
      setFarmer(foundFarmer);
      
      if (!foundFarmer) {
        Alert.alert('Farmer Not Found', 'No farmer found with this NIN');
      }
    } catch (error) {
      Alert.alert('Search Error', 'Failed to search for farmer');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    if (!farmer) return;

    try {
      setLoading(true);
      
      // In a real app, this would call an API to generate and save the certificate
      Alert.alert(
        'Certificate Generated',
        'Farmer certificate has been generated successfully!',
        [
          {
            text: 'View PDF',
            onPress: () => {
              // In a real app, this would open the generated PDF
              Alert.alert('Feature Coming Soon', 'PDF generation will be implemented with react-native-pdf library');
            }
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setNin('');
    setFarmer(null);
    setHasSearched(false);
  };

  if (loading) {
    return <LoadingScreen message="Processing..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="document-text-outline" size={48} color="#2563eb" />
          <Text style={styles.title}>Generate Certificate</Text>
          <Text style={styles.subtitle}>
            Search farmer by NIN to generate certificate
          </Text>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.searchLabel}>National Identification Number (NIN)</Text>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="card-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Enter 11-digit NIN"
                value={nin}
                onChangeText={setNin}
                keyboardType="numeric"
                maxLength={11}
                returnKeyType="search"
                onSubmitEditing={searchFarmerByNin}
              />
              {nin.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearSearch}
                >
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity
              style={[styles.searchButton, nin.length !== 11 && styles.searchButtonDisabled]}
              onPress={searchFarmerByNin}
              disabled={nin.length !== 11}
            >
              <Ionicons name="search" size={20} color="#ffffff" />
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Section */}
        {hasSearched && (
          <View style={styles.resultsSection}>
            {farmer ? (
              <View style={styles.farmerCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {farmer.personalInfo.firstName[0]}{farmer.personalInfo.lastName[0]}
                    </Text>
                  </View>
                  <View style={styles.farmerInfo}>
                    <Text style={styles.farmerName}>
                      {farmer.personalInfo.firstName} {farmer.personalInfo.middleName || ''} {farmer.personalInfo.lastName}
                    </Text>
                    <Text style={styles.farmerDetails}>
                      NIN: {farmer.nin}
                    </Text>
                    <Text style={styles.farmerDetails}>
                      Phone: {farmer.personalInfo.phoneNumber}
                    </Text>
                    <Text style={styles.farmerDetails}>
                      Email: {farmer.personalInfo.email}
                    </Text>
                  </View>
                </View>

                {/* QR Code Section */}
                <View style={styles.qrSection}>
                  <Text style={styles.qrTitle}>Farmer Verification QR Code</Text>
                  <View style={styles.qrContainer}>
                    <QRCode
                      value={farmer.nin}
                      size={120}
                      color="#1f2937"
                      backgroundColor="#ffffff"
                    />
                  </View>
                  <Text style={styles.qrDescription}>
                    Scan to verify farmer identity
                  </Text>
                </View>

                {/* Farmer Details */}
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date of Birth:</Text>
                    <Text style={styles.detailValue}>{farmer.personalInfo.dateOfBirth}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Gender:</Text>
                    <Text style={styles.detailValue}>{farmer.personalInfo.gender}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Marital Status:</Text>
                    <Text style={styles.detailValue}>{farmer.personalInfo.maritalStatus}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Employment Status:</Text>
                    <Text style={styles.detailValue}>{farmer.personalInfo.employmentStatus}</Text>
                  </View>

                  <Text style={styles.sectionTitle}>Contact Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address:</Text>
                    <Text style={styles.detailValue}>{farmer.contactInfo.address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>State:</Text>
                    <Text style={styles.detailValue}>{farmer.contactInfo.state}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>LGA:</Text>
                    <Text style={styles.detailValue}>{farmer.contactInfo.localGovernment}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ward:</Text>
                    <Text style={styles.detailValue}>{farmer.contactInfo.ward}</Text>
                  </View>

                  <Text style={styles.sectionTitle}>Banking Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bank:</Text>
                    <Text style={styles.detailValue}>{farmer.bankInfo.bankName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account Name:</Text>
                    <Text style={styles.detailValue}>{farmer.bankInfo.accountName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account Number:</Text>
                    <Text style={styles.detailValue}>{farmer.bankInfo.accountNumber}</Text>
                  </View>

                  {farmer.farmInfo && (
                    <>
                      <Text style={styles.sectionTitle}>Farm Information</Text>
                      {farmer.farmInfo.farmLocation && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Farm Location:</Text>
                          <Text style={styles.detailValue}>{farmer.farmInfo.farmLocation}</Text>
                        </View>
                      )}
                      {farmer.farmInfo.farmSize && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Farm Size:</Text>
                          <Text style={styles.detailValue}>{farmer.farmInfo.farmSize}</Text>
                        </View>
                      )}
                      {farmer.farmInfo.primaryCrop && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Primary Crop:</Text>
                          <Text style={styles.detailValue}>{farmer.farmInfo.primaryCrop}</Text>
                        </View>
                      )}
                    </>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Registration Date:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(farmer.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* Generate Certificate Button */}
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={generateCertificate}
                >
                  <Ionicons name="document-text" size={20} color="#ffffff" />
                  <Text style={styles.generateButtonText}>Generate PDF Certificate</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.notFoundCard}>
                <Ionicons name="alert-circle-outline" size={64} color="#f59e0b" />
                <Text style={styles.notFoundTitle}>Farmer Not Found</Text>
                <Text style={styles.notFoundDescription}>
                  No farmer registered with NIN: {nin}
                </Text>
                <Text style={styles.notFoundHint}>
                  Please verify the NIN and try again
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Instructions */}
        {!hasSearched && (
          <View style={styles.instructionsSection}>
            <View style={styles.instructionItem}>
              <Ionicons name="search-outline" size={24} color="#2563eb" />
              <Text style={styles.instructionText}>
                Enter the farmer's 11-digit NIN to search for their record
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="document-text-outline" size={24} color="#2563eb" />
              <Text style={styles.instructionText}>
                Review farmer details and generate PDF certificate
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="qr-code-outline" size={24} color="#2563eb" />
              <Text style={styles.instructionText}>
                Certificate includes QR code for verification
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  searchSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    letterSpacing: 1,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  searchButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsSection: {
    marginBottom: 24,
  },
  farmerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  farmerDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
  },
  qrDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    width: 120,
    marginRight: 12,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  notFoundCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
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
  notFoundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  notFoundDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  notFoundHint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  instructionsSection: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    color: '#1e40af',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
});
