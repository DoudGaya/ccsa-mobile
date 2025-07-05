import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFarmerStore } from '../store/farmerStore';
import LoadingScreen from './LoadingScreen';

export default function FarmersListScreen({ navigation }) {
  const { farmers, loading, getFarmers } = useFarmerStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFarmers, setFilteredFarmers] = useState([]);

  useEffect(() => {
    loadFarmers();
  }, []);

  useEffect(() => {
    filterFarmers();
  }, [farmers, searchQuery]);

  const loadFarmers = async () => {
    try {
      await getFarmers();
    } catch (error) {
      console.error('Error loading farmers:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFarmers();
    setRefreshing(false);
  };

  const filterFarmers = () => {
    if (!searchQuery.trim()) {
      setFilteredFarmers(farmers);
      return;
    }

    const filtered = farmers.filter((farmer) => {
      const query = searchQuery.toLowerCase();
      const fullName = `${farmer.personalInfo.firstName} ${farmer.personalInfo.lastName}`.toLowerCase();
      const email = farmer.personalInfo.email.toLowerCase();
      const phone = farmer.personalInfo.phoneNumber;
      const nin = farmer.nin;

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        nin.includes(query)
      );
    });

    setFilteredFarmers(filtered);
  };

  const renderFarmerCard = ({ item: farmer }) => (
    <TouchableOpacity
      style={styles.farmerCard}
      onPress={() => navigation.navigate('FarmerDetails', { farmer })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {farmer.personalInfo.firstName[0]}{farmer.personalInfo.lastName[0]}
          </Text>
        </View>
        <View style={styles.farmerInfo}>
          <Text style={styles.farmerName}>
            {farmer.personalInfo.firstName} {farmer.personalInfo.lastName}
          </Text>
          <Text style={styles.farmerDetails}>
            NIN: {farmer.nin}
          </Text>
          <Text style={styles.farmerDetails}>
            {farmer.personalInfo.phoneNumber}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.locationInfo}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.locationText}>
            {farmer.contactInfo.ward}, {farmer.contactInfo.localGovernment}
          </Text>
        </View>
        <Text style={styles.registrationDate}>
          Registered: {new Date(farmer.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={80} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Farmers Found</Text>
      <Text style={styles.emptyDescription}>
        {searchQuery ? 'No farmers match your search criteria' : 'Start by adding your first farmer'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddFarmer')}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Add First Farmer</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && farmers.length === 0) {
    return <LoadingScreen message="Loading farmers..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Registered Farmers</Text>
        <Text style={styles.subtitle}>
          {farmers.length} farmer{farmers.length !== 1 ? 's' : ''} registered
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, NIN, phone, or email"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Farmers List */}
      <FlatList
        data={filteredFarmers}
        renderItem={renderFarmerCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Add Button */}
      {farmers.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddFarmer')}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}
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
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  searchInputContainer: {
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
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  farmerCard: {
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
    backgroundColor: '#2563eb',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  registrationDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
