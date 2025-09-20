import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../store/AuthContext';
import { auth } from '../services/firebase';

export default function AttendanceScreen({ navigation }) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadAttendanceState();
    loadAttendanceHistory();
  }, []);

  const loadAttendanceState = async () => {
    try {
      const checkedIn = await AsyncStorage.getItem('isCheckedIn');
      const checkInTimeStr = await AsyncStorage.getItem('checkInTime');
      
      if (checkedIn === 'true' && checkInTimeStr) {
        setIsCheckedIn(true);
        setCheckInTime(new Date(checkInTimeStr));
      }
    } catch (error) {
      console.error('Error loading attendance state:', error);
    }
  };

  const loadAttendanceHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('attendanceHistory');
      if (history) {
        setAttendanceHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading attendance history:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required for attendance tracking.',
          [{ text: 'OK' }]
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
        maximumAge: 60000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
      return null;
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    
    try {
      const location = await getCurrentLocation();
      if (!location) {
        setLoading(false);
        return;
      }

      const checkInData = {
        type: 'check_in',
        timestamp: new Date().toISOString(),
        location: location,
        agentId: user?.id,
        date: new Date().toDateString(),
      };

      // Save to local storage
      await AsyncStorage.setItem('isCheckedIn', 'true');
      await AsyncStorage.setItem('checkInTime', checkInData.timestamp);
      
      // Add to history
      const history = [...attendanceHistory, checkInData];
      await AsyncStorage.setItem('attendanceHistory', JSON.stringify(history));
      
      // Send to server
      await syncAttendanceToServer(checkInData);

      setIsCheckedIn(true);
      setCheckInTime(new Date());
      setCurrentLocation(location);
      setAttendanceHistory(history);

      Alert.alert('Success', 'Checked in successfully!');
    } catch (error) {
      console.error('Error checking in:', error);
      Alert.alert('Error', 'Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    
    try {
      const location = await getCurrentLocation();
      if (!location) {
        setLoading(false);
        return;
      }

      const checkOutData = {
        type: 'check_out',
        timestamp: new Date().toISOString(),
        location: location,
        agentId: user?.id,
        date: new Date().toDateString(),
        duration: checkInTime ? Math.floor((new Date() - checkInTime) / 1000 / 60) : 0, // minutes
      };

      // Update local storage
      await AsyncStorage.removeItem('isCheckedIn');
      await AsyncStorage.removeItem('checkInTime');
      
      // Add to history
      const history = [...attendanceHistory, checkOutData];
      await AsyncStorage.setItem('attendanceHistory', JSON.stringify(history));
      
      // Send to server
      await syncAttendanceToServer(checkOutData);

      setIsCheckedIn(false);
      setCheckInTime(null);
      setCurrentLocation(location);
      setAttendanceHistory(history);

      Alert.alert('Success', 'Checked out successfully!');
    } catch (error) {
      console.error('Error checking out:', error);
      Alert.alert('Error', 'Failed to check out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const syncAttendanceToServer = async (attendanceData) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(attendanceData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to sync attendance to server');
      }
      
      console.log('✅ Attendance synced successfully');
    } catch (error) {
      console.error('Error syncing to server:', error);
      // Store for later sync
      const pendingSync = await AsyncStorage.getItem('pendingAttendanceSync');
      const pending = pendingSync ? JSON.parse(pendingSync) : [];
      pending.push(attendanceData);
      await AsyncStorage.setItem('pendingAttendanceSync', JSON.stringify(pending));
    }
  };

  const formatTime = (time, includeDate = false) => {
    if (!time) return 'N/A';
    try {
      const date = new Date(time);
      return includeDate ? date.toLocaleString() : date.toLocaleTimeString();
    } catch (error) {
      return 'Invalid time';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || isNaN(minutes) || minutes < 0) {
      return '0h 0m';
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getWorkingTime = () => {
    if (!checkInTime) return 'Not checked in';
    const duration = Math.floor((new Date() - checkInTime) / 1000 / 60);
    return formatDuration(duration);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#013358" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="time-outline" size={48} color="#013358" />
            <Text style={styles.title}>Attendance</Text>
            <Text style={styles.subtitle}>Track your work hours</Text>
          </View>
        </View>

        {/* Current Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={isCheckedIn ? "checkmark-circle" : "time-outline"} 
              size={32} 
              color={isCheckedIn ? "#10b981" : "#f59e0b"} 
            />
            <Text style={styles.statusTitle}>
              {isCheckedIn ? 'Checked In' : 'Not Checked In'}
            </Text>
          </View>
          
          {isCheckedIn && (
            <View style={styles.statusDetails}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Check-in Time:</Text>
                <Text style={styles.statusValue}>{formatTime(checkInTime)}</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Working Time:</Text>
                <Text style={styles.statusValue}>{getWorkingTime()}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.attendanceButton,
              isCheckedIn ? styles.checkOutButton : styles.checkInButton
            ]}
            onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
            disabled={loading}
          >
            <Ionicons 
              name={isCheckedIn ? "log-out-outline" : "log-in-outline"} 
              size={20} 
              color="#ffffff" 
            />
            <Text style={styles.attendanceButtonText}>
              {loading ? 'Processing...' : (isCheckedIn ? 'Check Out' : 'Check In')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="log-in-outline" size={24} color="#10b981" />
              <Text style={styles.summaryLabel}>Check-ins</Text>
              <Text style={styles.summaryValue}>
                {attendanceHistory.filter(item => 
                  item.type === 'check_in' && 
                  new Date(item.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              <Text style={styles.summaryLabel}>Check-outs</Text>
              <Text style={styles.summaryValue}>
                {attendanceHistory.filter(item => 
                  item.type === 'check_out' && 
                  new Date(item.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="time-outline" size={24} color="#3b82f6" />
              <Text style={styles.summaryLabel}>Total Time</Text>
              <Text style={styles.summaryValue}>
                {formatDuration(
                  attendanceHistory
                    .filter(item => 
                      item.type === 'check_out' && 
                      new Date(item.timestamp).toDateString() === new Date().toDateString()
                    )
                    .reduce((total, item) => total + (item.duration || 0), 0)
                )}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="location-outline" size={24} color="#8b5cf6" />
              <Text style={styles.summaryLabel}>Locations</Text>
              <Text style={styles.summaryValue}>
                {new Set(
                  attendanceHistory
                    .filter(item => 
                      new Date(item.timestamp).toDateString() === new Date().toDateString()
                    )
                    .filter(item => item.location?.latitude && item.location?.longitude)
                    .map(item => `${item.location.latitude.toFixed(4)},${item.location.longitude.toFixed(4)}`)
                ).size}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {attendanceHistory.slice(-5).reverse().map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Ionicons 
                  name={item.type === 'check_in' ? "log-in-outline" : "log-out-outline"} 
                  size={20} 
                  color={item.type === 'check_in' ? "#10b981" : "#ef4444"} 
                />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyType}>
                  {item.type === 'check_in' ? 'Checked In' : 'Checked Out'}
                </Text>
                <Text style={styles.historyTime}>
                  {formatTime(item.timestamp, true)}
                </Text>
                {item.location && item.location.latitude && item.location.longitude && (
                  <Text style={styles.historyLocation}>
                    📍 {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
                  </Text>
                )}
                {item.duration && (
                  <Text style={styles.historyDuration}>
                    Duration: {formatDuration(item.duration)}
                  </Text>
                )}
              </View>
            </View>
          ))}
          
          {attendanceHistory.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No attendance records yet</Text>
              <Text style={styles.emptySubtext}>Check in to start tracking</Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How it works</Text>
          <View style={styles.instructionItem}>
            <Ionicons name="location-outline" size={20} color="#3b82f6" />
            <Text style={styles.instructionText}>
              Location tracking ensures accurate attendance recording
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="time-outline" size={20} color="#3b82f6" />
            <Text style={styles.instructionText}>
              Check in when you start work, check out when you finish
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="cloud-upload-outline" size={20} color="#3b82f6" />
            <Text style={styles.instructionText}>
              Data is automatically synced when internet is available
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#013358',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 12,
  },
  statusDetails: {
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  checkInButton: {
    backgroundColor: '#10b981',
  },
  checkOutButton: {
    backgroundColor: '#ef4444',
  },
  attendanceButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    width: '48%',
    paddingVertical: 12,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  historyItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  historyLocation: {
    fontSize: 12,
    color: '#8b5cf6',
    marginBottom: 2,
  },
  historyDuration: {
    fontSize: 12,
    color: '#10b981',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  instructionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
    flex: 1,
  },
});