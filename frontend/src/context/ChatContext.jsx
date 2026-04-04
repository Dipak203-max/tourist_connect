import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getUnreadCount, markAsRead } from '../api/notificationApi';
import { getFriends } from '../api/friendApi';
import wsManager from '../utils/WebSocketManager';
import { toast } from 'react-hot-toast';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [chatUnreadMap, setChatUnreadMap] = useState({});
    const [totalChatUnread, setTotalChatUnread] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    // Track which chat is currently open to avoid incrementing unread for it
    const activeChatRef = useRef(null);

    const setActiveChatId = (id) => {
        activeChatRef.current = id;
    };

    // Synchronize isConnected state with WebSocketManager
    useEffect(() => {
        const unsubscribe = wsManager.addStatusListener((status) => {
            setIsConnected(status === 'CONNECTED');
        });
        return unsubscribe;
    }, []);

    // Effect to resolve User ID if missing (Frontend specific workaround)
    useEffect(() => {
        const resolveUserId = async () => {
            if (user?.email && !user.userId) {
                try {
                    const friends = await getFriends();
                    const myEntryAsSender = friends.find(f => f.senderName === user.email);
                    const myEntryAsReceiver = friends.find(f => f.receiverName === user.email);

                    const resolvedId = myEntryAsSender?.senderId || myEntryAsReceiver?.receiverId;

                    if (resolvedId) {
                        updateUser({ id: resolvedId });
                    }
                } catch (err) {
                    console.error("Failed to resolve User ID:", err);
                }
            }
        };

        resolveUserId();
    }, [user?.email, user?.id]);

    // Fetch unread counts (Notifications + Chat) on load
    useEffect(() => {
        if (user) {
            getUnreadCount().then(res => setUnreadCount(typeof res === 'number' ? res : 0))
                .catch(err => console.error("Failed to load notification unread count", err));

            import('../api/chatApi').then(({ getUnreadCounts, getConversations }) => {
                getUnreadCounts()
                    .then(data => {
                        setChatUnreadMap(data || {});
                        const total = Object.values(data || {}).reduce((a, b) => a + b, 0);
                        setTotalChatUnread(total);
                    })
                    .catch(err => console.error("ChatContext: Failed to load unread counts", err));

                getConversations()
                    .then(data => {
                        setConversations(data || []);
                    })
                    .catch(err => console.error("ChatContext: Failed to load conversations", err));
            });
        }
    }, [user]);

    // Use global WebSocketManager
    useEffect(() => {
        if (user?.id) {
            const unsubscribeMessages = import.meta.env.VITE_WEBSOCKET_ENABLED !== 'false' ? wsManager.subscribe(`/queue/messages/${user.id}`, (event) => {
                const receivedMsg = event.payload;
                
                if (receivedMsg && typeof receivedMsg === 'object') {
                    try {
                        setMessages(prev => {
                            // 1. Remove temp messages that match the incoming real message
                            const filtered = prev.filter(m => {
                                const isTemp = typeof m.id === 'string' && m.id.startsWith('temp-');
                                const contentMatches = m.content === receivedMsg.content;
                                const senderMatches = String(m.senderId) === String(receivedMsg.senderId);
                                return !(isTemp && contentMatches && senderMatches);
                            });

                            // 2. Prevent duplicate real messages
                            const isDuplicate = filtered.some(m => String(m.id) === String(receivedMsg.id));
                            if (isDuplicate) return filtered;

                            // 3. Add and sort
                            const updated = [...filtered, receivedMsg];
                            return updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                        });

                        setConversations(prev => {
                            if (!receivedMsg.conversationId) return prev;
                            const exists = prev.find(c => c.conversationId === receivedMsg.conversationId);
                            if (exists) {
                                return prev.map(c =>
                                    c.conversationId === receivedMsg.conversationId
                                        ? { 
                                            ...c, 
                                            lastMessage: receivedMsg.content, 
                                            lastMessageTime: receivedMsg.createdAt,
                                            unreadCount: (String(activeChatRef.current) !== String(receivedMsg.senderId) && receivedMsg.receiverId === user.id)
                                                ? (c.unreadCount || 0) + 1 
                                                : (c.unreadCount || 0)
                                          }
                                        : c
                                );
                            }
                            return prev;
                        });

                        if (receivedMsg.receiverId === user.id) {
                            const senderIdStr = String(receivedMsg.senderId);
                            const activeIdStr = String(activeChatRef.current);

                            if (activeIdStr !== senderIdStr) {
                                setChatUnreadMap(prev => {
                                    const newMap = {
                                        ...prev,
                                        [receivedMsg.senderId]: (prev[receivedMsg.senderId] || 0) + 1
                                    };
                                    const total = Object.values(newMap).reduce((a, b) => a + b, 0);
                                    setTotalChatUnread(total);
                                    return newMap;
                                });

                                // Show Toast for message
                                toast.success(`New message from ${receivedMsg.senderName || 'Friend'}`, {
                                    icon: '💬',
                                    style: {
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }
                                });
                            } else {
                                import('../api/chatApi').then(({ markMessagesAsRead }) => {
                                    markMessagesAsRead(receivedMsg.senderId).catch(console.error);
                                });
                            }
                        }
                    } catch (e) {
                        console.error("Error processing message payload", e);
                    }
                }
            }) : () => { };

            const unsubscribeNotifications = wsManager.subscribe(
    `/queue/notifications/${user.id}`,
    (event) => {
        const notification = event.payload;

        if (!notification) return;

        // ✅ 1. Add to notification list
        setNotifications(prev => {
            const exists = prev.some(n => n.id === notification.id);
            if (exists) return prev;
            return [notification, ...prev];
        });

        // ✅ 2. If it's group message → trigger UI update
        if (notification.groupId) {
            // Force refresh conversations (group list)
            setConversations(prev => [...prev]);

            // Optional: you can also trigger a fetch if needed
        }

        // ✅ 3. Toast
        toast.success(
            notification.content || "New group message",
            { icon: "💬" }
        );
    }
);

            // UPDATED: Cleanup includes both subscriptions
            return () => {
                unsubscribeMessages();
                unsubscribeNotifications();
            };
        }
    }, [user?.id]);

    const sendMessage = (destination, payload) => {
        wsManager.send(destination, payload);
    };

    const markNotificationAsRead = async (id) => {
        try {
            await markAsRead(id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markChatAsReadGlobal = async (senderId) => {
        try {
            const { markMessagesAsRead } = await import('../api/chatApi');
            await markMessagesAsRead(senderId);

            setChatUnreadMap(prev => {
                if (!prev[senderId]) return prev;
                const newMap = { ...prev, [senderId]: 0 };
                const total = Object.values(newMap).reduce((a, b) => a + b, 0);
                setTotalChatUnread(total);
                return newMap;
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <ChatContext.Provider value={{
            messages,
            setMessages,
            conversations,
            setConversations,
            notifications,
            setNotifications,
            unreadCount,
            chatUnreadMap,
            totalChatUnread,
            setActiveChatId,
            sendMessage,
            isConnected,
            markNotificationAsRead,
            markChatAsReadGlobal,
            // Helper to add a message (optimistic UI)
            addMessage: (msg) => {
                setMessages(prev => {
                    const isDuplicate = prev.some(m => m.id === msg.id);
                    if (isDuplicate) return prev;
                    return [...prev, msg].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                });
            }
        }}>
            {children}
        </ChatContext.Provider>
    );
};