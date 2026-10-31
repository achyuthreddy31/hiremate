import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper to wait until Firebase restores the auth session
const getCurrentUserToken = () => {
  return new Promise((resolve) => {
    // If the session is already active, return the token immediately
    if (auth.currentUser) {
      auth.currentUser.getIdToken().then(resolve).catch(() => resolve(null));
      return;
    }

    // Otherwise, wait for Firebase to restore state from IndexedDB
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user) {
        try {
          const token = await user.getIdToken();
          resolve(token);
        } catch {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

// Interceptor to attach Firebase ID Token to every outgoing request
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getCurrentUserToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('Error obtaining auth token:', err);
  }
  return config;
});