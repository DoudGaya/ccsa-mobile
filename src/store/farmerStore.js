import { create } from 'zustand';
import { farmerService } from '../services/farmerService';
import { auth } from '../services/firebase';

export const useFarmerStore = create((set, get) => ({
  farmers: [],
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addFarmer: async (farmerData) => {
    try {
      set({ loading: true, error: null });
      const newFarmer = await farmerService.createFarmer(farmerData);
      set((state) => ({
        farmers: [...state.farmers, newFarmer],
        loading: false,
      }));
      return newFarmer; // Return the created farmer
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  getFarmers: async () => {
    try {
      set({ loading: true, error: null });
      // Get a large number of farmers for the list view
      const response = await farmerService.getFarmers(1, 1000);
      // Extract farmers array from the paginated response
      const farmers = response.farmers || [];
      set({ farmers, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  // Add the missing fetchFarmers function that components are trying to use
  fetchFarmers: async () => {
    try {
      set({ loading: true, error: null });
      console.log('🔄 Starting fetchFarmers...');
      
      // Check authentication first
      if (!auth.currentUser) {
        console.log('❌ No authenticated user found');
        throw new Error('User not authenticated');
      }
      
      console.log('✅ Authenticated user:', auth.currentUser.email);
      
      // Call the API with pagination
      const response = await farmerService.getFarmers(1, 1000);
      console.log('✅ getFarmers API response:', response);
      console.log('✅ Response type:', typeof response);
      console.log('✅ Response keys:', Object.keys(response || {}));
      
      // Extract farmers array from the paginated response
      let farmers = [];
      if (response) {
        if (Array.isArray(response)) {
          // If response is directly an array
          farmers = response;
          console.log('✅ Response is direct array with', farmers.length, 'farmers');
        } else if (response.farmers && Array.isArray(response.farmers)) {
          // If response has farmers property
          farmers = response.farmers;
          console.log('✅ Response.farmers array with', farmers.length, 'farmers');
        } else if (response.data && Array.isArray(response.data)) {
          // If response has data property
          farmers = response.data;
          console.log('✅ Response.data array with', farmers.length, 'farmers');
        } else {
          console.log('❌ Unexpected response structure:', response);
          farmers = [];
        }
      }
      
      console.log('✅ Final farmers array length:', farmers.length);
      console.log('✅ Sample farmer:', farmers[0]);
      
      set({ farmers, loading: false });
      return farmers;
    } catch (error) {
      console.error('❌ Error fetching farmers:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      set({ 
        farmers: [],
        loading: false, 
        error: error.message 
      });
      throw error;
    }
  },

  searchFarmers: async (query) => {
    try {
      set({ loading: true, error: null });
      const farmers = await farmerService.searchFarmers(query);
      set({ loading: false });
      return farmers;
    } catch (error) {
      set({ loading: false, error: error.message });
      return [];
    }
  },

  getFarmerByNin: async (nin) => {
    try {
      set({ loading: true, error: null });
      const farmer = await farmerService.getFarmerByNin(nin);
      set({ loading: false });
      return farmer;
    } catch (error) {
      set({ loading: false, error: error.message });
      return null;
    }
  },

  updateFarmer: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const updatedFarmer = await farmerService.updateFarmer(id, updates);
      set((state) => ({
        farmers: state.farmers.map((farmer) =>
          farmer.id === id ? updatedFarmer : farmer
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  deleteFarmer: async (id) => {
    try {
      set({ loading: true, error: null });
      await farmerService.deleteFarmer(id);
      set((state) => ({
        farmers: state.farmers.filter((farmer) => farmer.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },
}));
