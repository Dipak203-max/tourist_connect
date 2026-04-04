import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * useAuth Hook
 * Centralized hook to access authentication state.
 * Refers to AuthContext to ensure single-source-of-truth.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
