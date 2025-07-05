import { supabase } from './supabase';

export const farmerService = {
  async createFarmer(farmerData) {
    const { data, error } = await supabase
      .from('farmers')
      .insert([farmerData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getFarmers() {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getFarmerById(id) {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getFarmerByNin(nin) {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('nin', nin)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No farmer found
      }
      throw error;
    }
    return data;
  },

  async searchFarmers(query) {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .or(`nin.ilike.%${query}%,personal_info->>firstName.ilike.%${query}%,personal_info->>lastName.ilike.%${query}%,personal_info->>phoneNumber.ilike.%${query}%`);
    
    if (error) throw error;
    return data;
  },

  async updateFarmer(id, updates) {
    const { data, error } = await supabase
      .from('farmers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteFarmer(id) {
    const { error } = await supabase
      .from('farmers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async checkUniqueFields(nin, email, phone, bvn) {
    const { data, error } = await supabase
      .from('farmers')
      .select('nin, personal_info, bank_info')
      .or(`nin.eq.${nin},personal_info->>email.eq.${email},personal_info->>phoneNumber.eq.${phone},bank_info->>bvn.eq.${bvn}`);
    
    if (error) throw error;
    
    const conflicts = [];
    data.forEach(farmer => {
      if (farmer.nin === nin) conflicts.push('NIN');
      if (farmer.personal_info?.email === email) conflicts.push('Email');
      if (farmer.personal_info?.phoneNumber === phone) conflicts.push('Phone Number');
      if (farmer.bank_info?.bvn === bvn) conflicts.push('BVN');
    });
    
    return conflicts;
  },
};
