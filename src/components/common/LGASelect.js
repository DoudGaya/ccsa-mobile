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
import optimizedLocationService from '../../services/optimizedLocationService';

export default function LGASelect({ selectedState, selectedValue, onValueChange, placeholder, error }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lgas, setLgas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load LGAs when state changes
  useEffect(() => {
    const loadLgas = async () => {
      if (selectedState) {
        setLoading(true);
        try {
          const lgaData = await optimizedLocationService.getLgasForState(selectedState);
          setLgas(lgaData);
        } catch (error) {
          console.error('LGASelect: Error loading LGAs:', error);
          setLgas([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLgas([]);
      }
    };

    loadLgas();
  }, [selectedState]);

  const filteredLgas = lgas.filter(lga =>
    lga.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter((lga, index, self) => 
    index === self.findIndex(l => l.value === lga.value)
  );

  const handleSelect = (lga) => {
    onValueChange(lga.value);
    setModalVisible(false);
    setSearchQuery('');
  };

  const getSelectedLgaName = () => {
    const lga = lgas.find(l => l.value === selectedValue);
    return lga ? lga.name : placeholder || 'Select Local Government';
  };
  const renderLgaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.lgaItem}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.lgaItemText}>{item.name}</Text>
      {selectedValue === item.value && (
        <Ionicons name="checkmark" size={20} color="#2563eb" />
      )}
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        style={[styles.selectButton, error && styles.selectButtonError]}
        onPress={() => setModalVisible(true)}
        disabled={!selectedState || loading}
      >
        <Ionicons name="business-outline" size={20} color="#9ca3af" style={styles.selectIcon} />
        <Text style={[styles.selectText, !selectedValue && styles.placeholderText]}>
          {loading ? 'Loading LGAs...' : getSelectedLgaName()}
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
            <Text style={styles.modalTitle}>Select LGA</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search LGAs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          {filteredLgas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {!selectedState ? 'Please select a state first' : 'No LGAs found'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredLgas}
              renderItem={renderLgaItem}
              keyExtractor={(item, index) => item.value || item.id || `lga-${index}`}
              style={styles.lgaList}
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
  lgaList: {
    flex: 1,
  },
  lgaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lgaItemText: {
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
