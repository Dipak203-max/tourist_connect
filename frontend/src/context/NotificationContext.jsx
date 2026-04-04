import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axiosInstance from '../api/axiosConfig';
import wsManager from '../utils/WebSocketManager';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const sortNotifications = (notifs) => {
        return notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    // Initial fetch
    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user?.id]); // Use user.id for stability

    // WebSocket Connection
    useEffect(() => {
        if (!user || !user.userId) return;

        const unsubscribe = wsManager.subscribe(`/topic/notifications/${user.userId}`, (message) => {
            try {
                const newNotification = JSON.parse(message.body);
                
                setNotifications(prev => {
                    const isDuplicate = prev.some(n => n.id === newNotification.id);
                    if (isDuplicate) return prev;
                    return sortNotifications([newNotification, ...prev]);
                });
                setUnreadCount(prev => prev + 1);

                // Show Toast
                toast.success(newNotification.message || "New notification received", {
                    icon: '🔔',
                    style: {
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        fontSize: '14px',
                        fontWeight: '600'
                    }
                });
            } catch (e) {
                console.error("Error parsing notification", e);
            }
        });

        return () => unsubscribe();
    }, [user?.userId]);

    const fetchNotifications = async () => {
        try {
            const response = await axiosInstance.get('/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await axiosInstance.get('/notifications/unread-count');
            setUnreadCount(response.data);
        } catch (error) {
            console.error("Failed to fetch unread count", error);
        }
    }

    const markAsRead = async (id, redirectUrl) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));

            // Only decrement if it was unread
            const notif = notifications.find(n => n.id === id);
            if (notif && !notif.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            await axiosInstance.put(`/notifications/read/${id}`);

            if (redirectUrl) {
                navigate(redirectUrl);
            }
        } catch (error) {
            console.error("Failed to mark as read", error);
            fetchNotifications(); // Revert on error
            fetchUnreadCount();
        }
    };

    const markAllAsRead = async () => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);

            await axiosInstance.put(`/notifications/read-all`);
        } catch (error) {
            console.error("Failed to mark all as read", error);
            fetchNotifications();
            fetchUnreadCount();
        }
    }

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
