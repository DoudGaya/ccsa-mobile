import { auth } from './firebase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ No authenticated user found in analyticsService');
    throw new Error('User not authenticated');
  }
  try {
    const token = await user.getIdToken(true); // Force refresh
    console.log('✅ Got analytics auth token, length:', token.length);
    return token;
  } catch (error) {
    console.error('❌ Error getting analytics auth token:', error);
    throw new Error('Failed to get authentication token');
  }
};

export const analyticsService = {
  async getAgentStats() {
    try {
      console.log('🔍 Fetching agent statistics...');
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📊 Analytics response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Analytics API Error:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to fetch analytics');
      }

      const data = await response.json();
      console.log('✅ Analytics data received:', data);
      return data;
    } catch (error) {
      console.error('❌ Analytics service error:', error);
      throw error;
    }
  },
};
