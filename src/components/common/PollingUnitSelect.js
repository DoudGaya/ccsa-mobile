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

export default function PollingUnitSelect({ selectedState, selectedLGA, selectedWard, selectedValue, onValueChange, placeholder, error }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pollingUnits, setPollingUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load polling units when state, LGA, or ward changes
  useEffect(() => {
    const loadPollingUnits = async () => {
      if (selectedWard) {
        setLoading(true);
        try {
          const pollingData = await lazyLocationService.getPollingUnits(selectedWard);
          console.log(`🗳️ PollingUnitSelect: Loaded ${pollingData.length} polling units for ward ${selectedWard}`);
          setPollingUnits(pollingData);
        } catch (error) {
          console.error('❌ PollingUnitSelect: Error loading polling units:', error);
          setPollingUnits([]);
        } finally {
          setLoading(false);
        }
      } else {
        setPollingUnits([]);
      }
    };

    loadPollingUnits();
  }, [selectedWard]); // Only depend on selectedWard since it's the direct parent

  const filteredPollingUnits = pollingUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter((unit, index, self) => 
    index === self.findIndex(u => u.value === unit.value)
  );

  const handleSelect = (pollingUnit) => {
    onValueChange(pollingUnit.value);
    setModalVisible(false);
    setSearchQuery('');
  };

  const getSelectedPollingUnitName = () => {
    const unit = pollingUnits.find(u => u.value === selectedValue);
    return unit ? unit.name : placeholder || 'Select Polling Unit';
  };

  const renderPollingUnitItem = ({ item }) => (
    <TouchableOpacity
      style={styles.pollingUnitItem}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.pollingUnitItemText}>{item.name}</Text>
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
        disabled={!selectedState || !selectedLGA || !selectedWard || loading}
      >
        <Ionicons name="location-outline" size={20} color="#9ca3af" style={styles.selectIcon} />
        <Text style={[styles.selectText, !selectedValue && styles.placeholderText]}>
          {loading ? 'Loading polling units...' : getSelectedPollingUnitName()}
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
            <Text style={styles.modalTitle}>Select Polling Unit</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search polling units..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          {filteredPollingUnits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {!selectedState || !selectedLGA || !selectedWard 
                  ? 'Please select state, LGA, and ward first' 
                  : 'No polling units found'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredPollingUnits}
              renderItem={renderPollingUnitItem}
              keyExtractor={(item, index) => item.value || item.id || `polling-${index}`}
              style={styles.pollingUnitList}
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
  pollingUnitList: {
    flex: 1,
  },
  pollingUnitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pollingUnitItemText: {
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
