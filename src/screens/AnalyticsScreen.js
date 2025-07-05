import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useFarmerStore } from '../store/farmerStore';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AnalyticsScreen = ({ navigation }) => {
  const { farmers, loading, fetchFarmers } = useFarmerStore();
  const [analytics, setAnalytics] = useState({
    totalFarmers: 0,
    genderDistribution: { male: 0, female: 0 },
    ageGroups: { '18-30': 0, '31-45': 0, '46-60': 0, '60+': 0 },
    stateDistribution: {},
    cropDistribution: {},
    monthlyRegistrations: {},
    averageFarmSize: 0,
    bankDistribution: {},
  });

  useEffect(() => {
    if (farmers.length === 0) {
      fetchFarmers();
    } else {
      calculateAnalytics();
    }
  }, [farmers]);

  const calculateAnalytics = () => {
    const totalFarmers = farmers.length;
    
    // Gender distribution
    const genderDistribution = farmers.reduce((acc, farmer) => {
      const gender = farmer.gender?.toLowerCase() || 'unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    // Age groups
    const ageGroups = farmers.reduce((acc, farmer) => {
      if (farmer.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(farmer.dateOfBirth).getFullYear();
        if (age >= 18 && age <= 30) acc['18-30']++;
        else if (age >= 31 && age <= 45) acc['31-45']++;
        else if (age >= 46 && age <= 60) acc['46-60']++;
        else if (age > 60) acc['60+']++;
      }
      return acc;
    }, { '18-30': 0, '31-45': 0, '46-60': 0, '60+': 0 });

    // State distribution
    const stateDistribution = farmers.reduce((acc, farmer) => {
      const state = farmer.state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    // Crop distribution
    const cropDistribution = farmers.reduce((acc, farmer) => {
      if (farmer.farmInfo?.primaryCrop) {
        const crop = farmer.farmInfo.primaryCrop;
        acc[crop] = (acc[crop] || 0) + 1;
      }
      return acc;
    }, {});

    // Monthly registrations
    const monthlyRegistrations = farmers.reduce((acc, farmer) => {
      if (farmer.createdAt) {
        const month = new Date(farmer.createdAt).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {});

    // Average farm size
    const farmSizes = farmers
      .filter(farmer => farmer.farmInfo?.farmSize)
      .map(farmer => parseFloat(farmer.farmInfo.farmSize));
    const averageFarmSize = farmSizes.length > 0 
      ? farmSizes.reduce((sum, size) => sum + size, 0) / farmSizes.length 
      : 0;

    // Bank distribution
    const bankDistribution = farmers.reduce((acc, farmer) => {
      if (farmer.bankName) {
        acc[farmer.bankName] = (acc[farmer.bankName] || 0) + 1;
      }
      return acc;
    }, {});

    setAnalytics({
      totalFarmers,
      genderDistribution,
      ageGroups,
      stateDistribution,
      cropDistribution,
      monthlyRegistrations,
      averageFarmSize: averageFarmSize.toFixed(2),
      bankDistribution,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.summaryGrid}>
          <SummaryCard
            title="Total Farmers"
            value={analytics.totalFarmers}
            icon="people-outline"
            color="#28a745"
          />
          <SummaryCard
            title="Average Farm Size"
            value={`${analytics.averageFarmSize} ha`}
            icon="leaf-outline"
            color="#17a2b8"
          />
          <SummaryCard
            title="States Covered"
            value={Object.keys(analytics.stateDistribution).length}
            icon="location-outline"
            color="#ffc107"
          />
          <SummaryCard
            title="Crop Types"
            value={Object.keys(analytics.cropDistribution).length}
            icon="flower-outline"
            color="#fd7e14"
          />
        </View>
      </View>

      {/* Gender Distribution */}
      <AnalyticsCard title="Gender Distribution" icon="people-outline">
        <DistributionChart data={analytics.genderDistribution} />
      </AnalyticsCard>

      {/* Age Groups */}
      <AnalyticsCard title="Age Groups" icon="person-outline">
        <DistributionChart data={analytics.ageGroups} />
      </AnalyticsCard>

      {/* Top States */}
      <AnalyticsCard title="Top States" icon="location-outline">
        <TopItemsList 
          data={analytics.stateDistribution} 
          limit={5}
          total={analytics.totalFarmers}
        />
      </AnalyticsCard>

      {/* Top Crops */}
      <AnalyticsCard title="Popular Crops" icon="leaf-outline">
        <TopItemsList 
          data={analytics.cropDistribution} 
          limit={5}
          total={analytics.totalFarmers}
        />
      </AnalyticsCard>

      {/* Monthly Registrations */}
      <AnalyticsCard title="Monthly Registrations" icon="calendar-outline">
        <DistributionChart data={analytics.monthlyRegistrations} />
      </AnalyticsCard>

      {/* Top Banks */}
      <AnalyticsCard title="Top Banks" icon="card-outline">
        <TopItemsList 
          data={analytics.bankDistribution} 
          limit={5}
          total={analytics.totalFarmers}
        />
      </AnalyticsCard>
    </ScrollView>
  );
};

const SummaryCard = ({ title, value, icon, color }) => (
  <View style={styles.summaryCard}>
    <View style={[styles.summaryIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color="#fff" />
    </View>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryTitle}>{title}</Text>
  </View>
);

const AnalyticsCard = ({ title, icon, children }) => (
  <View style={styles.analyticsCard}>
    <View style={styles.cardHeader}>
      <Ionicons name={icon} size={20} color="#28a745" />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const DistributionChart = ({ data }) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  
  return (
    <View style={styles.chartContainer}>
      {Object.entries(data).map(([key, value]) => {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return (
          <View key={key} style={styles.chartItem}>
            <View style={styles.chartLabel}>
              <Text style={styles.chartKey}>{key}</Text>
              <Text style={styles.chartValue}>{value}</Text>
            </View>
            <View style={styles.chartBar}>
              <View 
                style={[
                  styles.chartFill, 
                  { width: `${percentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.chartPercentage}>{percentage.toFixed(1)}%</Text>
          </View>
        );
      })}
    </View>
  );
};

const TopItemsList = ({ data, limit, total }) => {
  const sortedData = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);

  return (
    <View style={styles.topItemsContainer}>
      {sortedData.map(([key, value], index) => {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return (
          <View key={key} style={styles.topItem}>
            <View style={styles.topItemRank}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <View style={styles.topItemContent}>
              <Text style={styles.topItemName}>{key}</Text>
              <Text style={styles.topItemCount}>{value} farmers ({percentage.toFixed(1)}%)</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

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
  summarySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
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
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  analyticsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartLabel: {
    width: 80,
    marginRight: 12,
  },
  chartKey: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  chartValue: {
    fontSize: 12,
    color: '#666',
  },
  chartBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginRight: 8,
  },
  chartFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 3,
  },
  chartPercentage: {
    fontSize: 12,
    color: '#666',
    width: 40,
    textAlign: 'right',
  },
  topItemsContainer: {
    marginTop: 8,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  topItemRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  topItemContent: {
    flex: 1,
  },
  topItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  topItemCount: {
    fontSize: 14,
    color: '#666',
  },
});

export default AnalyticsScreen;
