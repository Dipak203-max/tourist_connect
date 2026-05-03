import { useEffect, useRef } from 'react';
import { useRealTimeContext } from '../context/RealTimeContext';


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


export const useRealTimeStatus = () => {
    const { status } = useRealTimeContext();
    return status;
};


export const useLastEvent = () => {
    const { lastEvent } = useRealTimeContext();
    return lastEvent;
};
