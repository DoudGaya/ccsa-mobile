import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../store/AuthContext';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AddFarmerScreen from '../screens/AddFarmerScreen';
import AddFarmScreen from '../screens/AddFarmScreen';
import FarmersListScreen from '../screens/FarmersListScreen';
import SearchFarmerScreen from '../screens/SearchFarmerScreen';
import CertificateScreen from '../screens/CertificateScreen';
import FarmerDetailsScreen from '../screens/FarmerDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Bottom Tab Navigator for main screens
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'AddFarmer') {
            iconName = focused ? 'person-add' : 'person-add-outline';
          } else if (route.name === 'FarmersList') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Certificate') {
            iconName = focused ? 'document' : 'document-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="AddFarmer" 
        component={AddFarmerScreen} 
        options={{ title: 'Add Farmer' }}
      />
      <Tab.Screen 
        name="FarmersList" 
        component={FarmersListScreen} 
        options={{ title: 'View Farmers' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchFarmerScreen} 
        options={{ title: 'Search' }}
      />
      <Tab.Screen 
        name="Certificate" 
        component={CertificateScreen} 
        options={{ title: 'Certificate' }}
      />
    </Tab.Navigator>
  );
}

// Drawer Navigator for secondary navigation
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: '#2563eb',
        drawerInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabNavigator} 
        options={{ 
          title: 'FIMS Dashboard',
          drawerIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          drawerIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{
          drawerIcon: ({ color }) => <Ionicons name="analytics-outline" size={22} color={color} />
        }}
      />
    </Drawer.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Authenticated screens
        <>
          <Stack.Screen name="MainApp" component={DrawerNavigator} />
          <Stack.Screen 
            name="FarmerDetails" 
            component={FarmerDetailsScreen}
            options={{ headerShown: true, title: 'Farmer Details' }}
          />
          <Stack.Screen 
            name="AddFarm" 
            component={AddFarmScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        // Unauthenticated screens
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
