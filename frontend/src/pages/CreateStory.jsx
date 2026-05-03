import React, { useState, useRef } from 'react';
import { createStory } from '../api/storyApi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, MapPin, Globe, Users, Lock, X, Upload } from 'lucide-react';
import { Card, Button, Input, cn } from '../components/ui/BaseComponents';
import { toast } from 'react-hot-toast';

const CreateStory = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [location, setLocation] = useState('');
    const [visibility, setVisibility] = useState('PUBLIC');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

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
            navigate('/stories');
        } catch (err) {
            toast.error('Failed to post story.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-surface-900 dark:text-white">Create Story</h1>
                        <p className="text-surface-500 dark:text-surface-400">Share your latest travel moment. Stories disappear after 24 hours.</p>
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/stories')} size="sm">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="p-0 overflow-hidden border-dashed border-2 border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50">
                        {imagePreview ? (
                            <div className="relative aspect-[9/16] max-h-[600px] w-full bg-black">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                <button 
                                    type="button"
                                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-[9/16] max-h-[400px] flex flex-col items-center justify-center cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors gap-4"
                            >
                                <div className="p-4 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                    <Camera className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-surface-900 dark:text-white">Upload a Photo</p>
                                    <p className="text-sm text-surface-500">Tap to browse your gallery</p>
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
                        <div className="relative">
                            <Input
                                placeholder="Add a title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="font-bold text-lg border-none bg-transparent px-0 focus:ring-0"
                            />
                        </div>
                        
                        <textarea
                            placeholder="Add a caption..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-transparent border-none px-0 focus:ring-0 resize-none text-surface-700 dark:text-surface-300"
                            rows="3"
                        />

                        <div className="flex flex-wrap gap-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                            <div className="flex items-center gap-2 bg-surface-100 dark:bg-surface-800 px-3 py-1.5 rounded-full">
                                <MapPin className="w-4 h-4 text-primary-500" />
                                <input 
                                    placeholder="Add location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="bg-transparent border-none p-0 text-sm focus:ring-0 w-24"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value)}
                                    className="bg-surface-100 dark:bg-surface-800 border-none rounded-full px-3 py-1.5 text-sm focus:ring-0 appearance-none cursor-pointer"
                                >
                                    <option value="PUBLIC">🌍 Public</option>
                                    <option value="FRIENDS_ONLY">👥 Friends</option>
                                    <option value="PRIVATE">🔒 Private</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-12 text-lg font-bold"
                        disabled={loading || !imageFile}
                    >
                        {loading ? 'Posting...' : 'Post Story'}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateStory;
