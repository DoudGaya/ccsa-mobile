// Test script to verify authentication
const { auth } = require('./src/services/firebase.js');

console.log('Testing authentication...');

// Check if user is logged in
const checkAuth = () => {
  console.log('Current user:', auth.currentUser ? auth.currentUser.email : 'No user logged in');
  
  if (auth.currentUser) {
    console.log('User UID:', auth.currentUser.uid);
    console.log('Email verified:', auth.currentUser.emailVerified);
    
    // Try to get token
    auth.currentUser.getIdToken(true)
      .then(token => {
        console.log('Token obtained successfully, length:', token.length);
        console.log('Token preview:', token.substring(0, 50) + '...');
      })
      .catch(error => {
        console.error('Token error:', error);
      });
  }
};

// Listen for auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User logged in:', user.email);
    checkAuth();
  } else {
    console.log('User logged out');
  }
});

// Keep script running
setTimeout(() => {
  console.log('Auth test complete');
}, 3000);
