import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFarmerStore } from '../store/farmerStore';
import LoadingScreen from './LoadingScreen';

export default function SearchFarmerScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { searchFarmers } = useFarmerStore();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Required', 'Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const results = await searchFarmers(searchQuery.trim());
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Search Error', 'Failed to search farmers');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const renderFarmerResult = ({ item: farmer }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => navigation.navigate('FarmerDetails', { farmerId: farmer.id, farmer })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {farmer.firstName[0]}{farmer.lastName[0]}
          </Text>
        </View>
        <View style={styles.farmerInfo}>
          <Text style={styles.farmerName}>
            {farmer.firstName} {farmer.lastName}
          </Text>
          <Text style={styles.farmerDetails}>
            NIN: {farmer.nin}
          </Text>
          <Text style={styles.farmerDetails}>
            Phone: {farmer.phone}
          </Text>
          {farmer.email && (
            <Text style={styles.farmerDetails}>
              Email: {farmer.email}
            </Text>
          )}
        </View>
        <View style={styles.cardActions}>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.locationInfo}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.locationText}>
            {farmer.ward && `${farmer.ward}, `}{farmer.lga && `${farmer.lga}, `}{farmer.state || 'Location not available'}
          </Text>
        </View>
        <Text style={styles.registrationDate}>
          Registered: {new Date(farmer.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (!hasSearched) {
      return (
        <View style={styles.initialState}>
          <Ionicons name="search-outline" size={80} color="#d1d5db" />
          <Text style={styles.initialTitle}>Search Farmers</Text>
          <Text style={styles.initialDescription}>
            Enter a farmer's NIN, name, phone number, or email address to find their record
          </Text>
          <View style={styles.searchTips}>
            <Text style={styles.tipsTitle}>Search Tips:</Text>
            <Text style={styles.tipText}>• Use full or partial names</Text>
            <Text style={styles.tipText}>• Enter complete NIN (11 digits)</Text>
            <Text style={styles.tipText}>• Use phone number with or without country code</Text>
            <Text style={styles.tipText}>• Email searches are case-insensitive</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.emptyResults}>
        <Ionicons name="alert-circle-outline" size={64} color="#f59e0b" />
        <Text style={styles.emptyTitle}>No Results Found</Text>
        <Text style={styles.emptyDescription}>
          No farmers match your search criteria: "{searchQuery}"
        </Text>
        <Text style={styles.emptyHint}>
          Try using a different search term or check the spelling
        </Text>
      </View>
    );
  };

  if (loading) {
    return <LoadingScreen message="Searching farmers..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search Farmers</Text>
        <Text style={styles.subtitle}>
          Find farmers by NIN, name, phone, or email
        </Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter NIN, name, phone, or email"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}
              >
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.searchButton, !searchQuery.trim() && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={!searchQuery.trim()}
          >
            <Ionicons name="search" size={20} color="#ffffff" />
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Search Options */}
        <View style={styles.quickSearchContainer}>
          <Text style={styles.quickSearchLabel}>Quick Search:</Text>
          <View style={styles.quickSearchButtons}>
            <TouchableOpacity
              style={styles.quickSearchButton}
              onPress={() => setSearchQuery('NIN:')}
            >
              <Text style={styles.quickSearchText}>NIN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSearchButton}
              onPress={() => setSearchQuery('080')}
            >
              <Text style={styles.quickSearchText}>Phone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSearchButton}
              onPress={() => setSearchQuery('@')}
            >
              <Text style={styles.quickSearchText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Results Section */}
      <View style={styles.resultsContainer}>
        {hasSearched && searchResults.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </Text>
            <TouchableOpacity onPress={clearSearch}>
              <Text style={styles.clearResultsText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={searchResults}
          renderItem={renderFarmerResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  searchSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#013358',
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
  quickSearchContainer: {
    marginTop: 8,
  },
  quickSearchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  quickSearchButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickSearchButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  quickSearchText: {
    fontSize: 12,
    color: '#013358',
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  clearResultsText: {
    fontSize: 16,
    color: '#013358',
    fontWeight: '500',
  },
  listContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#013358',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  farmerDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  cardActions: {
    padding: 8,
  },
  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
    flex: 1,
  },
  registrationDate: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
  },
  initialState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  initialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  initialDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  searchTips: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  emptyHint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
