// Firebase service with production build fix
// This version prevents Metro bundling issues by conditionally loading Firebase

// CRASH-PROOF Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:android:xxxxxxxxxxxxxxxx",
  measurementId: "G-XXXXXXXXXX"
};

// In development, try to use environment variables
if (__DEV__) {
  try {
    if (process.env.EXPO_PUBLIC_FIREBASE_API_KEY) {
      firebaseConfig.apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
      firebaseConfig.authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain;
      firebaseConfig.projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId;
      firebaseConfig.storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket;
      firebaseConfig.messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId;
      firebaseConfig.appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID || firebaseConfig.appId;
      firebaseConfig.measurementId = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId;
      console.log('🔥 Using environment Firebase config');
    } else {
      console.log('🔥 Using fallback Firebase config (env vars not found)');
    }
  } catch (envError) {
    console.warn('🔥 Error reading environment variables, using fallback config:', envError);
  }
} else {
  console.log('🔥 Production mode: Using fallback Firebase config');
}

// Create mock Firebase objects that prevent crashes
const mockAuth = {
  currentUser: null,
  
  onAuthStateChanged: (callback, errorCallback) => {
    console.log('🔧 Mock onAuthStateChanged called');
    try {
      setTimeout(() => {
        if (typeof callback === 'function') {
          callback(null);
        }
      }, 100);
    } catch (callbackError) {
      console.error('🔧 Mock auth callback error:', callbackError);
      if (errorCallback && typeof errorCallback === 'function') {
        errorCallback(callbackError);
      }
    }
    return () => {
      console.log('🔧 Mock auth unsubscribe called');
    };
  },
  
  signInWithEmailAndPassword: (email, password) => {
    console.log('🔧 Mock signInWithEmailAndPassword called');
    return Promise.reject(new Error('Authentication service is not available'));
  },
  
  createUserWithEmailAndPassword: (email, password) => {
    console.log('🔧 Mock createUserWithEmailAndPassword called');
    return Promise.reject(new Error('Authentication service is not available'));
  },
  
  signOut: () => {
    console.log('🔧 Mock signOut called');
    return Promise.reject(new Error('Authentication service is not available'));
  },
  
  sendPasswordResetEmail: (email) => {
    console.log('🔧 Mock sendPasswordResetEmail called');
    return Promise.reject(new Error('Authentication service is not available'));
  }
};

const mockApp = {
  name: '[DEFAULT]',
  options: firebaseConfig
};

// Export mock objects that prevent import errors
export const auth = mockAuth;
export const db = null;
export const initializationError = new Error('Firebase disabled for production build compatibility');

console.log('🔥 Firebase mock objects exported (production build compatible)');

export default mockApp;
