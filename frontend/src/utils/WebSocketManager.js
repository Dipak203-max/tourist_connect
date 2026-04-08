import SockJS from 'sockjs-client';
import Stomp from 'stompjs';


class WebSocketManager {
    constructor() {
        this.stompClient = null;
        this.status = 'DISCONNECTED'; 
        this.statusListeners = new Set();
        
        this.subscriptions = new Map(); 
        this.activeSubscriptions = new Map(); 
        
        this.messageQueue = [];
        this.connectionPromise = null;
        
        // Configuration
       this.baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    'https://touristconnect-production.up.railway.app/api';

this.socketUrl = this.baseUrl.replace('/api', '') + '/ws-chat';
        
        // Retry logic
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.baseReconnectDelay = 2000;
        this.reconnectTimeoutId = null;
        
        this.debug = false; 
    }

    /**
     * Subscribe to connection status changes
     */
    addStatusListener(listener) {
        this.statusListeners.add(listener);
        listener(this.status);
        return () => this.statusListeners.delete(listener);
    }

    _updateStatus(newStatus) {
        if (this.status === newStatus) return;
        this.status = newStatus;
        if (this.debug) console.log(`[WS] Status changed to: ${newStatus}`);
        this.statusListeners.forEach(listener => listener(newStatus));
    }

    /**
     * Initializes connection
     */
    async connect() {
        if (this.status === 'CONNECTED') return Promise.resolve(this.stompClient);
        if (this.status === 'CONNECTING') return this.connectionPromise;

        this._updateStatus('CONNECTING');
        
        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                const socket = new SockJS(this.socketUrl);
                const client = Stomp.over(socket);
                
                // Disable Stomp internal debug logging to keep console clean
                client.debug = null;

                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                client.connect(headers, (frame) => {
                    this.stompClient = client;
                    this._updateStatus('CONNECTED');
                    this.connectionPromise = null;
                    this.reconnectAttempts = 0;
                    
                    if (this.debug) console.log("[WS] STOMP Connection Established");

                    // 1. Restore subscriptions
                    this.subscriptions.forEach((_, topic) => {
                        this._stompSubscribe(topic);
                    });

                    // 2. Process queued messages
                    this._flushMessageQueue();

                    resolve(client);
                }, (error) => {
                    this._handleConnectionError(error);
                    reject(error);
                });
            } catch (err) {
                this._handleConnectionError(err);
                reject(err);
            }
        });

        return this.connectionPromise;
    }

    _handleConnectionError(error) {
        this.stompClient = null;
        this.connectionPromise = null;
        this.activeSubscriptions.clear();

        if (this.status === 'CONNECTED' || this.status === 'CONNECTING') {
            this._updateStatus('DISCONNECTED');
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this._updateStatus('RETRYING');
            
            // Exponential backoff: 2s, 4s, 8s, 16s, 32s
            const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            
            if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = setTimeout(() => {
                if (this.debug) console.log(`[WS] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                this.connect().catch(() => {}); 
            }, delay);
        } else {
            console.warn("[WS] Maximum reconnection attempts reached. Stability mode active (System works without live updates).");
            this._updateStatus('FAILED');
        }
    }


    _dispatchNormalizedEvent(topic, message) {
        try {
            if (!message || message.body === undefined || message.body === null) {
                if (this.debug) console.warn(`[WS] Received message with empty body on topic: ${topic}`);
                return;
            }

            let payload;
            try {
                payload = JSON.parse(message.body);
            } catch (parseErr) {
                if (this.debug) console.warn(`[WS] Failed to parse message body as JSON:`, message.body);
                // Fallback to raw string if it's not valid JSON
                payload = message.body;
            }
            
            // Map STOMP topics to logical event types
            const eventType = (payload && payload.type) || this._inferEventType(topic, payload);
            
            const event = {
                type: eventType,
                payload: (payload && payload.data) !== undefined ? payload.data : payload,
                timestamp: Date.now(),
                topic: topic,
                raw: message
            };

            if (this.debug) console.log(`[WS] Normalized Event: ${event.type}`, event.payload);

            // Notify logical event listeners
            this.subscriptions.get(topic)?.forEach(callback => {
                try {
                    callback(event);
                } catch (callbackErr) {
                    console.error(`[WS] Error in subscription callback for ${topic}:`, callbackErr);
                }
            });
        } catch (err) {
            console.error("[WS] Critical failure in event dispatcher:", err);
        }
    }

    _inferEventType(topic, payload) {
        if (!topic) return 'UNKNOWN_EVENT';
        if (topic.includes('notifications')) return 'NOTIFICATION_RECEIVED';
        if (topic.includes('messages') || topic.includes('chat')) return 'MESSAGE_RECEIVED';
        return 'UNKNOWN_EVENT';
    }

    
     // High-level subscription method for React components

    subscribe(topic, callback) {
        if (!this.subscriptions.has(topic)) {
            this.subscriptions.set(topic, new Set());
        }

        const callbacks = this.subscriptions.get(topic);
        callbacks.add(callback);

        // If already connected, perform actual STOMP subscription
        if (this.status === 'CONNECTED') {
            this._stompSubscribe(topic);
        } else if (this.status === 'DISCONNECTED' || this.status === 'FAILED') {
            // Trigger connection logic if it's the first subscription
            this.connect().catch(() => {});
        }

        // Cleanup function for unmount
        return () => {
            const callbacks = this.subscriptions.get(topic);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.subscriptions.delete(topic);
                    this._stompUnsubscribe(topic);
                }
            }
        };
    }

    _stompSubscribe(topic) {
        if (!this.stompClient || this.status !== 'CONNECTED' || this.activeSubscriptions.has(topic)) return;

        try {
            const sub = this.stompClient.subscribe(topic, (message) => {
                this._dispatchNormalizedEvent(topic, message);
            });
            this.activeSubscriptions.set(topic, sub);
        } catch (err) {
            if (this.debug) console.error(`[WS] Subscription error for ${topic}:`, err);
        }
    }

    _stompUnsubscribe(topic) {
        const sub = this.activeSubscriptions.get(topic);
        if (sub) {
            try {
                sub.unsubscribe();
            } catch (err) {
                // Ignore silent unsubscription errors
            }
            this.activeSubscriptions.delete(topic);
        }
    }

    
     //Safe message sending with queueing support
     
    send(destination, payload, headers = {}) {
        const body = JSON.stringify(payload);
        
        if (this.stompClient && this.status === 'CONNECTED') {
            try {
                this.stompClient.send(destination, headers, body);
            } catch (err) {
                this.messageQueue.push({ destination, headers, body });
                this._handleConnectionError(err);
            }
        } else {
            // Queue message until connection is restored
            this.messageQueue.push({ destination, headers, body });
            if (this.status === 'DISCONNECTED' || this.status === 'FAILED') {
                this.connect().catch(() => {});
            }
        }
    }

    _flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const { destination, headers, body } = this.messageQueue.shift();
            try {
                this.stompClient.send(destination, headers, body);
            } catch (err) {
                // Re-queue if send fails during flush
                this.messageQueue.unshift({ destination, headers, body });
                break;
            }
        }
    }

    
     // Full cleanup
     
    disconnect() {
        if (this.reconnectTimeoutId) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
        }

        if (this.stompClient) {
            try {
                this.stompClient.disconnect();
            } catch (err) {
                // Ignore disconnect errors
            }
        }
        
        this.stompClient = null;
        this.status = 'DISCONNECTED';
        this.activeSubscriptions.clear();
        this.subscriptions.clear();
        this.messageQueue = [];
        this.reconnectAttempts = 0;
    }
}

const instance = new WebSocketManager();
export default instance;
