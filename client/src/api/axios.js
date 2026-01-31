import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy to backend API
    withCredentials: true, // Essential for handling cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor to handle 401 (Unauthorized)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // If 401, it means token is expired or missing.
            // We should redirect to login, but we need to avoid loops.
            // We'll let the AuthContext handle the redirect if user is supposedly logged in.
            console.warn("Unauthorized access - Session might be expired");
        }
        return Promise.reject(error);
    }
);

export default api;
