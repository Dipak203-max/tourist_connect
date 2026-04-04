import React, { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { createPost } from '../../api/postApi';
import { Image, Video, Smile, MapPin, Send, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CreatePost = ({ onPostCreated }) => {
    const { user } = useContext(AuthContext);
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [feeling, setFeeling] = useState('');
    const [location, setLocation] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const clearFile = () => {
        setFile(null);
        setFilePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content && !file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('content', content);
        if (file) formData.append('file', file);
        if (feeling) formData.append('feeling', feeling);
        if (location) formData.append('location', location);

        try {
            const newPost = await createPost(formData);
            toast.success('Post shared successfully!');
            setContent('');
            setFile(null);
            setFilePreview(null);
            setFeeling('');
            setLocation('');
            setShowOptions(false);
            if (onPostCreated) onPostCreated(newPost);
        } catch (err) {
            toast.error('Failed to share post.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 p-6 mb-6">
            <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shadow-inner flex-shrink-0 bg-gray-100">
                    <img
                        src={user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${user?.fullName || user?.email}&background=random`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`What's on your mind, ${user?.fullName?.split(' ')[0] || 'Traveler'}?`}
                    className="flex-1 bg-surface-100 dark:bg-surface-800 hover:bg-gray-100 focus:bg-surface-50 dark:focus:bg-surface-900 focus:ring-4 focus:ring-blue-100 border-none rounded-2xl px-5 py-3 text-surface-900 dark:text-surface-100 font-medium transition-all resize-none min-h-[100px]"
                />
            </div>

            {filePreview && (
                <div className="relative mb-4 rounded-xl overflow-hidden bg-gray-100 max-h-80 flex items-center justify-center">
                    {file?.type.startsWith('video') ? (
                        <video src={filePreview} controls className="max-h-80 w-auto" />
                    ) : (
                        <img src={filePreview} alt="Preview" className="max-h-80 w-auto object-contain" />
                    )}
                    <button
                        onClick={clearFile}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {(feeling || location) && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {feeling && (
                        <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-bold border border-pink-100">
                            😊 Feeling {feeling}
                        </span>
                    )}
                    {location && (
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                            📍 at {location}
                        </span>
                    )}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50">
                <div className="flex gap-1 md:gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl cursor-pointer transition-all text-gray-500 font-bold text-sm">
                        <Image size={20} className="text-green-500" />
                        <span className="hidden sm:inline">Photo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl cursor-pointer transition-all text-gray-500 font-bold text-sm">
                        <Video size={20} className="text-red-500" />
                        <span className="hidden sm:inline">Video</span>
                        <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className={`flex items-center gap-2 px-3 py-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all font-bold text-sm ${showOptions ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                    >
                        <Smile size={20} className="text-yellow-500" />
                        <span className="hidden sm:inline">More</span>
                    </button>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || (!content && !file)}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-xl font-black text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
                >
                    {loading ? 'Posting...' : 'Post'}
                    <Send size={16} />
                </button>
            </div>

            {showOptions && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                        <Smile size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="How are you feeling?"
                            value={feeling}
                            onChange={(e) => setFeeling(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-surface-100 dark:bg-surface-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <div className="relative">
                        <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Add location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-surface-100 dark:bg-surface-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePost;
