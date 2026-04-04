import { useState, useEffect } from 'react';
import WebSocketManager from '../utils/WebSocketManager';

/**
 * useWebSocketStatus Hook
 * Returns the current connection status of the global WebSocket instance
 */
export const useWebSocketStatus = () => {
    const [status, setStatus] = useState(WebSocketManager.status);

    useEffect(() => {
        return WebSocketManager.addStatusListener(newStatus => {
            setStatus(newStatus);
        });
    }, []);

    return status;
};

/**
 * useWebSocketSubscription Hook
 * Handles safe subscription/unsubscription inside components
 */
export const useWebSocketSubscription = (topic, callback) => {
    useEffect(() => {
        if (!topic) return;
        return WebSocketManager.subscribe(topic, callback);
    }, [topic, callback]);
};
