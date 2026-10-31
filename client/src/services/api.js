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
      // Only allow mock UID fallback in local development
  if (import.meta.env.DEV) {
    const mockUid = localStorage.getItem('hiremate_mock_uid');
    if (mockUid) {
      config.headers.Authorization = `Bearer mock-uid-${mockUid}`;
    }
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
    // If rate-limited (429), return standardized single clear message
    if (error.response?.status === 429) {
      const rateLimitMsg = error.response?.data?.error?.message || 'Too many requests. Please try again later.';
      return Promise.reject(new Error(rateLimitMsg));
    }
    const message = error.response?.data?.error?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// Cache of active in-flight GET requests to eliminate duplicate simultaneous fetches
const inFlightGetRequests = new Map();

const rawGet = apiClient.get.bind(apiClient);
apiClient.get = function (url, config) {
  // Deduplicate concurrent GET requests for application metadata and resources
  const isAppResource = typeof url === 'string' && (url.startsWith('/applications/') || url.startsWith('/company/'));
  if (isAppResource && !config?.params) {
    if (inFlightGetRequests.has(url)) {
      return inFlightGetRequests.get(url);
    }
    const reqPromise = rawGet(url, config).finally(() => {
      // Clear from in-flight cache shortly after completion to allow fresh data on deliberate re-fetch
      setTimeout(() => inFlightGetRequests.delete(url), 300);
    });
    inFlightGetRequests.set(url, reqPromise);
    return reqPromise;
  }
  return rawGet(url, config);
};
