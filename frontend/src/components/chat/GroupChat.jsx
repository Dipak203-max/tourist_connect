import wsManager from '../../utils/WebSocketManager';
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { getGroupHistory } from '../../api/groupApi';
import SharedItineraryCard from '../SharedItineraryCard';

const GroupChat = ({ groupId, groupName }) => {
    const { isConnected } = useChat();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Fetch History
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const data = await getGroupHistory(groupId);
                setMessages(data);
                scrollToBottom();
            } catch (err) {
                console.error("Failed to load chat history", err);
            } finally {
                setLoading(false);
            }
        };

        if (groupId) {
            fetchHistory();
        }
    }, [groupId]);

    // WebSocket Subscription
    useEffect(() => {
        if (!groupId || !isConnected) return;

        const unsubscribe = wsManager.subscribe(`/topic/group-chat/${groupId}`, (event) => {
            if (event.payload) {
                const newMessage = event.payload;
                setMessages(prev => {
                    // Check if this is the message we just sent optimistically (compare content and timestamp roughly)
                    // Or more reliably, check if the ID already exists (server response will have ID)
                    if (prev.some(m => m.id === newMessage.id)) return prev;
                    
                    // Filter out our own optimistic temporary message if it matches this one
                    const filtered = prev.filter(m => 
                        !(m.isOptimistic && m.content === newMessage.content && m.senderId === newMessage.senderId)
                    );
                    
                    const updated = [...filtered, newMessage];
                    return updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                });
                scrollToBottom();
            }
        });

        return unsubscribe;
    }, [groupId, isConnected]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const chatMessage = {
            senderId: user.id,
            senderName: user.fullName || user.username,
            groupId: groupId,
            content: input,
            messageType: 'TEXT',
            createdAt: new Date().toISOString(),
            isOptimistic: true // Flag to identify local temporary message
        };

        // Optimistic Update: Add to local state immediately
        setMessages(prev => [...prev, chatMessage]);
        scrollToBottom();

        // Send via WebSocket
        wsManager.send(`/app/chat/group/${groupId}`, chatMessage);
        setInput('');
    };

    const renderMessageContent = (msg) => {
        if (msg.messageType === 'ITINERARY') {
            try {
                const itineraryData = JSON.parse(msg.content);
                return <SharedItineraryCard itineraryData={itineraryData} />;
            } catch (e) {
                return <p className="text-red-500 text-xs">Error loading itinerary</p>;
            }
        }
        return msg.content;
    };

    return (
        <div className="flex flex-col h-[500px] bg-surface-50 dark:bg-surface-900 rounded-lg shadow border">
            <div className="p-4 border-b bg-blue-50 flex justify-between items-center rounded-t-lg">
                <h3 className="font-bold text-gray-700">Chat: {groupName}</h3>
                <span className="text-xs text-green-600 font-semibold flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Live
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-100 dark:bg-surface-800">
                {loading && <p className="text-center text-muted text-sm">Loading history...</p>}

                {!loading && messages.length === 0 && (
                    <p className="text-center text-muted text-sm mt-10">No messages yet. Say hello!</p>
                )}

                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user.id;
                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-blue-600 text-white' : 'bg-surface-50 dark:bg-surface-900 border text-gray-800'
                                }`}>
                                {!isMe && <p className="text-xs font-black mb-1 text-blue-600 uppercase tracking-widest">{msg.senderName}</p>}
                                <div className="text-sm break-words">
                                    {renderMessageContent(msg)}
                                </div>
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-muted'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t bg-surface-50 dark:bg-surface-900 rounded-b-lg flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default GroupChat;
