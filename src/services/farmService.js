import { auth } from './firebase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.10.220:3000/api';

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return await user.getIdToken();
};

export const farmService = {
  // Create a new farm for a farmer
  async createFarm(farmerId, farmData) {
    try {
      console.log('=== FARM SERVICE CREATE START ===');
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Creating farm for farmer:', farmerId);
      console.log('Farm data:', JSON.stringify(farmData, null, 2));
      
      const token = await getAuthToken();
      console.log('Token obtained for request');
      
      const requestUrl = `${API_BASE_URL}/farms`;
      console.log('Request URL:', requestUrl);
      
      const requestBody = {
        farmerId,
        ...farmData
      };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        } catch (parseError) {
          // If JSON parsing fails, the response is likely HTML (error page)
          console.error('Failed to parse error response as JSON:', parseError);
          console.error('Response was likely HTML:', responseText.substring(0, 200));
          throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. This usually indicates a server error.`);
        }
      }

      const data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
      console.log('=== FARM SERVICE CREATE SUCCESS ===');
      
      return data;
    } catch (error) {
      console.error('=== FARM SERVICE CREATE ERROR ===');
      console.error('Farm creation error:', error);
      throw error;
    }
  },

  // Get all farms for a farmer
  async getFarmsByFarmer(farmerId) {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/farms/farmer/${farmerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch farms');
      }

      const data = await response.json();
      return data.farms || []; // Extract farms array from response
    } catch (error) {
      console.error('Fetch farms error:', error);
      throw error;
    }
  },

  // Update a farm
  async updateFarm(farmId, farmData) {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/farms/${farmId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(farmData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update farm');
      }

      return await response.json();
    } catch (error) {
      console.error('Farm update error:', error);
      throw error;
    }
  },

  // Delete a farm
  async deleteFarm(farmId) {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/farms/${farmId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete farm');
      }

      return await response.json();
    } catch (error) {
      console.error('Farm deletion error:', error);
      throw error;
    }
  },

  // Get farm by ID
  async getFarmById(farmId) {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/farms/${farmId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch farm');
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch farm error:', error);
      throw error;
    }
  },
};
