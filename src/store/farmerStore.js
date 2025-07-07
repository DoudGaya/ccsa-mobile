import { create } from 'zustand';
import { farmerService } from '../services/farmerService';

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
      const farmers = await farmerService.getFarmers();
      set({ farmers, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
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
