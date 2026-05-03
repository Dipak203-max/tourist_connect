import React, { useState } from 'react';
import { MoreHorizontal, MessageCircle, Share2, Heart, MapPin, Smile, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toggleLike, addComment, deletePost } from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const PostCard = ({ post, onPostDeleted }) => {
    const { id, userId, username, fullName, profilePictureUrl, content, mediaUrl, mediaType, location, feeling, createdAt, likeCount: initialLikeCount, commentCount: initialCommentCount, isLikedByCurrentUser, comments: initialComments } = post;
    const { user: currentUser } = useAuth();
    const API_BASE_URL = "http://localhost:8080";

    const getFullUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    const [isLiked, setIsLiked] = useState(isLikedByCurrentUser);
    const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(initialComments || []);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const isOwner = currentUser?.id === userId;

    const handleLike = async () => {
        // Optimistic UI
        const previousLiked = isLiked;
        const previousCount = likeCount;

        setIsLiked(!previousLiked);
        setLikeCount(previousLiked ? previousCount - 1 : previousCount + 1);

        try {
            await toggleLike(id);
        } catch (error) {
            // Revert on error
            setIsLiked(previousLiked);
            setLikeCount(previousCount);
            toast.error("Failed to update like");
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const comment = await addComment(id, newComment);
            setComments([comment, ...comments]);
            setNewComment("");
            toast.success("Comment added");
        } catch (error) {
            toast.error("Failed to add comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            await deletePost(id);
            toast.success("Post deleted");
            if (onPostDeleted) onPostDeleted(id);
        } catch (error) {
            toast.error("Failed to delete post");
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/posts/${id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 mb-6 overflow-hidden animate-in fade-in duration-500">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shadow-inner bg-gray-100">
                        <img
                            src={getFullUrl(profilePictureUrl) || `https://ui-avatars.com/api/?name=${fullName || username || 'User'}&background=random`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <div className="flex items-center flex-wrap gap-x-1">
                            <h3 className="font-black text-surface-900 dark:text-surface-100 text-sm hover:underline cursor-pointer">{fullName || username}</h3>
                            {feeling && (
                                <span className="text-gray-500 text-xs font-medium"> is feeling <span className="text-surface-900 dark:text-surface-100 font-bold">{feeling}</span></span>
                            )}
                            {location && (
                                <span className="text-gray-500 text-xs font-medium"> at <span className="text-surface-900 dark:text-surface-100 font-bold">{location}</span></span>
                            )}
                        </div>
                        <p className="text-[11px] text-muted font-bold uppercase tracking-wider">
                            {createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : 'Just now'}
                        </p>
                    </div>
                </div>
                
                <div className="relative">
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-full text-muted transition-all"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 z-10 py-1">
                            {isOwner && (
                                <button 
                                    onClick={() => {
                                        setShowMenu(false);
                                        handleDelete();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Delete Post
                                </button>
                            )}
                            <button 
                                onClick={() => {
                                    setShowMenu(false);
                                    handleShare();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                            >
                                <Share2 size={16} />
                                Share
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            {content && (
                <div className="px-4 pb-4 text-sm text-gray-800 dark:text-surface-200 leading-relaxed font-medium whitespace-pre-wrap">
                    {content}
                </div>
            )}

            {/* Media */}
            {mediaUrl && (
                <div className="bg-surface-100 dark:bg-surface-800 border-y border-gray-50 dark:border-surface-800">
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
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50 dark:border-surface-800">
                <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                        <div className={`w-5 h-5 rounded-full ${likeCount > 0 ? 'bg-red-500' : 'bg-gray-300'} flex items-center justify-center border-2 border-white dark:border-surface-900`}>
                            <Heart size={10} className="text-white fill-current" />
                        </div>
                    </div>
                    <span className="text-xs text-gray-500 font-bold">{likeCount}</span>
                </div>
                <div className="flex gap-4">
                    <span 
                        onClick={() => setShowComments(!showComments)}
                        className="text-xs text-gray-500 font-bold hover:underline cursor-pointer"
                    >
                        {comments.length} Comments
                    </span>
                    <span className="text-xs text-gray-500 font-bold">0 Shares</span>
                </div>
            </div>

            {/* Action Bar */}
            <div className="px-2 py-1 flex items-center gap-1">
                <button 
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                >
                    <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                    {isLiked ? 'Liked' : 'Like'}
                </button>
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all text-gray-500 font-black text-xs uppercase tracking-widest"
                >
                    <MessageCircle size={18} />
                    Comment
                </button>
                <button 
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all text-gray-500 font-black text-xs uppercase tracking-widest"
                >
                    <Share2 size={18} />
                    Share
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="border-t border-gray-50 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50">
                    {/* Comment Input */}
                    <form onSubmit={handleComment} className="p-4 flex gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden shadow-inner bg-gray-100 flex-shrink-0">
                            <img
                                src={getFullUrl(currentUser?.profilePictureUrl) || `https://ui-avatars.com/api/?name=${currentUser?.fullName || 'User'}&background=random`}
                                alt="My Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all pr-10"
                            />
                            <button 
                                type="submit"
                                disabled={!newComment.trim() || isSubmitting}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary-500 disabled:text-gray-300 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="px-4 pb-4 space-y-4 max-h-[300px] overflow-y-auto">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 animate-in slide-in-from-top-2 duration-300">
                                    <div className="w-8 h-8 rounded-full overflow-hidden shadow-inner bg-gray-100 flex-shrink-0">
                                        <img
                                            src={getFullUrl(comment.profilePictureUrl) || `https://ui-avatars.com/api/?name=${comment.fullName || 'User'}&background=random`}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-surface-800 p-3 rounded-2xl shadow-sm border border-surface-100 dark:border-surface-700">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-bold text-xs text-surface-900 dark:text-surface-100">{comment.fullName || comment.username}</h4>
                                            <span className="text-[10px] text-muted font-bold uppercase">
                                                {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-700 dark:text-surface-300 leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-xs text-gray-500 font-medium">
                                No comments yet. Be the first to comment!
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;
