import React, { useState, useEffect } from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { getFeed, getUserPosts } from '../../api/postApi';
import { Loader2, Newspaper } from 'lucide-react';

const ProfileFeed = ({ userId, showPostBox }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const data = userId ? await getUserPosts(userId) : await getFeed();
            setPosts(data);
        } catch (err) {
            console.error("Failed to fetch posts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-muted">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="font-bold text-sm uppercase tracking-widest">Loading Stories...</p>
            </div>
        );
    }

    const handlePostCreated = (newPost) => {
        if (newPost) {
            setPosts(prev => [newPost, ...prev]);
        } else {
            fetchPosts();
        }
    };

    return (
        <div className="space-y-6">
            {showPostBox && <CreatePost onPostCreated={handlePostCreated} />}

            {posts.length > 0 ? (
                posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))
            ) : (
                <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 p-12 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Newspaper size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-black text-surface-900 dark:text-surface-100 mb-1">No Posts Yet</h3>
                    <p className="text-gray-500 font-medium text-sm max-w-xs mx-auto">
                        This wall is waiting for your travel stories!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProfileFeed;
