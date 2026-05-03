import { useState, useEffect } from 'react';
import WebSocketManager from '../utils/WebSocketManager';


export const useWebSocketStatus = () => {
    const [status, setStatus] = useState(WebSocketManager.status);

    useEffect(() => {
        return WebSocketManager.addStatusListener(newStatus => {
            setStatus(newStatus);
        });
    }, []);

    return status;
};


export const useWebSocketSubscription = (topic, callback) => {
    useEffect(() => {
        if (!topic) return;
        return WebSocketManager.subscribe(topic, callback);
    }, [topic, callback]);
};
