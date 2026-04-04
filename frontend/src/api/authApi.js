import axiosInstance from './axiosInstance';

export const login = (data) => axiosInstance.post('/auth/login', data);
export const register = (data) => axiosInstance.post('/auth/register', data);
export const registerPhone = (data) => axiosInstance.post('/auth/register-phone', data);
export const verifyPhoneOtp = (data) => axiosInstance.post('/auth/verify-phone-otp', data);
export const verifyOtp = (data) => axiosInstance.post('/auth/verify-otp', data);
export const googleLogin = (data) => axiosInstance.post('/auth/google-login', data);
export const forgotPassword = (data) => axiosInstance.post('/auth/forgot-password', data);
export const resetPassword = (data) => axiosInstance.post('/auth/reset-password', data);
