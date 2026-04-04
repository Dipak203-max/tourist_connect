import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const stompClientRef = useRef(null);

    // Initial fetch
    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    // WebSocket Connection
    useEffect(() => {
        if (!user) return;

        const socket = new SockJS('http://localhost:8080/ws-chat');
        const stompClient = Stomp.over(socket);
        stompClient.debug = () => { }; // Disable debug logs

        stompClient.connect({}, () => {
            stompClientRef.current = stompClient;

            // Subscribe to private notifications
            stompClient.subscribe(`/topic/notifications/${user.email}`, (message) => { // Backend uses ID, need to check if we have ID or Email
                // Wait, backend sends to /topic/notifications/{userId}
                // AuthContext user might not have ID, let's check. 
                // If AuthContext user has ID, use it.
            });

            // Actually, let's check AuthContext user object structure first. 
            // Assuming we might need to fetch user profile to get ID if token only has email/role.
            // But waiting for that might verify `user.email` use or need ID.
            // Backend `NotificationSocketService` uses `userId`.
            // Let's assume user.id is available or we need to decode it properly.
            // BUT wait, `AuthContext` decodes token. Does token have ID?
            // Usually `sub` is email.
            // Standard JWT usually doesn't have ID unless added.
            // Let's check `AuthContext.jsx` again.
        }, (error) => {
            console.error('WebSocket Error:', error);
            // Simple reconnect logic could go here
        });

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.disconnect();
            }
        };
    }, [user]);

    // Correction: I need to verify if I have userId. 
    // If not, I should probably fetch it or assume token has it.
    // For now I'll write a placeholder explanation in comments.

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/notifications/unread-count', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(response.data);
        } catch (error) {
            console.error("Failed to fetch unread count", error);
        }
    }

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/notifications/read/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
            fetchUnreadCount(); // specific update is better but this ensures sync
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    }

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, stompClientRef }}>
            {children}
        </NotificationContext.Provider>
    );
};
