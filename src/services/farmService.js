import { auth } from './firebase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.10.138:3000/api';

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return await user.getIdToken();
};

export const farmService = {
  // Create a new farm for a farmer
  async createFarm(farmerId, farmData) {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/farms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          farmerId,
          ...farmData
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create farm');
      }

      return await response.json();
    } catch (error) {
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

      return await response.json();
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
