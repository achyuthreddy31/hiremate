import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Firebase ID Token to every outgoing request
apiClient.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Check localStorage for offline / mock user token
      const mockUid = localStorage.getItem('hiremate_mock_uid');
      if (mockUid) {
        config.headers.Authorization = `Bearer mock-uid-${mockUid}`;
      }
    }
  } catch (err) {
    console.warn('Error obtaining auth token:', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);
