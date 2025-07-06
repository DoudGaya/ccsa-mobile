// This file is deprecated - we've migrated to Firebase Auth
// All authentication is now handled by Firebase
// See: src/services/firebase.js for the new Firebase configuration

export const deprecatedSupabaseService = {
  message: 'This service has been migrated to Firebase Auth. Please use the Firebase auth service instead.',
};

// For backward compatibility during migration
export const authService = deprecatedSupabaseService;
export const supabase = deprecatedSupabaseService;
