import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, 
    UserPlus, 
    CheckCircle2, 
    MessageSquare, 
    Plane, 
    Info, 
    Trash2, 
    Check, 
    X, 
    Clock,
    MoreHorizontal
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { getNotifications } from '../api/notificationApi';
import { acceptFriendRequest, rejectFriendRequest } from '../api/friendApi';
import { toast } from 'react-hot-toast';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Button, Card, Badge } from '../components/ui/BaseComponents';

const Notifications = () => {
    const { notifications: liveNotifications, markNotificationAsRead } = useChat();
    const [allNotifications, setAllNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (liveNotifications.length > 0) {
            setAllNotifications(prev => {
                const existingIds = new Set(prev.map(n => n.id));
                const newOnes = liveNotifications.filter(ln => !existingIds.has(ln.id));
                if (newOnes.length === 0) return prev;
                const combined = [...newOnes, ...prev];
                return combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            });
        }
    }, [liveNotifications]);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setAllNotifications(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (id, isRead) => {
        if (isRead) return;
        setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        await markNotificationAsRead(id);
    };

    const handleAcceptRequest = async (e, id, requestId) => {
        e.stopPropagation();
        try {
            await acceptFriendRequest(requestId);
            toast.success("Friend request accepted!");
            setAllNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, isRead: true, type: 'FRIEND_ACCEPTED', message: "You are now friends!" } : n
            ));
        } catch (err) {
            toast.error("Failed to accept friend request.");
        }
    };

    const handleRejectRequest = async (e, id, requestId) => {
        e.stopPropagation();
        if (!window.confirm("Reject this friend request?")) return;
        try {
            await rejectFriendRequest(requestId);
            toast.success("Friend request rejected.");
            setAllNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            toast.error("Failed to reject friend request.");
        }
    };

    const groupedNotifications = useMemo(() => {
        const groups = {
            Today: [],
            Yesterday: [],
            Older: []
        };

        allNotifications.forEach(n => {
            const date = parseISO(n.createdAt);
            if (isToday(date)) groups.Today.push(n);
            else if (isYesterday(date)) groups.Yesterday.push(n);
            else groups.Older.push(n);
        });

        return Object.entries(groups).filter(([_, items]) => items.length > 0);
    }, [allNotifications]);

    const getIcon = (type) => {
        switch (type) {
            case 'FRIEND_REQUEST': return <UserPlus className="w-5 h-5 text-blue-500" />;
            case 'FRIEND_ACCEPTED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'MESSAGE': return <MessageSquare className="w-5 h-5 text-indigo-500" />;
            case 'GROUP_INVITE': return <Plane className="w-5 h-5 text-orange-500" />;
            case 'SYSTEM': return <Info className="w-5 h-5 text-gray-500" />;
            default: return <Bell className="w-5 h-5 text-blue-500" />;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="font-black text-xs uppercase tracking-widest text-muted">Loading Notifications</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 font-outfit">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-black text-surface-900 dark:text-surface-100 tracking-tight mb-2">Notifications</h1>
                    <p className="text-sm font-bold text-muted uppercase tracking-widest">Stay updated with your latest alerts</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="blue" className="px-4 py-2 text-[10px] font-black uppercase tracking-wider shadow-sm">
                        {allNotifications.filter(n => !n.isRead).length} Unread
                    </Badge>
                </div>
            </div>

            {groupedNotifications.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-24 text-center bg-surface-50 dark:bg-surface-900/50 backdrop-blur-xl rounded-[3rem] border border-white/20 shadow-xl"
                >
                    <div className="w-24 h-24 bg-surface-100 dark:bg-surface-800 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner ring-1 ring-black/5">
                        <Bell className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black text-surface-900 dark:text-surface-100 tracking-tight mb-2">No alerts yet</h3>
                    <p className="text-xs font-bold text-muted uppercase tracking-widest max-w-xs leading-relaxed">
                        We'll let you know when something important happens!
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-12">
                    {groupedNotifications.map(([group, items]) => (
                        <div key={group} className="space-y-6">
                            <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {group}
                            </h3>
                            <div className="grid gap-4">
                                <AnimatePresence mode="popLayout">
                                    {items.map((notif) => (
                                        <motion.div
                                            key={notif.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            onClick={() => handleRead(notif.id, notif.isRead)}
                                            className={`group relative flex items-start gap-6 p-6 rounded-[2.5rem] cursor-pointer transition-all border ${
                                                notif.isRead 
                                                    ? 'bg-surface-50 dark:bg-surface-900/50 border-surface-200 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-900/80' 
                                                    : 'bg-surface-50 dark:bg-surface-900 border-blue-600/20 shadow-[0_8px_30px_rgba(37,99,235,0.06)]'
                                            }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                                                notif.isRead ? 'bg-surface-100 dark:bg-surface-800' : 'bg-blue-50 shadow-sm'
                                            }`}>
                                                {getIcon(notif.type)}
                                            </div>
                                            
                                            <div className="flex-1 pt-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-gray-600 font-medium' : 'text-surface-900 dark:text-surface-100 font-black'}`}>
                                                        {notif.message}
                                                    </p>
                                                    <span className="text-[10px] font-black text-muted uppercase tracking-tighter whitespace-nowrap ml-4">
                                                        {format(parseISO(notif.createdAt), 'h:mm a')}
                                                    </span>
                                                </div>

                                                {!notif.isRead && notif.type === 'FRIEND_REQUEST' && (
                                                    <div className="mt-6 flex items-center gap-3">
                                                        <Button 
                                                            size="sm"
                                                            className="h-9 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 border-none transition-all active:scale-95"
                                                            onClick={(e) => handleAcceptRequest(e, notif.id, notif.referenceId)}
                                                        >
                                                            <Check className="w-3.5 h-3.5 mr-2 stroke-[3]" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Accept</span>
                                                        </Button>
                                                        <Button 
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-9 px-6 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-gray-100 border-transparent text-gray-600 transition-all active:scale-95"
                                                            onClick={(e) => handleRejectRequest(e, notif.id, notif.referenceId)}
                                                        >
                                                            <X className="w-3.5 h-3.5 mr-2 stroke-[3]" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Ignore</span>
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {!notif.isRead && (
                                                <motion.div 
                                                    layoutId={`unread-dot-${notif.id}`}
                                                    className="absolute top-6 right-6 w-2.5 h-2.5 bg-blue-600 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)] ring-4 ring-blue-50"
                                                />
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
