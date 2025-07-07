import { auth } from './src/services/firebase.js';

console.log('Testing Firebase Auth token...');

// Test Firebase auth
const testAuth = async () => {
  try {
    console.log('Current auth state:', !!auth.currentUser);
    
    if (auth.currentUser) {
      console.log('User ID:', auth.currentUser.uid);
      console.log('User email:', auth.currentUser.email);
      
      // Try to get a fresh token
      const token = await auth.currentUser.getIdToken(true);
      console.log('Token length:', token.length);
      console.log('Token preview:', token.substring(0, 50) + '...');
      
      // Try to make a request with the token
      const response = await fetch('http://192.168.10.138:3000/api/nin/lookup?nin=12345678901', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const result = await response.json();
      console.log('Response data:', JSON.stringify(result, null, 2));
    } else {
      console.log('No user logged in');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Wait for auth state
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', !!user);
  if (user) {
    testAuth();
  } else {
    console.log('Please log in first');
  }
});

// Keep the script running
setTimeout(() => {
  console.log('Test complete');
}, 5000);
