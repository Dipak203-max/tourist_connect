import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import wsManager from '../utils/WebSocketManager';
import { useAuth } from '../hooks/useAuth';

const RealTimeContext = createContext(null);

/**
 * RealTimeProvider
 * Global provider for centralized real-time events.
 * Handles WebSocket lifecycle and event-bus distribution.
 */
export const RealTimeProvider = ({ children }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState('DISCONNECTED');
    const [lastEvent, setLastEvent] = useState(null);
    
    // Internal event bus listeners: eventType -> Set(callback)
    const listeners = useRef(new Map());

    // Subscribe to WebSocket status changes
    useEffect(() => {
        const cleanup = wsManager.addStatusListener(setStatus);
        return cleanup;
    }, []);

    // Connect/Disconnect based on auth state
    useEffect(() => {
        if (user) {
            wsManager.connect().catch(err => {
                console.error("[RealTime] Initial connection failed:", err);
            });
            
            // Subscribe to primary user queues
            const unsubs = [
                wsManager.subscribe('/user/queue/notifications', (event) => handleIncomingEvent(event)),
                wsManager.subscribe('/user/queue/messages', (event) => handleIncomingEvent(event))
            ];

            return () => {
                unsubs.forEach(unsub => unsub());
            };
        } else {
            wsManager.disconnect();
        }
    }, [user]);

    const handleIncomingEvent = (event) => {
        setLastEvent(event);
        
        // Notify logical event listeners
        const typeListeners = listeners.current.get(event.type);
        if (typeListeners) {
            typeListeners.forEach(callback => callback(event.payload, event));
        }

        // Also notify wildcard/global listeners if any
        const globalListeners = listeners.current.get('*');
        if (globalListeners) {
            globalListeners.forEach(callback => callback(event.payload, event));
        }
    };

    /**
     * Subscribe to a specific logical event type
     * @param {string} eventType - e.g., 'NOTIFICATION_RECEIVED', 'FRIEND_ACCEPTED'
     * @param {function} callback - (payload, fullEvent) => void
     */
    const subscribe = useCallback((eventType, callback) => {
        if (!listeners.current.has(eventType)) {
            listeners.current.set(eventType, new Set());
        }
        listeners.current.get(eventType).add(callback);
        
        return () => {
            const set = listeners.current.get(eventType);
            if (set) {
                set.delete(callback);
                if (set.size === 0) listeners.current.delete(eventType);
            }
        };
    }, []);

    const value = {
        status,
        lastEvent,
        subscribe,
        wsManager // Expose if direct sending is needed
    };

    return (
        <RealTimeContext.Provider value={value}>
            {children}
        </RealTimeContext.Provider>
    );
};

export const useRealTimeContext = () => {
    const context = useContext(RealTimeContext);
    if (!context) {
        throw new Error("useRealTimeContext must be used within a RealTimeProvider");
    }
    return context;
};
