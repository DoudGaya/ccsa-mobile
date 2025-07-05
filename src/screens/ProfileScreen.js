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
import { useAuth } from '../store/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({
    totalFarmers: 0,
    thisMonth: 0,
    thisWeek: 0,
    today: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: Implement actual stats fetching from backend
      // For now, using mock data
      setStats({
        totalFarmers: 245,
        thisMonth: 32,
        thisWeek: 8,
        today: 3,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              navigation.replace('Welcome');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing will be implemented soon.');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change will be implemented soon.');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings screen will be implemented soon.');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'For support, please contact: support@ccsa.gov.ng');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.displayName || 'Enrolment Agent'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userRole}>Enrolment Agent</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={20} color="#007bff" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Registration Statistics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Farmers"
            value={stats.totalFarmers}
            icon="people-outline"
            color="#28a745"
          />
          <StatCard
            title="This Month"
            value={stats.thisMonth}
            icon="calendar-outline"
            color="#007bff"
          />
          <StatCard
            title="This Week"
            value={stats.thisWeek}
            icon="time-outline"
            color="#ffc107"
          />
          <StatCard
            title="Today"
            value={stats.today}
            icon="today-outline"
            color="#17a2b8"
          />
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <MenuOption
          icon="key-outline"
          title="Change Password"
          subtitle="Update your password"
          onPress={handleChangePassword}
        />
        
        <MenuOption
          icon="settings-outline"
          title="Settings"
          subtitle="App preferences and configuration"
          onPress={handleSettings}
        />
        
        <MenuOption
          icon="help-circle-outline"
          title="Support"
          subtitle="Get help and contact support"
          onPress={handleSupport}
        />
        
        <MenuOption
          icon="information-circle-outline"
          title="About"
          subtitle="App version and information"
          onPress={() => Alert.alert('About', 'FIMS v1.0.0\nFarmers Information Management System')}
        />
      </View>

      {/* Sign Out Button */}
      <View style={styles.signOutSection}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#dc3545" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color="#fff" />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const MenuOption = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.menuOption} onPress={onPress}>
    <View style={styles.menuIcon}>
      <Ionicons name={icon} size={24} color="#666" />
    </View>
    <View style={styles.menuContent}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#ccc" />
  </TouchableOpacity>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  signOutSection: {
    padding: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  signOutText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;
