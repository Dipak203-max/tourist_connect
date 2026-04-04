import React from 'react';
import { MoreHorizontal, MessageCircle, Share2, Heart, MapPin, Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post }) => {
    const { user, content, mediaUrl, mediaType, location, feeling, createdAt } = post;
    const API_BASE_URL = "http://localhost:8080";

    return (
        <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 mb-6 overflow-hidden animate-in fade-in duration-500">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shadow-inner bg-gray-100">
                        <img
                            src={user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${user?.fullName || user?.email || 'User'}&background=random`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <div className="flex items-center flex-wrap gap-x-1">
                            <h3 className="font-black text-surface-900 dark:text-surface-100 text-sm hover:underline cursor-pointer">{user?.fullName || user?.email}</h3>
                            {feeling && (
                                <span className="text-gray-500 text-xs font-medium"> is feeling <span className="text-surface-900 dark:text-surface-100 font-bold">{feeling}</span></span>
                            )}
                            {location && (
                                <span className="text-gray-500 text-xs font-medium"> at <span className="text-surface-900 dark:text-surface-100 font-bold">{location}</span></span>
                            )}
                        </div>
                        <p className="text-[11px] text-muted font-bold uppercase tracking-wider">
                            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
                <button className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-full text-muted transition-all">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Content */}
            {content && (
                <div className="px-4 pb-4 text-sm text-gray-800 leading-relaxed font-medium">
                    {content}
                </div>
            )}

            {/* Media */}
            {mediaUrl && (
                <div className="bg-surface-100 dark:bg-surface-800 border-y border-gray-50">
                    {mediaType === 'IMAGE' ? (
                        <img
                            src={`${API_BASE_URL}${mediaUrl}`}
                            alt="Post media"
                            className="w-full h-auto max-h-[500px] object-contain"
                        />
                    ) : mediaType === 'VIDEO' ? (
                        <video
                            src={`${API_BASE_URL}${mediaUrl}`}
                            controls
                            className="w-full h-auto max-h-[500px]"
                        />
                    ) : null}
                </div>
            )}

            {/* Interaction Stats */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white">
                            <Heart size={10} className="text-white fill-current" />
                        </div>
                    </div>
                    <span className="text-xs text-gray-500 font-bold">0</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-xs text-gray-500 font-bold hover:underline cursor-pointer">0 Comments</span>
                    <span className="text-xs text-gray-500 font-bold hover:underline cursor-pointer">0 Shares</span>
                </div>
            </div>

            {/* Action Bar */}
            <div className="px-2 py-1 flex items-center gap-1">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all text-gray-500 font-black text-xs uppercase tracking-widest">
                    <Heart size={18} />
                    Like
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all text-gray-500 font-black text-xs uppercase tracking-widest">
                    <MessageCircle size={18} />
                    Comment
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all text-gray-500 font-black text-xs uppercase tracking-widest">
                    <Share2 size={18} />
                    Share
                </button>
            </div>
        </div>
    );
};

export default PostCard;
