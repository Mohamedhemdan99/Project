import axios from 'axios';
import { toast } from "sonner";
import { authService } from './authService';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = "https://bewtihme-001-site1.jtempurl.com";
// const API_BASE_URL = "https://localhost:1190";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// const location = useLocation();

// Add authorization header for authenticated requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || '';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
  

  // Check Unauthorized and Redrirect to login page
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        // Handle unauthorized error
        toast.error('You are not authorized to access this resource.');
        // Clear user state and redirect on 401 errors
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        authService.logout();
        // Redirect to login page or any other appropriate path
        window.location.href = location.pathname === '/login' ? '' : '/login';
  
      }
      return Promise.reject(error);
    }
  );

export default api;