import { useEffect, useRef } from 'react';
import { useRealTimeContext } from '../context/RealTimeContext';

/**
 * useRealTime
 * Declarative hook for subscribing to logical real-time events.
 * 
 * @param {string} eventType - e.g., 'NOTIFICATION_RECEIVED', 'MESSAGE_RECEIVED', 'FRIEND_ACCEPTED'
 * @param {function} handler - (payload, fullEvent) => void
 * @example
 * useRealTime('FRIEND_ACCEPTED', (payload) => {
 *   toast.success(`${payload.senderName} accepted your request!`);
 * });
 */
export const useRealTime = (eventType, handler) => {
    const { subscribe } = useRealTimeContext();
    const handlerRef = useRef(handler);

    // Keep the handler ref up to date to avoid stale closures
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!eventType || !handler) return;

        // Wrapped handler to use the latest ref
        const wrappedHandler = (payload, event) => {
            if (handlerRef.current) {
                handlerRef.current(payload, event);
            }
        };

        // Standardized event subscription via the global context
        const unsubscribe = subscribe(eventType, wrappedHandler);
        
        return () => {
            unsubscribe();
        };
    }, [eventType, subscribe]);
};

/**
 * useRealTimeStatus
 * Hook to access the current WebSocket connection status.
 * @returns {"DISCONNECTED" | "CONNECTING" | "CONNECTED" | "RETRYING" | "FAILED"}
 */
export const useRealTimeStatus = () => {
    const { status } = useRealTimeContext();
    return status;
};

/**
 * useLastEvent
 * Hook to access the very last event received by the system.
 */
export const useLastEvent = () => {
    const { lastEvent } = useRealTimeContext();
    return lastEvent;
};
