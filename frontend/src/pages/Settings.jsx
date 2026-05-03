import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Settings as SettingsIcon, 
    Lock, 
    Shield, 
    KeyRound,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { Card, Button, Input } from '../components/ui/BaseComponents';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const toggleVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwords.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post('/users/change-password', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            toast.success("Password updated successfully");
            setPasswords({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error(error.response?.data || "Failed to update password. Check your current password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-surface-900 dark:text-white tracking-tight flex items-center gap-3">
                    <SettingsIcon className="w-10 h-10 text-primary-600" />
                    Settings
                </h1>
                <p className="text-surface-500 dark:text-surface-400 mt-2">
                    Manage your account security and preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Navigation Sidebar (For future tabs) */}
                <Card className="lg:col-span-1 h-fit p-2">
                    <nav className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold transition-all">
                            <Shield className="w-5 h-5" />
                            Security
                        </button>
                    </nav>
                </Card>

                {/* Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-surface-900 dark:text-white">Change Password</h2>
                                <p className="text-sm text-surface-500">Update your account credentials</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-surface-700 dark:text-surface-300 ml-1">Current Password</label>
                                <div className="relative">
                                    <Input
                                        type={showPasswords.old ? "text" : "password"}
                                        name="oldPassword"
                                        value={passwords.oldPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="pr-12 h-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleVisibility('old')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                    >
                                        {showPasswords.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-surface-700 dark:text-surface-300 ml-1">New Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showPasswords.new ? "text" : "password"}
                                            name="newPassword"
                                            value={passwords.newPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            className="pr-12 h-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleVisibility('new')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-surface-700 dark:text-surface-300 ml-1">Confirm New Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwords.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            className="pr-12 h-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleVisibility('confirm')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="bg-surface-100 dark:bg-surface-800/50 p-4 rounded-2xl border border-surface-200 dark:border-surface-700">
                                <h3 className="text-xs font-black uppercase tracking-widest text-surface-500 mb-3 flex items-center gap-2">
                                    <KeyRound className="w-3 h-3" />
                                    Requirements
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                                    <RequirementItem met={passwords.newPassword.length >= 8} text="At least 8 characters" />
                                    <RequirementItem met={/[A-Z]/.test(passwords.newPassword)} text="One uppercase letter" />
                                    <RequirementItem met={/[a-z]/.test(passwords.newPassword)} text="One lowercase letter" />
                                    <RequirementItem met={/[0-9]/.test(passwords.newPassword)} text="One number" />
                                    <RequirementItem met={/[@#$%^&+=!]/.test(passwords.newPassword)} text="One special character" />
                                    <RequirementItem met={passwords.newPassword && passwords.newPassword === passwords.confirmPassword} text="Passwords match" />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary-500/20"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Updating...
                                    </div>
                                ) : "Update Password"}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const RequirementItem = ({ met, text }) => (
    <div className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-emerald-600 dark:text-emerald-400' : 'text-surface-400'}`}>
        {met ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5 opacity-50" />}
        {text}
    </div>
);

export default Settings;
