import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    UserPlus, 
    Search, 
    UserCheck, 
    UserX, 
    MessageSquare, 
    MoreHorizontal,
    UserMinus,
    Clock,
    User
} from 'lucide-react';
import { getFriends, getPendingRequests, acceptFriendRequest, rejectFriendRequest, sendFriendRequest, unfriendUser } from '../api/friendApi';
import { searchUsers } from '../api/userApi';
import { Card, Button, Input, Badge, cn } from '../components/ui/BaseComponents';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'discover'
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const API_BASE_URL = "http://localhost:8080";

    const getFullUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [friendsData, requestsData] = await Promise.all([
                getFriends(),
                getPendingRequests()
            ]);
            setFriends(friendsData);
            setRequests(requestsData);
        } catch (error) {
            toast.error('Failed to load friends data');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            try {
                const results = await searchUsers(query);
                // Filter out current friends and self (self is usually handled by backend search)
                setSearchResults(results);
            } catch (error) {
                console.error('Search failed', error);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleAccept = async (id) => {
        try {
            await acceptFriendRequest(id);
            toast.success('Friend request accepted');
            fetchData();
        } catch (error) {
            toast.error('Failed to accept request');
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectFriendRequest(id);
            toast.success('Friend request rejected');
            fetchData();
        } catch (error) {
            toast.error('Failed to reject request');
        }
    };

    const handleSendRequest = async (userId) => {
        try {
            await sendFriendRequest(userId);
            toast.success('Friend request sent');
            setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, requestSent: true } : u));
        } catch (error) {
            toast.error('Failed to send request');
        }
    };

    const handleUnfriend = async (friendId) => {
        if (window.confirm('Are you sure you want to remove this friend?')) {
            try {
                await unfriendUser(friendId);
                toast.success('Unfriended successfully');
                fetchData();
            } catch (error) {
                toast.error('Failed to unfriend');
            }
        }
    };

    const tabs = [
        { id: 'friends', label: 'My Friends', icon: Users, count: friends.length },
        { id: 'requests', label: 'Requests', icon: Clock, count: requests.length },
        { id: 'discover', label: 'Discover', icon: UserPlus },
    ];

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 min-h-screen pb-24">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-surface-900 dark:text-white tracking-tight">
                        Connections
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        Manage your network and connect with other travelers.
                    </p>
                </div>
                
                <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-2xl w-fit border border-surface-200 dark:border-surface-700">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "relative px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                activeTab === tab.id 
                                    ? "bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm" 
                                    : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.count > 0 && (
                                <Badge variant={tab.id === 'requests' ? 'danger' : 'primary'} className="ml-1 px-1.5 py-0.5">
                                    {tab.count}
                                </Badge>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Section */}
            <AnimatePresence mode="wait">
                {activeTab === 'friends' && (
                    <motion.div
                        key="friends"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {friends.length > 0 ? (
                            friends.map((friend) => (
                                <Card key={friend.id} className="group flex flex-col gap-4">
                                    <div 
                                        className="flex items-center gap-4 cursor-pointer group/header"
                                        onClick={() => navigate(`/profile/${friend.id}`)}
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden border-2 border-primary-50 dark:border-primary-900/50 group-hover/header:scale-105 transition-transform">
                                            {friend.profilePictureUrl ? (
                                                <img src={getFullUrl(friend.profilePictureUrl)} alt={friend.fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="font-bold text-lg text-surface-900 dark:text-white truncate group-hover/header:text-primary-600 dark:group-hover/header:text-primary-400 transition-colors">
                                                {friend.fullName || friend.username}
                                            </h3>
                                            <p className="text-sm text-surface-500 dark:text-surface-400 truncate">
                                                @{friend.username}
                                            </p>
                                        </div>
                                        <button 
                                            className="p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Handle menu
                                            }}
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            className="flex-1 gap-2"
                                            onClick={() => navigate('/chat', { state: { openChatWith: friend.id } })}
                                        >
                                            <MessageSquare className="w-4 h-4" /> Message
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                                            onClick={() => handleUnfriend(friend.id)}
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-6 rounded-full bg-surface-100 dark:bg-surface-800">
                                    <Users className="w-12 h-12 text-surface-400" />
                                </div>
                                <div className="max-w-xs">
                                    <h3 className="text-xl font-bold text-surface-900 dark:text-white">No friends yet</h3>
                                    <p className="text-surface-500 dark:text-surface-400 mt-2">
                                        Connectivity is the key! Start exploring and make some new friends.
                                    </p>
                                    <Button 
                                        variant="primary" 
                                        className="mt-6"
                                        onClick={() => setActiveTab('discover')}
                                    >
                                        Find People
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'requests' && (
                    <motion.div
                        key="requests"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {requests.length > 0 ? (
                            requests.map((request) => (
                                <Card key={request.id} className="flex items-center gap-4 flex-wrap">
                                    <div 
                                        className="flex items-center gap-4 flex-1 cursor-pointer group/request"
                                        onClick={() => navigate(`/profile/${request.senderId}`)}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center overflow-hidden border border-surface-200 dark:border-surface-700 group-hover/request:scale-105 transition-transform">
                                            {request.senderProfilePictureUrl ? (
                                                <img src={getFullUrl(request.senderProfilePictureUrl)} alt={request.senderName} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-surface-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <h3 className="font-bold text-surface-900 dark:text-white group-hover/request:text-primary-600 transition-colors">
                                                {request.senderName}
                                            </h3>
                                            <p className="text-xs text-surface-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Requested recently
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-auto">
                                        <Button 
                                            variant="primary" 
                                            size="sm" 
                                            className="gap-2"
                                            onClick={() => handleAccept(request.id)}
                                        >
                                            <UserCheck className="w-4 h-4" /> Accept
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            className="gap-2 text-red-500 border-red-100 dark:border-red-900/30"
                                            onClick={() => handleReject(request.id)}
                                        >
                                            <UserX className="w-4 h-4" /> Decline
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-6 rounded-full bg-surface-100 dark:bg-surface-800">
                                    <Clock className="w-12 h-12 text-surface-400" />
                                </div>
                                <h3 className="text-xl font-bold text-surface-900 dark:text-white">All caught up!</h3>
                                <p className="text-surface-500 dark:text-surface-400">No pending friend requests.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'discover' && (
                    <motion.div
                        key="discover"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <div className="relative max-w-2xl mx-auto">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-surface-400" />
                            </div>
                            <Input
                                placeholder="Search by name, username or email..."
                                className="pl-12 h-14 text-lg shadow-xl shadow-surface-100 dark:shadow-none"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.length > 0 ? (
                                searchResults.map((user) => (
                                    <Card key={user.id} className="flex flex-col gap-4">
                                        <div 
                                            className="flex items-center gap-4 cursor-pointer group/discover"
                                            onClick={() => navigate(`/profile/${user.id}`)}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center overflow-hidden border border-primary-100 dark:border-primary-800 group-hover/discover:scale-105 transition-transform">
                                                {user.profilePictureUrl ? (
                                                    <img src={getFullUrl(user.profilePictureUrl)} alt={user.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-6 h-6 text-primary-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-surface-900 dark:text-white group-hover/discover:text-primary-600 transition-colors">{user.fullName || user.username}</h3>
                                                <p className="text-xs text-surface-500">@{user.username}</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant={user.requestSent ? 'secondary' : 'primary'}
                                            disabled={user.requestSent}
                                            onClick={() => handleSendRequest(user.id)}
                                            className="w-full gap-2"
                                        >
                                            {user.requestSent ? (
                                                <><Clock className="w-4 h-4" /> Request Sent</>
                                            ) : (
                                                <><UserPlus className="w-4 h-4" /> Send Request</>
                                            )}
                                        </Button>
                                    </Card>
                                ))
                            ) : (
                                searchQuery.length > 2 ? (
                                    <div className="col-span-full py-12 text-center text-surface-500">
                                        No users found matching "{searchQuery}"
                                    </div>
                                ) : (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="p-6 rounded-full bg-surface-100 dark:bg-surface-800">
                                            <Search className="w-12 h-12 text-surface-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-surface-900 dark:text-white">Find something new</h3>
                                        <p className="text-surface-500 dark:text-surface-400">Search for people by their name, username or email.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Friends;
