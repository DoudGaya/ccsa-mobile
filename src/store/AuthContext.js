import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if auth is properly initialized
    if (!auth) {
      console.error('Firebase auth is not initialized');
      setLoading(false);
      return;
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to our user format
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          createdAt: firebaseUser.metadata.creationTime,
          lastSignInTime: firebaseUser.metadata.lastSignInTime,
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
        createdAt: firebaseUser.metadata.creationTime,
        lastSignInTime: firebaseUser.metadata.lastSignInTime,
      };
      
      setUser(userData);
      return { user: userData };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with display name if provided
      if (userData.displayName) {
        await updateProfile(firebaseUser, {
          displayName: userData.displayName,
        });
      }
      
      const user = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: userData.displayName || firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
        createdAt: firebaseUser.metadata.creationTime,
        lastSignInTime: firebaseUser.metadata.lastSignInTime,
      };
      
      setUser(user);
      return { user };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!auth || !auth.currentUser) {
        throw new Error('User is not authenticated');
      }
      
      setLoading(true);
      
      // Re-authenticate the user with their current password
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update the password
      await updatePassword(user, newPassword);
      
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
