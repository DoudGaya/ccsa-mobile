import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔥 AuthProvider initializing...');
    
    if (!auth) {
      console.error('🔥 Firebase auth is not initialized');
      setError('Firebase authentication service is not available');
      setLoading(false);
      return;
    }

    console.log('🔥 Setting up auth state listener...');
    console.log('🔥 Auth object type:', typeof auth);
    console.log('🔥 Auth methods available:', {
      onAuthStateChanged: typeof auth.onAuthStateChanged,
      signInWithEmailAndPassword: typeof auth.signInWithEmailAndPassword,
      currentUser: auth.currentUser
    });
    
    // Use auth methods from our Firebase service
    const unsubscribe = auth.onAuthStateChanged(
      (firebaseUser) => {
        try {
          console.log('🔥 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
          
          if (firebaseUser) {
            // Convert Firebase user to our user format
            const userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified,
              createdAt: firebaseUser.metadata?.creationTime,
              lastSignInTime: firebaseUser.metadata?.lastSignInTime,
            };
            
            setUser(userData);
            console.log('🔥 User data set:', userData);
          } else {
            setUser(null);
            console.log('🔥 User cleared');
          }
        } catch (error) {
          console.error('🔥 Error in auth state change:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('🔥 Auth state change error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      console.log('🔥 Cleaning up auth listener...');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!auth || !auth.signInWithEmailAndPassword) {
        throw new Error('Firebase auth is not initialized');
      }

      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
        createdAt: firebaseUser.metadata?.creationTime,
        lastSignInTime: firebaseUser.metadata?.lastSignInTime,
      };
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('🔥 Sign in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, additionalData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!auth || !auth.createUserWithEmailAndPassword) {
        throw new Error('Firebase auth is not initialized');
      }

      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;

      // Update profile if displayName provided
      if (additionalData.displayName && auth.updateProfile) {
        try {
          await auth.updateProfile(firebaseUser, {
            displayName: additionalData.displayName
          });
        } catch (profileError) {
          console.warn('🔥 Profile update failed:', profileError);
        }
      }

      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || additionalData.displayName,
        emailVerified: firebaseUser.emailVerified,
        createdAt: firebaseUser.metadata?.creationTime,
        lastSignInTime: firebaseUser.metadata?.lastSignInTime,
        ...additionalData
      };
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('🔥 Sign up error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('🔥 Sign out error:', error);
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      
      if (!auth || !auth.sendPasswordResetEmail) {
        throw new Error('Firebase auth is not initialized');
      }

      await auth.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('🔥 Password reset error:', error);
      setError(error.message);
      throw error;
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!auth || !auth.updateProfile || !user) {
        throw new Error('Firebase auth is not initialized or user not logged in');
      }

      await auth.updateProfile(auth.currentUser, profileData);
      
      // Update local user state
      setUser(prevUser => ({
        ...prevUser,
        ...profileData
      }));
    } catch (error) {
      console.error('🔥 Profile update error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserPassword = async (newPassword, currentPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!auth || !auth.updatePassword || !auth.reauthenticateWithCredential || !user) {
        throw new Error('Firebase auth is not initialized or user not logged in');
      }

      // Re-authenticate user first
      const credential = auth.EmailAuthProvider?.credential(user.email, currentPassword);
      if (credential) {
        await auth.reauthenticateWithCredential(auth.currentUser, credential);
      }
      
      await auth.updatePassword(auth.currentUser, newPassword);
    } catch (error) {
      console.error('🔥 Password update error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
