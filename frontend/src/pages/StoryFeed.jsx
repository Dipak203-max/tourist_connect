import React, { useState, useEffect } from 'react';
import { getPublicFeed, getFriendFeed, getMyStories, deleteStory } from '../api/storyApi';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight, MapPin, Clock, User, Trash2 } from 'lucide-react';
import { Button, cn } from '../components/ui/BaseComponents';
import CreateStoryModal from '../components/stories/CreateStoryModal';

import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const StoryFeed = () => {
    const { user } = useAuth();
    const [publicStories, setPublicStories] = useState([]);
    const [friendStories, setFriendStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStory, setSelectedStory] = useState(null);
    const [storyIndex, setStoryIndex] = useState(0);
    const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
    const navigate = useNavigate();

    const API_BASE_URL = "http://localhost:8080";

    const getFullUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = async () => {
        try {
            const [publicData, friendData, myData] = await Promise.all([
                getPublicFeed(),
                getFriendFeed(),
                getMyStories()
            ]);
            setPublicStories(publicData);
            setFriendStories(friendData);
            setMyStories(myData);
        } catch (err) {
            console.error("Failed to load stories", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStory = async (storyId) => {
        if (!window.confirm("Are you sure you want to delete this story?")) return;
        try {
            await deleteStory(storyId);
            toast.success("Story deleted!");
            setSelectedStory(null);
            loadStories();
        } catch (err) {
            toast.error("Failed to delete story");
            console.error(err);
        }
    };

    const [myStories, setMyStories] = useState([]);

    const allStories = [...myStories, ...friendStories, ...publicStories].reduce((acc, story) => {
        if (!acc.find(s => s.id === story.id)) acc.push(story);
        return acc;
    }, []);

    const handleOpenStory = (story, index) => {
        setSelectedStory(story);
        setStoryIndex(index);
    };

    const handleNext = () => {
        if (storyIndex < allStories.length - 1) {
            setStoryIndex(storyIndex + 1);
            setSelectedStory(allStories[storyIndex + 1]);
        } else {
            setSelectedStory(null);
        }
    };

    const handlePrev = () => {
        if (storyIndex > 0) {
            setStoryIndex(storyIndex - 1);
            setSelectedStory(allStories[storyIndex - 1]);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-surface-900 dark:text-white tracking-tight">Stories</h2>
                <Button onClick={() => setIsStoryModalOpen(true)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Share Moment
                </Button>
            </div>

            {/* Stories Horizontal List */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                {/* Create Story Bubble */}
                <div 
                    onClick={() => setIsStoryModalOpen(true)}
                    className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
                >
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-surface-300 dark:border-surface-600 flex items-center justify-center group-hover:border-primary-500 transition-colors">
                        <Plus className="w-6 h-6 text-surface-400 group-hover:text-primary-500" />
                    </div>
                    <span className="text-xs font-bold text-surface-500">Your Story</span>
                </div>

                {allStories.map((story, index) => (
                    <div 
                        key={story.id} 
                        onClick={() => handleOpenStory(story, index)}
                        className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
                    >
                        <div className="w-20 h-20 rounded-full p-1 border-2 border-primary-500 group-hover:scale-105 transition-transform bg-white dark:bg-surface-800 overflow-hidden">
                            <div className="w-full h-full rounded-full overflow-hidden bg-surface-100 dark:bg-surface-700">
                                {story.mediaUrls?.[0] ? (
                                    <img src={getFullUrl(story.mediaUrls[0])} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary-500">
                                        <User className="w-8 h-8" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <span className="text-xs font-bold text-surface-900 dark:text-white truncate w-20 text-center">
                            {story.authorName}
                        </span>
                    </div>
                ))}

                {allStories.length === 0 && (
                    <div className="flex items-center text-surface-400 text-sm font-medium h-20 px-4">
                        No stories yet. Start the trend!
                    </div>
                )}
            </div>

            {/* Story Viewer Modal */}
            <AnimatePresence>
                {selectedStory && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-8"
                    >
                        <div className="relative w-full max-w-lg aspect-[9/16] bg-surface-900 rounded-3xl overflow-hidden shadow-2xl">
                            {/* Progress Bars */}
                            <div className="absolute top-4 inset-x-4 flex gap-1 z-20">
                                {allStories.map((_, i) => (
                                    <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                        {i === storyIndex && (
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 5, ease: "linear" }}
                                                onAnimationComplete={handleNext}
                                                className="h-full bg-white"
                                            />
                                        )}
                                        {i < storyIndex && <div className="h-full bg-white" />}
                                    </div>
                                ))}
                            </div>

                            {/* Header */}
                            <div className="absolute top-8 inset-x-4 flex items-center justify-between z-40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-surface-700">
                                        {selectedStory.profilePictureUrl ? (
                                            <img src={getFullUrl(selectedStory.profilePictureUrl)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/50">
                                                <User className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{selectedStory.authorName}</p>
                                        <p className="text-white/60 text-xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> 24h
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedStory.userId === user?.id && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteStory(selectedStory.id);
                                            }} 
                                            className="p-2 text-red-400 hover:text-red-500 hover:bg-white/10 rounded-full transition-all relative z-50"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedStory(null);
                                        }} 
                                        className="p-2 text-white/70 hover:text-white relative z-50"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Main Media */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                {selectedStory.mediaUrls?.[0] ? (
                                    <img 
                                        src={getFullUrl(selectedStory.mediaUrls[0])} 
                                        alt="" 
                                        className="w-full h-full object-contain md:object-cover"
                                    />
                                ) : (
                                    <div className="text-white text-center p-8">
                                        <h3 className="text-2xl font-bold">{selectedStory.title}</h3>
                                        <p className="mt-4">{selectedStory.content}</p>
                                    </div>
                                )}
                            </div>

                            {/* Content / Caption */}
                            <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                                {selectedStory.location && (
                                    <div className="flex items-center gap-1 text-white/80 text-xs mb-2">
                                        <MapPin className="w-3 h-3" /> {selectedStory.location}
                                    </div>
                                )}
                                <h3 className="text-white font-bold text-lg leading-tight mb-2">
                                    {selectedStory.title}
                                </h3>
                                <p className="text-white/90 text-sm line-clamp-3">
                                    {selectedStory.content}
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="absolute inset-y-0 left-0 w-1/4 flex items-center justify-start p-4 z-20 group">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                    className="p-2 bg-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                                    disabled={storyIndex === 0}
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="absolute inset-y-0 right-0 w-1/4 flex items-center justify-end p-4 z-20 group">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                    className="p-2 bg-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CreateStoryModal 
                isOpen={isStoryModalOpen} 
                onClose={() => setIsStoryModalOpen(false)} 
                onRefresh={loadStories} 
            />
        </div>
    );
};

export default StoryFeed;
