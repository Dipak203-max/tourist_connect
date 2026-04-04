import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserGroupIcon, UserIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { getFriends } from '../api/friendApi';
import { getGroups } from '../api/groupApi';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const ShareModal = ({ isOpen, onClose, itinerary }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('friends'); 
    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const { sendMessage } = useChat();
    const [sentMap, setSentMap] = useState({}); 

    useEffect(() => {
        if (isOpen) {
            loadData();
            setSentMap({});
        }
    }, [isOpen]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [friendsData, groupsData] = await Promise.all([
                getFriends(),
                getGroups()
            ]);
            setFriends(friendsData);
            setGroups(groupsData);
        } catch (error) {
            console.error("Failed to load share contacts", error);
        } finally {
            setLoading(false);
        }
    };

    const getFriendId = (friendDto) => {
        if (!user || !friendDto) return null;
        return friendDto.senderId === user.userId ? friendDto.receiverId : friendDto.senderId;
    };

    const getFriendName = (friendDto) => {
        if (!user || !friendDto) return "Unknown";
        return friendDto.senderId === user.userId ? friendDto.receiverName : friendDto.senderName;
    };

    const handleShare = (target, type) => {
        if (!itinerary || !user) return;

        const payloadContent = JSON.stringify({
            itineraryId: itinerary.id,
            title: itinerary.title,
            startDate: itinerary.startDate,
            endDate: itinerary.endDate,
            shareToken: itinerary.shareToken
        });

        let targetId;
        let destination;
        let messagePayload = {
            senderId: user.userId, 
            content: payloadContent,
            messageType: 'ITINERARY'
        };

        if (type === 'friend') {
            targetId = getFriendId(target);
            destination = '/app/chat.send';
            messagePayload.receiverId = targetId;
        } else {
            targetId = target.id;
            destination = `/app/chat.group.send/${targetId}`; 
            messagePayload.group = { id: targetId };  
            
        }

        sendMessage(destination, messagePayload);

        const key = `${type}-${targetId}`;
        setSentMap(prev => ({ ...prev, [key]: true }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-surface-50 dark:bg-surface-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center bg-surface-100 dark:bg-surface-800">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Share Itinerary</h3>
                        <p className="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[250px]">
                            {itinerary?.title}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-gray-600 transition">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-surface-200 dark:border-surface-700">
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition ${activeTab === 'friends' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-surface-100 dark:hover:bg-surface-800'}`}
                        onClick={() => setActiveTab('friends')}
                    >
                        <UserIcon className="w-4 h-4 inline-block mr-2" />
                        Friends
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition ${activeTab === 'groups' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-surface-100 dark:hover:bg-surface-800'}`}
                        onClick={() => setActiveTab('groups')}
                    >
                        <UserGroupIcon className="w-4 h-4 inline-block mr-2" />
                        Groups
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activeTab === 'friends' ? (
                                friends.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No friends found.</p>
                                ) : (
                                    friends.map((friend, idx) => {
                                        const fId = getFriendId(friend);
                                        const isSent = sentMap[`friend-${fId}`];
                                        return (
                                            <div key={idx} className="flex items-center justify-between p-3 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 transition">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                        {getFriendName(friend).charAt(0)}
                                                    </div>
                                                    <div className="font-medium text-gray-700">{getFriendName(friend)}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleShare(friend, 'friend')}
                                                    disabled={isSent}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition ${isSent
                                                            ? 'bg-green-100 text-green-700 cursor-default'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                >
                                                    {isSent ? 'Sent' : (
                                                        <>
                                                            <span>Send</span>
                                                            <PaperAirplaneIcon className="w-3 h-3 ml-1" />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })
                                )
                            ) : (
                                groups.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No groups found.</p>
                                ) : (
                                    groups.map((group) => {
                                        const isSent = sentMap[`group-${group.id}`];
                                        return (
                                            <div key={group.id} className="flex items-center justify-between p-3 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 transition">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                                        {group.name.charAt(0)}
                                                    </div>
                                                    <div className="font-medium text-gray-700">{group.name}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleShare(group, 'group')}
                                                    disabled={isSent}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition ${isSent
                                                            ? 'bg-green-100 text-green-700 cursor-default'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                >
                                                    {isSent ? 'Sent' : (
                                                        <>
                                                            <span>Send</span>
                                                            <PaperAirplaneIcon className="w-3 h-3 ml-1" />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 text-center">
                    <p className="text-xs text-muted">
                        Shared itineraries are view-only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
