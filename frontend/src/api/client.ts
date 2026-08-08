import axios, { AxiosError } from 'axios';

// Member 3 backend URL default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Support HttpOnly cookie auth
});

// Request Interceptor: Attach Auth Bearer token if present in session storage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('relay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Standardized Error Handling Matrix
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: any }>) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;

    switch (status) {
      case 401:
        // Unauthorized: session expired
        console.warn('[API Client 401] Session expired. Redirecting to login.');
        localStorage.removeItem('relay_token');
        break;
      case 403:
        console.warn('[API Client 403] Unauthorized access attempt.');
        break;
      case 404:
        console.warn('[API Client 404] Resource not found:', errorMessage);
        break;
      case 409:
        console.warn('[API Client 409] Business conflict (e.g. inventory unavailable):', errorMessage);
        break;
      case 422:
        console.warn('[API Client 422] Validation error:', errorMessage);
        break;
      case 429:
        console.warn('[API Client 429] Rate limit hit. Please retry shortly.');
        break;
      case 500:
        console.error('[API Client 500] Server error:', errorMessage);
        break;
    }

    return Promise.reject({
      status: status || 500,
      message: errorMessage,
      details: error.response?.data?.errors,
    });
  }
);
