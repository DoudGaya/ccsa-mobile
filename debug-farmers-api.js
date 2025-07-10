// Debug script to test farmers API
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyBJB8fk_vcXzWAXoKLDy7wXP6gBsRsePyE",
  authDomain: "fims-6c9b9.firebaseapp.com",
  projectId: "fims-6c9b9",
  storageBucket: "fims-6c9b9.firebasestorage.app",
  messagingSenderId: "568097701717",
  appId: "1:568097701717:web:b94d27b90a7a39f82d3edb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testFarmersAPI() {
  try {
    console.log('🔍 Testing Farmers API...');
    
    // Sign in with test credentials (you'll need to provide valid credentials)
    const email = 'test@example.com'; // Change this to a valid user
    const password = 'password123'; // Change this to the correct password
    
    console.log('📧 Signing in with:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Signed in successfully:', user.email);
    
    // Get the auth token
    const token = await user.getIdToken();
    console.log('🔑 Got auth token, length:', token.length);
    
    // Make API call to farmers endpoint - use the same URL as the app
    const API_URL = 'http://192.168.10.220:3000/api/farmers';
    console.log('🌐 Making request to:', API_URL);
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ API Error:', errorData);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    console.log('✅ Response type:', typeof data);
    console.log('✅ Response keys:', Object.keys(data));
    
    if (data.farmers) {
      console.log('📊 Farmers count:', data.farmers.length);
      console.log('📊 First farmer:', data.farmers[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testFarmersAPI();
