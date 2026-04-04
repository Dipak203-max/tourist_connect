import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

import requestManager from './requestManager';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Custom wrapper to handle deduplication
const originalGet = axiosInstance.get;
axiosInstance.get = (url, config = {}) => {
    return requestManager.addRequest(
        { ...config, method: 'get', url },
        () => originalGet.call(axiosInstance, url, config)
    );
};

// Request interceptor: Attach token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Global error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Log backend errors (400, 401, 403, 500)
            console.error(`API Error [${error.response.status}]:`, error.response.data);

            if (error.response.status === 401 && !error.config.url.includes('/auth/login')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } else if (error.request) {
            // Network errors (server down, no internet)
            console.error("Network Error: No response received", error.request);
        } else {
            console.error("Request Configuration Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
