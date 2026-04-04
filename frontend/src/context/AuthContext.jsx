import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authApi from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser({ email: decoded.sub, role: decoded.role, userId: decoded.userId });
                }
            } catch {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await authApi.login({ email, password });
        const { token, role } = response.data;
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser({ email, role, userId: decoded.userId });
        return role;
    };

    const register = async (email, password, role) => {
        return await authApi.register({ email, password, role });
    };

    const registerPhone = async (phoneNumber) => {
        return await authApi.registerPhone({ phoneNumber });
    };

    const verifyPhoneOtp = async (phoneNumber, otp) => {
        return await authApi.verifyPhoneOtp({ phoneNumber, otp });
    };

    const verifyOtp = async (email, otp) => {
        return await authApi.verifyOtp({ email, otp });
    };

    const googleLogin = async (idToken) => {
        const response = await authApi.googleLogin({ idToken });
        const { token, role } = response.data;
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser({ ...decoded, email: decoded.sub, userId: decoded.userId }); // Ensure unified structure
        return role;
    };

    const forgotPassword = async (email) => {
        return await authApi.forgotPassword({ email });
    };

    const resetPassword = async (token, newPassword) => {
        return await authApi.resetPassword({ token, newPassword });
    };

    const updateUser = (updates) => {
        setUser(prev => {
            const newUser = { ...prev, ...updates };
            if (newUser.userId && !newUser.id) newUser.id = newUser.userId;
            return newUser;
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user: user ? { ...user, id: user.userId } : null,
        loading,
        login,
        register,
        verifyOtp,
        logout,
        registerPhone,
        verifyPhoneOtp,
        googleLogin,
        forgotPassword,
        resetPassword,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
