import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, MessageSquare, User, Circle, MoreVertical, Hash, Smile, Paperclip } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { getPrivateHistory, getConversations, getOrCreateConversation } from '../api/chatApi';
import SharedItineraryCard from '../components/SharedItineraryCard';
import wsManager from '../utils/WebSocketManager';
import { Button, Card, Input } from '../components/ui/BaseComponents';

const Chat = () => {
    const { user } = useAuth();
    const location = useLocation();
    const {
        messages: globalMessages,
        setMessages,
        conversations,
        setConversations,
        chatUnreadMap,
        markChatAsReadGlobal,
        setActiveChatId,
        sendMessage,
        isConnected
    } = useChat();

    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const messagesEndRef = useRef(null);

    const combinedMessages = useMemo(() => {
        if (!selectedConversation) return [];
        const convId = selectedConversation.conversationId;
        // Primary source of truth is now globalMessages from ChatContext
        return globalMessages
            .filter(m => m.conversationId === convId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }, [globalMessages, selectedConversation?.conversationId]);

    const filteredConversations = useMemo(() => {
        return conversations.filter(c => 
            c.otherUserFullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [conversations, searchQuery]);

    useEffect(() => {
        return () => setActiveChatId(null);
    }, []);

    // Removed redundant manual subscription to /topic/messages
    // ChatContext already handles /queue/messages which is the primary real-time channel

    useEffect(() => {
        const handleExternalRedirect = async () => {
            if (location.state?.openChatWith) {
                const partnerId = parseInt(location.state.openChatWith);
                try {
                    await getOrCreateConversation(partnerId);
                    const conv = conversations.find(c => c.otherUserId === partnerId);
                    if (conv) setSelectedConversation(conv);
                } catch (err) {
                    console.error("Failed to initialize conversation", err);
                    import('react-hot-toast').then(mod => mod.toast.error("Failed to start chat. Try again."));
                }
            }
        };
        handleExternalRedirect();
    }, [location.state, conversations.length]);

    useEffect(() => {
        if (selectedConversation) {
            const partnerId = selectedConversation.otherUserId;
            setActiveChatId(partnerId);
            loadHistory(partnerId);
            if (selectedConversation.unreadCount > 0 || chatUnreadMap[partnerId] > 0) {
                markChatAsReadGlobal(partnerId);
            }
        } else {
            setActiveChatId(null);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [combinedMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadHistory = async (partnerId) => {
        try {
            const history = await getPrivateHistory(partnerId);
            // Update global messages with history, deduplicating against what we already have
            setMessages(prev => {
                const otherMessages = prev.filter(m => 
                    m.conversationId !== selectedConversation?.conversationId
                );
                const merged = [...otherMessages, ...history];
                // Final sort and dedupe by ID
                const unique = [];
                const seen = new Set();
                [...merged].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).forEach(m => {
                    if (!seen.has(String(m.id))) {
                        unique.push(m);
                        seen.add(String(m.id));
                    }
                });
                return unique;
            });
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    const handleSend = () => {
        if (!newMessage.trim() || !selectedConversation) return;
        const partnerId = selectedConversation.otherUserId;
        const convId = selectedConversation.conversationId;
        const payload = {
            senderId: user.id,
            receiverId: partnerId,
            content: newMessage,
            messageType: 'TEXT',
            conversationId: convId,
            createdAt: new Date().toISOString()
        };
        const tempId = `temp-${Date.now()}`;
        const tempMsg = { ...payload, id: tempId };
        
        // Use global addMessage for optimistic update
        setMessages(prev => [...prev, tempMsg].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        
        setConversations(prev => prev.map(c =>
            c.conversationId === convId
                ? { ...c, lastMessage: newMessage, lastMessageTime: payload.createdAt }
                : c
        ));
        
        sendMessage('/app/chat.sendMessage', payload);
        setNewMessage('');
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
        <div className="flex h-[85vh] border border-white/20 rounded-[2.5rem] overflow-hidden bg-surface-50 dark:bg-surface-900/70 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] mt-4 max-w-7xl mx-auto font-outfit ring-1 ring-black/5">
            {/* Sidebar */}
            <div className="w-80 md:w-96 border-r border-surface-200 dark:border-surface-700/50 bg-surface-100 dark:bg-surface-800/30 flex flex-col">
                <div className="p-8 pb-6">
                    <h1 className="font-black text-3xl text-surface-900 dark:text-surface-100 tracking-tight mb-6">Messages</h1>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-50 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-700 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-surface-900 dark:text-surface-100 placeholder:text-muted focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-2 pb-8">
                    {filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                            <div className="w-16 h-16 bg-surface-50 dark:bg-surface-900 rounded-3xl shadow-sm flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="text-muted font-bold text-sm tracking-tight">{searchQuery ? 'No results found' : 'No conversations yet'}</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const unread = chatUnreadMap[conv.otherUserId] || conv.unreadCount || 0;
                            const isActive = selectedConversation?.conversationId === conv.conversationId;
                            return (
                                <motion.div
                                    key={conv.conversationId}
                                    whileHover={{ x: 4 }}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`p-4 rounded-[1.75rem] cursor-pointer transition-all flex items-center gap-4 relative group ${isActive ? 'bg-surface-50 dark:bg-surface-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5' : 'hover:bg-surface-50 dark:hover:bg-surface-900/50'}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md ring-2 ring-white ring-offset-2 ring-offset-gray-50 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                            {conv.otherUserProfilePicture ? (
                                                <img src={conv.otherUserProfilePicture || "/default-avatar.png"} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-blue-300" />
                                            )}
                                        </div>
                                        {unread > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full shadow-lg shadow-blue-200 border-2 border-white">
                                                {unread}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className={`font-black text-sm truncate tracking-tight ${unread > 0 ? 'text-surface-900 dark:text-surface-100' : 'text-gray-700'}`}>{conv.otherUserFullName}</h3>
                                            {conv.lastMessageTime && (
                                                <span className="text-[10px] font-black text-muted uppercase tracking-tighter ml-2">
                                                    {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs truncate tracking-tight leading-relaxed ${unread > 0 ? 'font-black text-blue-600' : 'text-muted font-medium'}`}>
                                            {conv.lastMessage || 'Start a conversation'}
                                        </p>
                                    </div>
                                    {isActive && <motion.div layoutId="active-pill" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />}
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-surface-50 dark:bg-surface-900">
                <AnimatePresence mode="wait">
                    {selectedConversation ? (
                        <motion.div 
                            key={selectedConversation.conversationId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col min-h-0"
                        >
                            {/* Header */}
                            <div className="h-24 px-8 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between bg-surface-50 dark:bg-surface-900/80 backdrop-blur-xl z-20">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm bg-surface-100 dark:bg-surface-800 flex items-center justify-center ring-2 ring-white">
                                            {selectedConversation.otherUserProfilePicture ? (
                                                <img src={selectedConversation.otherUserProfilePicture || "/default-avatar.png"} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-gray-300" />
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </div>
                                    <div>
                                        <h2 className="font-black text-surface-900 dark:text-surface-100 tracking-tight text-lg">{selectedConversation.otherUserFullName}</h2>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-black text-muted uppercase tracking-widest">{isConnected ? 'Active Now' : 'Disconnected'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-muted transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-surface-100 dark:bg-surface-800/30 no-scrollbar">
                                {combinedMessages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
                                        <div className="w-20 h-20 bg-surface-50 dark:bg-surface-900 rounded-[2.5rem] shadow-sm flex items-center justify-center mb-6">
                                            <Smile className="w-10 h-10 text-muted" />
                                        </div>
                                        <p className="font-black text-lg text-surface-900 dark:text-surface-100 mb-1">Start chatting</p>
                                        <p className="text-sm font-bold uppercase tracking-widest">Type your first message below</p>
                                    </div>
                                )}
                                {combinedMessages.map((msg, idx) => {
                                    const isMe = msg.senderId === user.id;
                                    const showAvatar = idx === 0 || combinedMessages[idx - 1].senderId !== msg.senderId;
                                    
                                    return (
                                        <motion.div 
                                            key={msg.id || Math.random()} 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex items-end gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {!isMe && (
                                                <div className={`w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 transition-opacity ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                                    {selectedConversation.otherUserProfilePicture ? (
                                                        <img src={selectedConversation.otherUserProfilePicture || "/default-avatar.png"} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                                                            {selectedConversation.otherUserFullName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className={`group relative max-w-[75%] md:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-5 py-3.5 rounded-[1.75rem] shadow-sm ${
                                                    isMe 
                                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none' 
                                                        : 'bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-gray-700 rounded-bl-none'
                                                }`}>
                                                    <div className="text-[14px] font-bold leading-relaxed whitespace-pre-wrap break-words">
                                                        {renderMessageContent(msg)}
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-tighter mt-1.5 px-2 block transition-opacity opacity-40 group-hover:opacity-100 ${isMe ? 'text-right text-gray-500' : 'text-left text-muted'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-8 pb-10 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
                                <div className="mx-auto flex items-center gap-3 bg-surface-100 dark:bg-surface-800/80 rounded-[2rem] p-2 pr-2.5 border border-transparent focus-within:border-blue-500/30 focus-within:bg-surface-50 dark:bg-surface-900 focus-within:ring-8 focus-within:ring-blue-500/5 transition-all shadow-inner">
                                    <button className="p-3 text-muted hover:text-blue-600 transition-colors">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 text-muted hover:text-blue-600 transition-colors hidden sm:block">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <input 
                                        type="text"
                                        placeholder="Type something amazing..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        className="flex-1 bg-transparent py-4 px-2 text-sm font-bold text-surface-900 dark:text-surface-100 focus:outline-none placeholder:text-muted/70"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSend}
                                        disabled={!newMessage.trim()}
                                        className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 disabled:opacity-30 disabled:shadow-none flex items-center gap-2 transition-all hover:shadow-blue-300"
                                    >
                                        <span className="font-black text-xs uppercase tracking-widest hidden sm:block">Send</span>
                                        <Send className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                        >
                            <div className="w-32 h-32 bg-surface-100 dark:bg-surface-800/50 rounded-[3rem] flex items-center justify-center mb-8 relative">
                                <MessageSquare className="w-12 h-12 text-gray-200" />
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0 bg-blue-500/5 rounded-[3rem]"
                                />
                            </div>
                            <h3 className="text-2xl font-black text-surface-900 dark:text-surface-100 tracking-tight mb-2">Your Conversations</h3>
                            <p className="text-sm font-bold text-muted uppercase tracking-widest max-w-[280px] leading-relaxed">
                                Select a friend from the sidebar and start planning your next adventure together.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Chat;
