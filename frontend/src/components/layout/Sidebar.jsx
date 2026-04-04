import React, { useContext, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useFavorites } from '../../context/FavoritesContext';
import { cn } from '../ui/BaseComponents';
import {
    LayoutDashboard,
    ShieldCheck,
    MessageSquare,
    Bell,
    Users,
    BookOpen,
    Flag,
    ClipboardList,
    MapPin,
    Map,
    Heart,
    Banknote,
    Sparkles,
    UserCircle,
    ChevronLeft,
    Menu,
    Compass
} from 'lucide-react';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const { unreadCount, totalChatUnread } = useChat();
    const { favoriteCount } = useFavorites();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    
    const role = user?.role;

    const menus = {
        ADMIN: [
            { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
            { name: 'Financials', path: '/admin/payments', icon: Banknote },
            { name: 'Bookings', path: '/admin/bookings', icon: ClipboardList },
            { name: 'Destinations', path: '/admin/destinations', icon: MapPin },
            { name: 'Verifications', path: '/admin/verify-guides', icon: ShieldCheck },
            { name: 'Users', path: '/admin/users', icon: Users },
            { name: 'Reports', path: '/admin/reports', icon: Flag },
        ],
        GUIDE: [
            { name: 'Dashboard', path: '/guide', icon: LayoutDashboard },
            { name: 'Verification', path: '/guide/verification', icon: ShieldCheck },
            { name: 'Profile', path: '/guide/profile', icon: UserCircle },
            { name: 'Groups', path: '/guide/groups', icon: Users },
            { name: 'Chat', path: '/chat', icon: MessageSquare },
            { name: 'Notifications', path: '/notifications', icon: Bell },
            { name: 'Bookings', path: '/guide/bookings', icon: ClipboardList },
            { name: 'Earnings', path: '/guide/reports', icon: Banknote },
        ],
        TOURIST: [
            { name: 'Dashboard', path: '/tourist', icon: LayoutDashboard },
            { name: 'My Profile', path: '/profile', icon: UserCircle },
            { name: 'Stories', path: '/stories', icon: BookOpen },
            { name: 'Chat', path: '/chat', icon: MessageSquare },
            { name: 'Notifications', path: '/notifications', icon: Bell },
            { name: 'Groups', path: '/groups', icon: Users },
            { name: 'Find Guide', path: '/find-guides', icon: Map },
            { name: 'Itineraries', path: '/itineraries', icon: ClipboardList },
            { name: 'AI Advice', path: '/tourist/ai-suggestions', icon: Sparkles },
            { name: 'Favorites', path: '/my-favorites', icon: Heart },
            { name: 'Bookings', path: '/tourist/bookings', icon: ClipboardList },
        ]
    };

    const currentMenu = menus[role] || [];

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    return (
        <motion.div 
            animate={{ width: isCollapsed ? 80 : 280 }}
            className={cn(
                "relative h-screen bg-surface-50 dark:bg-surface-900 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 flex flex-col transition-colors duration-300 z-50",
                isCollapsed ? "items-center" : ""
            )}
        >
            {/* Toggle Button */}
            <button 
                onClick={toggleSidebar}
                className="absolute -right-3 top-10 bg-surface-50 dark:bg-surface-900 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full p-1 shadow-premium hover:shadow-premium-hover transition-all z-10"
            >
                <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }}>
                    <ChevronLeft className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                </motion.div>
            </button>

            {/* Logo */}
            <div className={cn("p-6 mb-4 flex items-center transition-all", isCollapsed ? "justify-center" : "gap-4")}>
                <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 dark:shadow-none shrink-0">
                    <Compass className="w-6 h-6 text-white" />
                </div>
                {!isCollapsed && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        <span className="text-xl font-black text-surface-900 dark:text-white tracking-tighter leading-none">Connect</span>
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mt-1">Tourist Platform</span>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-none">
                {currentMenu.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={cn(
                                "group relative flex items-center h-12 rounded-xl transition-all duration-300 overflow-hidden",
                                isActive ? "text-primary-600 dark:text-primary-400" : "text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800",
                                isCollapsed ? "justify-center" : "px-4 gap-4"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive && "text-primary-600 dark:text-primary-400")} />
                            
                            {!isCollapsed && (
                                <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm font-semibold tracking-tight whitespace-nowrap"
                                >
                                    {item.name}
                                </motion.span>
                            )}

                            {/* Active Indicator */}
                            {isActive && (
                                <motion.div 
                                    layoutId="active-pill"
                                    className="absolute left-0 w-1 h-6 bg-primary-600 dark:bg-primary-400 rounded-r-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            {/* Badge for Collapsed State */}
                            {isCollapsed && (item.name === 'Notifications' && unreadCount > 0 || item.name === 'Chat' && totalChatUnread > 0) && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-900" />
                            )}

                            {/* Badges for Expanded State */}
                            {!isCollapsed && (
                                <div className="ml-auto">
                                    {item.name === 'Notifications' && unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                                            {unreadCount}
                                        </span>
                                    )}
                                    {item.name === 'Chat' && totalChatUnread > 0 && (
                                        <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                                            {totalChatUnread}
                                        </span>
                                    )}
                                    {item.name === 'Favorites' && favoriteCount > 0 && (
                                        <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                                            {favoriteCount}
                                        </span>
                                    )}
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className={cn("p-4 mt-auto border-t border-surface-100 dark:border-surface-800", isCollapsed ? "text-center" : "p-6")}>
                {!isCollapsed ? (
                    <div className="bg-surface-50 dark:bg-surface-800/50 rounded-2xl p-4 border border-surface-100 dark:border-surface-700/50">
                        <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest text-center">
                            v3.0.0 Premium
                        </p>
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto">
                        <span className="text-[8px] font-bold text-surface-400">v3</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Sidebar;
