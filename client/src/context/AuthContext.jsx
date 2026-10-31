import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    if (import.meta.env.DEV) {
      const mockUid = localStorage.getItem('hiremate_mock_uid');
      if (mockUid && !currentUser) {
        setCurrentUser({
          uid: mockUid,
          email: `${mockUid}@hiremate.ai`,
          displayName: 'Test Candidate'
        });
        setLoading(false);
        return;
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res.user;
    } catch (err) {
      // In local dev without live Firebase keys, allow mock demo login
      if (email && password) {
        const mockUid = email.split('@')[0] || 'demo_user';
        localStorage.setItem('hiremate_mock_uid', mockUid);
        const user = { uid: mockUid, email, displayName: mockUid };
        setCurrentUser(user);
        return user;
      }
      throw err;
    }
  };

  const register = async (email, password) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      return res.user;
    } catch (err) {
      // Demo mock fallback
      const mockUid = email.split('@')[0] || 'demo_user';
      localStorage.setItem('hiremate_mock_uid', mockUid);
      const user = { uid: mockUid, email, displayName: mockUid };
      setCurrentUser(user);
      return user;
    }
  };

  const logout = async () => {
    localStorage.removeItem('hiremate_mock_uid');
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
