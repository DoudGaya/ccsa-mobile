// Simple test file to debug Firebase initialization
console.log('Testing Firebase initialization...');

try {
  console.log('Environment variables:');
  console.log('EXPO_PUBLIC_FIREBASE_API_KEY:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set');
  console.log('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Not set');
  console.log('EXPO_PUBLIC_FIREBASE_PROJECT_ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Not set');
  console.log('EXPO_PUBLIC_FIREBASE_APP_ID:', process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Not set');
  
  const { auth } = require('./src/services/firebase');
  console.log('Firebase auth imported successfully:', auth ? 'Yes' : 'No');
  
  if (auth) {
    console.log('Auth object type:', typeof auth);
    console.log('Auth object keys:', Object.keys(auth));
  }
} catch (error) {
  console.error('Error importing Firebase:', error);
}
