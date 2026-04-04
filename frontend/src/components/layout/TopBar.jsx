import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import { useDebounce } from 'react-use';
import { 
    LogOut, 
    Bell, 
    Search,
    ChevronDown,
    Moon,
    Sun
} from 'lucide-react';
import { cn } from '../ui/BaseComponents';

const TopBar = () => {
    const { user, logout } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Debounced search logic could go here to trigger API calls
    useDebounce(
        () => {
            if (searchTerm) {
                console.log('Searching for:', searchTerm);
            }
        },
        500,
        [searchTerm]
    );

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className="h-20 glass-card sticky top-0 z-40 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-8 transition-all duration-300">
            {/* Search Bar */}
            <div className="flex items-center gap-8 flex-1">
                <div className="relative group w-full max-w-md hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for bookings, users, or guides..."
                        className="w-full bg-surface-50 dark:bg-surface-800/50 border border-transparent rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:bg-surface-50 dark:focus:bg-surface-900 dark:focus:bg-surface-800 focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all"
                    />
                </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button 
                    onClick={toggleDarkMode}
                    className="p-2.5 text-surface-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all active:scale-95"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className="relative p-2.5 text-surface-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all active:scale-95">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-900 animate-pulse" />
                </button>
                
                <div className="h-6 w-px bg-surface-200 dark:bg-surface-800 mx-2"></div>

                {/* User Profile Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className={cn(
                            "flex items-center gap-3 p-1.5 pl-3 rounded-xl border border-transparent transition-all active:scale-95",
                            isUserMenuOpen ? "bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700" : "hover:bg-surface-50 dark:hover:bg-surface-800"
                        )}
                    >
                        <div className="flex flex-col items-end text-right hidden lg:flex">
                            <span className="text-sm font-bold text-surface-900 dark:text-surface-100 leading-none capitalize">
                                {user?.fullName || user?.email?.split('@')[0]}
                            </span>
                            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mt-1">
                                {user?.role}
                            </span>
                        </div>
                        
                        <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center text-primary-700 dark:text-primary-300 font-black shadow-sm">
                            {(user?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-surface-400 transition-transform", isUserMenuOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isUserMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-56 glass-card rounded-2xl border border-surface-200 dark:border-surface-800 shadow-2xl z-20 overflow-hidden"
                                >
                                    <div className="p-2 space-y-1">
                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 rounded-lg transition-colors">
                                            <span className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                                <UserCircle className="w-4 h-4" />
                                            </span>
                                            My Profile
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 rounded-lg transition-colors">
                                            <span className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                                <Settings className="w-4 h-4" />
                                            </span>
                                            Settings
                                        </button>
                                        <hr className="my-2 border-surface-100 dark:border-surface-800" />
                                        <button 
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                        >
                                            <span className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                                <LogOut className="w-4 h-4" />
                                            </span>
                                            Logout
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// Simple icon placeholders for missing imports if any
const UserCircle = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const Settings = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default TopBar;
