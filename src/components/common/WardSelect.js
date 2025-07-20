import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lazyLocationService } from '../../services/lazyLocationService';

export default function WardSelect({ selectedState, selectedLGA, selectedValue, onValueChange, placeholder, error }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wards when state or LGA changes
  useEffect(() => {
    const loadWards = async () => {
      if (selectedLGA) {
        setLoading(true);
        try {
          const wardData = await lazyLocationService.getWards(selectedLGA);
          console.log(`🏡 WardSelect: Loaded ${wardData.length} wards for LGA ${selectedLGA}`);
          setWards(wardData);
        } catch (error) {
          console.error('❌ WardSelect: Error loading wards:', error);
          setWards([]);
        } finally {
          setLoading(false);
        }
      } else {
        setWards([]);
      }
    };

    loadWards();
  }, [selectedLGA]);

  const filteredWards = wards.filter(ward =>
    ward.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter((ward, index, self) => 
    index === self.findIndex(w => w.value === ward.value)
  );

  const handleSelect = (ward) => {
    onValueChange(ward.value);
    setModalVisible(false);
    setSearchQuery('');
  };

  const getSelectedWardName = () => {
    const ward = wards.find(w => w.value === selectedValue);
    return ward ? ward.name : placeholder || 'Select Ward';
  };

  const renderWardItem = ({ item }) => (
    <TouchableOpacity
      style={styles.wardItem}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.wardItemText}>{item.name}</Text>
      {selectedValue === item.value && (
        <Ionicons name="checkmark" size={20} color="#013358" />
      )}
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        style={[styles.selectButton, error && styles.selectButtonError]}
        onPress={() => setModalVisible(true)}
        disabled={!selectedState || !selectedLGA || loading}
      >
        <Ionicons name="map-outline" size={20} color="#9ca3af" style={styles.selectIcon} />
        <Text style={[styles.selectText, !selectedValue && styles.placeholderText]}>
          {loading ? 'Loading wards...' : getSelectedWardName()}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#9ca3af" />
        ) : (
          <Ionicons name="chevron-down" size={20} color="#9ca3af" />
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Ward</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search wards..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          {filteredWards.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {!selectedState || !selectedLGA ? 'Please select a state and LGA first' : 'No wards found'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredWards}
              renderItem={renderWardItem}
              keyExtractor={(item, index) => item.value || item.id || `ward-${index}`}
              style={styles.wardList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  selectButtonError: {
    borderColor: '#ef4444',
  },
  selectIcon: {
    marginRight: 12,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerSpacer: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
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
  wardList: {
    flex: 1,
  },
  wardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  wardItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
