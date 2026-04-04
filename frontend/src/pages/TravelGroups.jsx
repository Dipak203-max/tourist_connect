import React, { useState, useEffect, useContext } from 'react';
import { createGroup, getMyGroups, addMember, removeMember } from '../api/groupApi';
import { getFriends } from '../api/friendApi';
import AuthContext from '../context/AuthContext';

import GroupChat from '../components/chat/GroupChat';
import { TrashIcon, UserPlusIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const TravelGroups = () => {
    const { user } = useContext(AuthContext);
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
            setMsg('Group created!');
            setNewGroupName('');
            loadGroups();
        } catch (error) {
            setMsg('Failed to create group');
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

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Travel Groups</h1>

            {/* Create Group */}
            <div className="bg-surface-50 dark:bg-surface-900 p-6 rounded-lg shadow-sm mb-8 border">
                {/* ... existing form ... */}
                <h3 className="text-lg font-semibold mb-3">Create New Trip Group</h3>
                {msg && <p className="text-blue-600 mb-2">{msg}</p>}
                <form onSubmit={handleCreate} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Trip Name (e.g. Summer Paris 2026)"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">
                        Create
                    </button>
                </form>
            </div>

            {/* Group List */}
            <div className="grid gap-6 md:grid-cols-2">
                {groups.map(group => (
                    <div key={group.id} className="bg-surface-50 dark:bg-surface-900 p-5 rounded-lg shadow border hover:shadow-md transition flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100">{group.name}</h3>
                                <p className="text-sm text-gray-500">Created by {group.createdBy.email === user.email ? 'You' : group.createdBy.email}</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded h-fit">
                                    {group.members.length} Members
                                </span>
                            </div>
                        </div>

                        <div className="border-t pt-4 flex-1">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Members</h4>
                            <ul className="space-y-2 max-h-40 overflow-y-auto">
                                {group.members.map(m => (
                                    <li key={m.id} className="flex justify-between items-center text-sm bg-surface-100 dark:bg-surface-800 p-2 rounded">
                                        <span>{m.email}</span>
                                        {/* Only creator can remove, and cannot remove themselves */}
                                        {group.createdBy.id === user?.id && m.id !== user?.id && (
                                            <button onClick={() => handleRemoveMember(group.id, m.id)} className="text-red-500 hover:text-red-700">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                            <button
                                onClick={() => setActiveChatGroup(group)}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                            >
                                <ChatBubbleLeftRightIcon className="w-5 h-5" /> Open Group Chat
                            </button>

                            {group.createdBy.id === user?.id && (
                                <button
                                    onClick={() => handleAddMemberClick(group)}
                                    className="w-full flex items-center justify-center gap-2 border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50"
                                >
                                    <UserPlusIcon className="w-5 h-5" /> Add Friend
                                </button>
                            )}
                        </div>
                    </div>
                ))}
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
