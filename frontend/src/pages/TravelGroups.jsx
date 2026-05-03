import React, { useState, useEffect, useContext } from 'react';
import { useChat } from '../context/ChatContext';
import { createGroup, getMyGroups, addMember, removeMember, deleteGroup } from '../api/groupApi';
import { getFriends } from '../api/friendApi';
import AuthContext from '../context/AuthContext';

import GroupChat from '../components/chat/GroupChat';
import { Trash2, UserPlus, MessageCircle, Sparkles, Users, UserMinus, Shield } from 'lucide-react';
import { useRealTime } from '../hooks/useRealTime';
import { toast } from 'react-hot-toast';

const TravelGroups = () => {
    const { user } = useContext(AuthContext);
    const { groupUnreadMap, markGroupAsReadGlobal } = useChat();
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [msg, setMsg] = useState('');

    // Modal / Selection State
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [activeChatGroup, setActiveChatGroup] = useState(null);
    const [friends, setFriends] = useState([]);
    const [showAddMember, setShowAddMember] = useState(false);

    useEffect(() => {
        loadGroups();
    }, []);

    // Real-time synchronization
    useRealTime('NOTIFICATION_RECEIVED', (payload) => {
        if (payload.type && payload.type.startsWith('GROUP_')) {
            console.log("[Live] Group event received:", payload.type);
            loadGroups();
        }
    });

    useRealTime('GROUP_CREATED', () => loadGroups());
    useRealTime('GROUP_DELETED', () => loadGroups());
    useRealTime('GROUP_MEMBER_UPDATED', () => loadGroups());

    const loadGroups = async () => {
        try {
            const data = await getMyGroups();
            setGroups(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createGroup(newGroupName);
            toast.success('Group created successfully!');
            setNewGroupName('');
            loadGroups();
        } catch (error) {
            toast.error('Failed to create group');
        }
    };

    const handleAddMemberClick = async (groupBy) => {
        setSelectedGroup(groupBy);
        try {
            const friendList = await getFriends();
            // Map DTO to usable friend objects
           const formatted = friendList
                .filter(friend => !selectedGroup.members.some(m => m.id === friend.id))
                .map(friend => ({
                    id: friend.id,
                    friendId: friend.id,
                    friendEmail: friend.email
                }));
            setFriends(formatted);
            setShowAddMember(true);
        } catch (e) {
            console.error("Could not load friends");
        }
    };

    const confirmAddMember = async (friendId) => {
        console.log("Adding member userId:", friendId);

        if (!friendId) {
            alert("Please select a valid friend");
            return;
        }

        try {
            await addMember(selectedGroup.id, friendId);
            setMsg('Member added!');
            setShowAddMember(false);
            loadGroups(); // Refresh to show new count/members
        } catch (e) {
            alert('Failed to add member: ' + (e.response?.data || 'Unknown error'));
        }
    };

    const handleRemoveMember = async (groupId, memberId) => {
        if (!window.confirm("Remove this member?")) return;
        try {
            await removeMember(groupId, memberId);
            loadGroups();
        } catch (e) {
            alert('Failed to remove: ' + (e.response?.data || 'Error'));
        }
    };

    const handleOpenChat = (group) => {
        setActiveChatGroup(group);
        markGroupAsReadGlobal(group.id);
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm("Are you sure you want to delete this group? This will remove all members and chat history permanently.")) return;
        try {
            await deleteGroup(groupId);
            setMsg('Group deleted successfully');
            loadGroups();
        } catch (e) {
            alert('Failed to delete group: ' + (e.response?.data || 'Error'));
        }
    };

    return (
        <div className="min-h-screen bg-surface-100 dark:bg-surface-800/50 p-8">
            <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Social Hub</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black text-surface-900 dark:text-surface-100 tracking-tight">Travel Groups</h1>
                        <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Live Sync</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Create Group */}
            <div className="max-w-6xl mx-auto bg-surface-50 dark:bg-surface-900 p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-surface-200 dark:border-surface-700 mb-12">
                <h3 className="text-lg font-black text-surface-900 dark:text-surface-100 mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Launch New Trip Group
                </h3>
                <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Group Name (e.g. Pokhara Expedition 2026)"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="flex-1 bg-surface-100 dark:bg-surface-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 outline-none text-surface-900 dark:text-surface-100 font-medium"
                        required
                    />
                    <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none active:scale-95">
                        Create Group
                    </button>
                </form>
            </div>

            {/* Group List */}
            <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
                {groups.map(group => {
                    const unreadCount = groupUnreadMap[group.id] || groupUnreadMap[String(group.id)] || 0;
                    return (
                        <div key={group.id} className="bg-surface-50 dark:bg-surface-900 p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-surface-200 dark:border-surface-700 hover:border-blue-400 transition-all flex flex-col group relative overflow-hidden">
                            {unreadCount > 0 && (
                                <div className="absolute top-6 left-6 z-20">
                                    <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-blue-200 animate-bounce">
                                        {unreadCount} NEW
                                    </span>
                                </div>
                            )}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-[5rem] -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black text-surface-900 dark:text-surface-100 group-hover:text-blue-600 transition-colors">{group.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Shield className="w-3 h-3 text-blue-500" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        Admin: {group.createdBy.id === user?.id ? 'You' : group.createdBy.username || group.createdBy.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-blue-100/50">
                                    {group.members.length} Members
                                </div>
                                {group.createdBy.id === user?.id && (
                                    <button 
                                        onClick={() => handleDeleteGroup(group.id)}
                                        className="text-gray-300 hover:text-rose-500 transition-all p-2 rounded-xl hover:bg-rose-50"
                                        title="Delete Group"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
 
                        <div className="flex-1 mb-8 relative z-10">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Users className="w-3.5 h-3.5" /> Participants
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {group.members.map(m => (
                                    <div key={m.id} className="group/member flex items-center gap-2 bg-surface-100 dark:bg-surface-800 px-4 py-2 rounded-2xl text-xs font-bold text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:border-blue-200 transition-all">
                                        <span>{m.username || m.email.split('@')[0]}</span>
                                        {group.createdBy.id === user?.id && m.id !== user?.id && (
                                            <button 
                                                onClick={() => handleRemoveMember(group.id, m.id)} 
                                                className="text-gray-300 hover:text-rose-500 transition-colors"
                                                title="Remove Member"
                                            >
                                                <UserMinus className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
 
                            <div className="flex flex-col md:flex-row gap-3 relative z-10">
                                <button
                                    onClick={() => handleOpenChat(group)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-surface-900 dark:bg-surface-50 text-white dark:text-surface-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-xl active:scale-95"
                                >
                                    <MessageCircle className="w-4 h-4" /> Open Conversation
                                </button>
 
                            {group.createdBy.id === user?.id && (
                                <button
                                    onClick={() => handleAddMemberClick(group)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-surface-800 text-blue-600 border-2 border-blue-100 dark:border-surface-700 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 dark:hover:bg-surface-700 transition-all active:scale-95"
                                >
                                    <UserPlus className="w-4 h-4" /> Recruit Member
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
            </div>

            {/* Add Member Modal */}
            {showAddMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-surface-50 dark:bg-surface-900 rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-4">Add Friend to {selectedGroup?.name}</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {friends.length === 0 ? <p className="text-gray-500">No friends found.</p> :
                                friends.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => confirmAddMember(f.friendId)}
                                        className="w-full text-left p-2 hover:bg-gray-100 rounded border-b"
                                    >
                                        {f.friendEmail}
                                    </button>
                                ))
                            }
                        </div>
                        <button onClick={() => setShowAddMember(false)} className="mt-4 text-gray-500 hover:text-gray-700 w-full text-center">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Group Chat Modal */}
            {activeChatGroup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-surface-50 dark:bg-surface-900 rounded-lg w-full max-w-2xl overflow-hidden relative shadow-2xl">
                        <button
                            onClick={() => setActiveChatGroup(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 p-1 bg-surface-50 dark:bg-surface-900 rounded-full shadow-sm"
                        >
                            ✕
                        </button>
                        <GroupChat groupId={activeChatGroup.id} groupName={activeChatGroup.name} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TravelGroups;
