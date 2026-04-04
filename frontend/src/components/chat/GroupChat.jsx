import wsManager from '../../utils/WebSocketManager';
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { getGroupHistory } from '../../api/groupApi';

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

        console.log(`[GroupChat] Subscribing via wsManager to: /topic/group-chat/${groupId}`);
        const unsubscribe = wsManager.subscribe(`/topic/group-chat/${groupId}`, (payload) => {
            if (payload.body) {
                const newMessage = JSON.parse(payload.body);
                setMessages(prev => {
                    // Avoid duplicates if message ID already exists
                    if (prev.some(m => m.id === newMessage.id)) return prev;
                    const updated = [...prev, newMessage];
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
            groupId: groupId,
            content: input,
            messageType: 'TEXT',
            createdAt: new Date().toISOString()
        };

        // Note: Destination path must match backend @MessageMapping("/chat/group/{groupId}")
        wsManager.send(`/app/chat/group/${groupId}`, chatMessage);
        setInput('');
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
                                {!isMe && <p className="text-xs font-bold mb-1 text-blue-600">{msg.senderEmail}</p>}
                                <p className="text-sm break-words">{msg.content}</p>
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
