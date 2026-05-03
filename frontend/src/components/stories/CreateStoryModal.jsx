import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, MapPin, Globe, Users, Lock, Upload, Loader2 } from 'lucide-react';
import { Button, Card, Input, cn } from '../ui/BaseComponents';
import { createStory } from '../../api/storyApi';
import { toast } from 'react-hot-toast';

const CreateStoryModal = ({ isOpen, onClose, onRefresh }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [location, setLocation] = useState('');
    const [visibility, setVisibility] = useState('PUBLIC');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            toast.error('Please select a picture for your story');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('location', location);
        formData.append('visibility', visibility);
        formData.append('file', imageFile);

        try {
            await createStory(formData);
            toast.success('Story posted successfully!');
            if (onRefresh) onRefresh();
            resetAndClose();
        } catch (err) {
            toast.error('Failed to post story.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setTitle('');
        setContent('');
        setLocation('');
        setVisibility('PUBLIC');
        setImageFile(null);
        setImagePreview(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-surface-950/60 backdrop-blur-md" 
                        onClick={resetAndClose}
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-surface-50 dark:bg-surface-900 w-full max-w-xl rounded-[2.5rem] shadow-premium relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="px-8 py-6 border-b dark:border-surface-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight">Create Story</h2>
                                <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mt-1">Share a moment (24h)</p>
                            </div>
                            <button onClick={resetAndClose} className="w-10 h-10 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center hover:bg-surface-200 transition-all">
                                <X size={20} className="text-surface-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                            <Card className="p-0 overflow-hidden border-dashed border-2 border-surface-200 dark:border-surface-700 bg-surface-100/30 dark:bg-surface-800/30">
                                {imagePreview ? (
                                    <div className="relative aspect-[9/16] max-h-[400px] w-full bg-black">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                        <button 
                                            type="button"
                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors gap-3"
                                    >
                                        <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-500">
                                            <Camera size={24} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black text-surface-900 dark:text-white uppercase tracking-widest">Upload Photo</p>
                                            <p className="text-[10px] text-surface-400 font-bold uppercase tracking-tight">Tap to browse</p>
                                        </div>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageChange} 
                                    accept="image/*" 
                                    className="hidden" 
                                />
                            </Card>

                            <div className="space-y-4">
                                <Input
                                    placeholder="Story Title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="font-bold text-lg border-none bg-surface-100/50 dark:bg-surface-800/50 rounded-2xl px-6 h-14"
                                />
                                
                                <textarea
                                    placeholder="Add a caption..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full bg-surface-100/50 dark:bg-surface-800/50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary-500 text-surface-700 dark:text-surface-300 text-sm resize-none shadow-inner"
                                    rows="3"
                                />

                                <div className="flex flex-wrap gap-3">
                                    <div className="flex-1 flex items-center gap-3 bg-surface-100/50 dark:bg-surface-800/50 px-4 h-12 rounded-2xl shadow-inner">
                                        <MapPin className="w-4 h-4 text-primary-500" />
                                        <input 
                                            placeholder="Location"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="bg-transparent border-none p-0 text-xs font-bold focus:ring-0 w-full uppercase tracking-widest"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 bg-surface-100/50 dark:bg-surface-800/50 px-4 h-12 rounded-2xl shadow-inner min-w-[140px]">
                                        <Globe className="w-4 h-4 text-primary-500" />
                                        <select
                                            value={visibility}
                                            onChange={(e) => setVisibility(e.target.value)}
                                            className="bg-transparent border-none p-0 text-xs font-bold focus:ring-0 w-full uppercase tracking-widest appearance-none cursor-pointer"
                                        >
                                            <option value="PUBLIC">Public</option>
                                            <option value="FRIENDS_ONLY">Friends</option>
                                            <option value="PRIVATE">Private</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-8 border-t dark:border-surface-800 bg-surface-100/30 dark:bg-surface-950/30">
                            <Button 
                                onClick={handleSubmit}
                                className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] shadow-premium"
                                disabled={loading || !imageFile}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Posting...
                                    </div>
                                ) : 'Share to Stories'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateStoryModal;
