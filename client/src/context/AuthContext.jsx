import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchUser = async () => {
        try {
            setLoading(true);
            // Backend uses Cookies, so we just call /auth/me and the cookie is sent automatically by the browser/proxy
            const { data } = await api.get('/auth/me');
            setUser(data.user);
            setError(null);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setUser(null); // Not authenticated
            } else {
                setError('Failed to fetch user session');
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            const { data } = await api.post('/auth/login', { email, password });
            setUser(data.user);

            // Navigate based on role
            if (data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            setError(msg);
            return { success: false, message: msg };
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const { data } = await api.post('/auth/register', userData);
            setUser(data.user);

            // Navigate based on role
            if (data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            setError(msg);
            return { success: false, message: msg };
        }
    }

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            navigate('/login');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser: fetchUser // Helper to manually refresh
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
