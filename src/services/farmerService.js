import { auth } from './firebase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return await user.getIdToken();
};

const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = await getAuthToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.log('API Error Response:', errorData);
    
    // Create a more detailed error
    const error = new Error(errorData.message || errorData.error || 'Request failed');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  
  return response.json();
};

export const farmerService = {
  async createFarmer(farmerData) {
    const url = `${API_BASE_URL}/farmers`;
    const data = await makeAuthenticatedRequest(url, {
      method: 'POST',
      body: JSON.stringify(farmerData),
    });
    return data;
  },

  async getFarmers(page = 1, limit = 10, search = '') {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    
    const url = `${API_BASE_URL}/farmers?${queryParams}`;
    const data = await makeAuthenticatedRequest(url);
    return data;
  },

  async getFarmerById(id) {
    const url = `${API_BASE_URL}/farmers/${id}`;
    const data = await makeAuthenticatedRequest(url);
    return data;
  },

  async getFarmerByNin(nin) {
    const url = `${API_BASE_URL}/farmers/search?query=${nin}&type=nin`;
    const data = await makeAuthenticatedRequest(url);
    return data.farmers?.[0] || null;
  },

  async searchFarmers(query, type = 'all') {
    const queryParams = new URLSearchParams({
      query,
      ...(type !== 'all' && { type }),
    });
    
    const url = `${API_BASE_URL}/farmers/search?${queryParams}`;
    const data = await makeAuthenticatedRequest(url);
    return data.farmers || [];
  },

  async updateFarmer(id, updates) {
    const url = `${API_BASE_URL}/farmers/${id}`;
    const data = await makeAuthenticatedRequest(url, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data;
  },

  async deleteFarmer(id) {
    const url = `${API_BASE_URL}/farmers/${id}`;
    await makeAuthenticatedRequest(url, {
      method: 'DELETE',
    });
    return { success: true };
  },

  async checkUniqueFields(nin, email, phone, bvn) {
    const queryParams = new URLSearchParams({
      ...(nin && { nin }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(bvn && { bvn }),
    });
    
    const url = `${API_BASE_URL}/farmers/validate?${queryParams}`;
    try {
      await makeAuthenticatedRequest(url);
      return []; // No conflicts
    } catch (error) {
      console.log('Validation error response:', error.message);
      
      // Try to parse the error response for conflicts
      try {
        // If the error contains structured data about conflicts
        if (error.message.includes('conflicts')) {
          return ['Duplicate data found']; // Generic message for now
        }
      } catch (parseError) {
        console.log('Could not parse conflict details:', parseError);
      }
      
      // Return generic conflict message
      return ['Field already exists'];
    }
  },
};
