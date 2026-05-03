import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
    Camera, 
    User, 
    Mail, 
    Plus, 
    Edit2, 
    CheckCircle2, 
    Github, 
    Twitter, 
    Info, 
    X, 
    Trash2,
    AlertCircle,
    MapPin,
    Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, getUserProfile, updateProfile, uploadProfilePicture } from '../api/profileApi';
import { Button, Card, Input, cn } from '../components/ui/BaseComponents';
import ProfileFeed from '../components/posts/ProfileFeed';
import { getUserStories, deleteStory } from '../api/storyApi';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import CreateStoryModal from '../components/stories/CreateStoryModal';

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const profileId = id ? Number(id) : user?.id;
    const isOwner = user?.id === profileId;

    const [profile, setProfile] = useState({
        id: null,
        fullName: '',
        email: '',
        bio: '',
        location: '',
        interests: [],
        profilePictureUrl: '',
        coverPhotoUrl: '',
        joinedDate: ''
    });
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    const [error, setError] = useState(null);
    const [userStories, setUserStories] = useState([]);
    const [selectedStory, setSelectedStory] = useState(null);
    const [storyIndex, setStoryIndex] = useState(0);
    const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

    // Form state for modal
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        location: '',
        interests: '',
        profilePictureUrl: ''
    });

    useEffect(() => {
        if (profileId) {
            loadProfile(profileId);
            loadUserStories(profileId);
        } else {
            setLoading(false);
            setError("Profile not found");
        }
    }, [profileId]);

    const loadUserStories = async (pid) => {
        try {
            const stories = await getUserStories(pid);
            setUserStories(stories);
        } catch (err) {
            console.error("Failed to load stories", err);
        }
    };

    const handleDeleteStory = async (storyId) => {
        if (!window.confirm("Are you sure you want to delete this story?")) return;
        try {
            await deleteStory(storyId);
            toast.success("Story deleted!");
            setSelectedStory(null);
            loadUserStories(profileId);
        } catch (err) {
            toast.error("Failed to delete story");
            console.error(err);
        }
    };

    const loadProfile = async (pid) => {
        setLoading(true);
        setError(null);
        try {
            const data = (isOwner && !id) ? await getMyProfile() : await getUserProfile(pid);
            const profileData = {
                id: data.id,
                fullName: data.fullName || '',
                email: data.email || (id ? '' : (user?.email || '')),
                bio: data.bio || '',
                location: data.location || '',
                interests: data.interests || [],
                profilePictureUrl: data.profilePictureUrl || '',
                coverPhotoUrl: data.coverPhotoUrl || '',
                joinedDate: data.joinedDate || ''
            };
            setProfile(profileData);
            setFormData({
                ...profileData,
                interests: profileData.interests.join(', ')
            });
        } catch (err) {
            console.error("Failed to load profile", err);
            setError("Profile not found");
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const promise = (async () => {
            const interestsArray = formData.interests.split(',').map(i => i.trim()).filter(i => i !== '');
            const updatedData = {
                ...formData,
                interests: interestsArray
            };

            const res = await updateProfile(updatedData);
            setProfile({
                ...updatedData,
                email: profile.email,
                coverPhotoUrl: profile.coverPhotoUrl,
                joinedDate: profile.joinedDate
            });

            if (updateUser) {
                updateUser({
                    fullName: updatedData.fullName,
                    bio: updatedData.bio,
                    location: updatedData.location,
                    interests: interestsArray,
                    profilePictureUrl: updatedData.profilePictureUrl
                });
            }

            setIsEditModalOpen(false);
            return "Profile updated successfully!";
        })();

        toast.promise(promise, {
            loading: 'Saving changes...',
            success: (msg) => msg,
            error: 'Failed to update profile.'
        });
    };

    const fileInputRef = React.useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const promise = (async () => {
            const fileUrl = await uploadProfilePicture(file);
            const fullUrl = `http://localhost:8080${fileUrl}`;
            
            setProfile(prev => ({ ...prev, profilePictureUrl: fullUrl }));
            
            if (updateUser) {
                updateUser({ ...user, profilePictureUrl: fullUrl });
            }
            
            return "Profile picture updated!";
        })();

        toast.promise(promise, {
            loading: 'Uploading...',
            success: (msg) => msg,
            error: 'Failed to upload image.'
        });
    };

    const handleMessage = () => {
        if (!profile.id) return;
        navigate('/chat', { state: { openChatWith: profile.id } });
    };

    const formatJoinedDate = (dateString) => {
        if (!dateString) return "Joined May 2024";
        const date = new Date(dateString);
        return `Joined ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    };

    const getProfileImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8080${url}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !profileId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <Card className="p-10 max-w-sm border-none shadow-premium">
                    <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <AlertCircle className="text-rose-500" size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-surface-900 dark:text-white mb-2 tracking-tight">Profile Not Found</h2>
                    <p className="text-muted font-medium mb-8">
                        The user you are looking for doesn't exist or is unavailable at the moment.
                    </p>
                    <Button
                        onClick={() => navigate(-1)}
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                    >
                        Go Back
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Top Section: Cover Photo */}
            <Card className="overflow-hidden border-none shadow-premium bg-surface-50 dark:bg-surface-900 dark:bg-surface-900 p-0" hover={false}>
                <div className="h-48 md:h-80 w-full bg-gradient-to-br from-primary-600 to-indigo-700 relative group">
                    {profile.coverPhotoUrl ? (
                        <img src={profile.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 bg-surface-950/10"></div>
                    )}
                    {isOwner && (
                        <button className="absolute bottom-4 right-4 bg-surface-50 dark:bg-surface-900/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-surface-50 dark:hover:bg-surface-900/20">
                            <Camera size={16} />
                            Change Cover
                        </button>
                    )}
                </div>

                <div className="px-6 md:px-12 pb-8">
                    <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12 md:-mt-16 mb-8">
                        <div className="relative group shrink-0">
                            <div 
                                onClick={() => userStories.length > 0 && setSelectedStory(userStories[0])}
                                className={cn(
                                    "w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] border-8 border-white dark:border-surface-900 overflow-hidden bg-surface-100 dark:bg-surface-800 shadow-premium relative z-10 transition-transform",
                                    userStories.length > 0 ? "cursor-pointer ring-4 ring-primary-500 ring-offset-4 dark:ring-offset-surface-900 animate-pulse-slow scale-[1.02]" : "hover:scale-[1.02]"
                                )}
                            >
                                <img
                                    src={getProfileImageUrl(profile.profilePictureUrl) || `https://ui-avatars.com/api/?name=${profile.fullName || profile.email}&background=random&size=200`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                                {userStories.length > 0 && (
                                    <div className="absolute inset-0 bg-primary-500/10 flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest">View Story</div>
                                    </div>
                                )}
                            </div>
                            {isOwner && (
                                <div className="absolute bottom-2 right-2 z-20 flex flex-col gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="bg-primary-600 text-white p-2.5 rounded-2xl shadow-xl hover:bg-primary-700 transition-all"
                                        title="Upload Profile Picture"
                                    >
                                        <Camera size={18} />
                                    </button>
                                    <button
                                        onClick={() => setIsStoryModalOpen(true)}
                                        className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all"
                                        title="Create Story"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-black text-surface-900 dark:text-white tracking-tight truncate">
                                    {profile.fullName || "Member Name"}
                                </h1>
                                {user?.role === 'ADMIN' && <CheckCircle2 size={22} className="text-primary-500 shrink-0" />}
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                    <User size={12} />
                                    {profile.role || (isOwner ? user?.role : 'Explorer')}
                                </div>
                                <span className="text-surface-400 dark:text-surface-500 font-medium text-sm truncate">{profile.email}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {isOwner ? (
                                <>
                                    <Button
                                        onClick={() => setIsStoryModalOpen(true)}
                                        className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 shadow-premium"
                                    >
                                        <Plus size={18} />
                                        Create Story
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 border-surface-200 dark:border-surface-800"
                                    >
                                        <Edit2 size={16} />
                                        Settings
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={handleMessage}
                                    className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 shadow-premium"
                                >
                                    <Mail size={18} />
                                    Send Message
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 md:gap-8 border-t dark:border-surface-800 pt-2 overflow-x-auto no-scrollbar">
                        {['Posts', 'About', 'Friends', 'Photos', 'Videos'].map((tab) => {
                            const tabKey = tab.toLowerCase();
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tabKey)}
                                    className={cn(
                                        "px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                                        activeTab === tabKey ? "text-primary-600 dark:text-primary-400" : "text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                                    )}
                                >
                                    {tab}
                                    {activeTab === tabKey && (
                                        <motion.div 
                                            layoutId="profileTab"
                                            className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Card>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Intro */}
                <div className="w-full lg:w-96 space-y-8">
                    <Card className="p-8 border-none shadow-premium bg-surface-50 dark:bg-surface-900 dark:bg-surface-900" hover={false}>
                        <h2 className="text-xl font-black text-surface-900 dark:text-white mb-6 tracking-tight">Intro</h2>
                        <div className="space-y-6">
                            <p className="text-surface-600 dark:text-surface-400 font-medium leading-relaxed italic text-center">
                                "{profile.bio || "Add a bio to let others know more about you."}"
                            </p>
                            
                            <hr className="border-surface-100 dark:border-surface-800" />

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                                    <MapPin size={18} className="text-primary-500" />
                                    <span className="text-xs font-black uppercase tracking-widest">Lives in {profile.location || "Nepal"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                                    <Calendar size={18} className="text-primary-500" />
                                    <span className="text-xs font-black uppercase tracking-widest">{formatJoinedDate(profile.joinedDate)}</span>
                                </div>
                            </div>

                            {isOwner && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-surface-100 dark:border-surface-800"
                                >
                                    Edit Details
                                </Button>
                            )}

                            <div className="flex gap-4 pt-2">
                                <button className="w-10 h-10 rounded-xl bg-surface-50 dark:bg-surface-800 flex items-center justify-center text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors">
                                    <Github size={20} />
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-surface-50 dark:bg-surface-800 flex items-center justify-center text-surface-400 hover:text-blue-400 transition-colors">
                                    <Twitter size={20} />
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* Interests Panel */}
                    <Card className="p-8 border-none shadow-premium bg-surface-50 dark:bg-surface-900 dark:bg-surface-900" hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-surface-900 dark:text-white tracking-tight">Interests</h2>
                            {isOwner && (
                                <button onClick={() => setIsEditModalOpen(true)} className="text-primary-600 font-black text-[10px] uppercase tracking-widest hover:underline">Edit</button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.interests.length > 0 ? (
                                profile.interests.map((interest, i) => (
                                    <span key={i} className="bg-primary-500/10 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary-500/20">
                                        {interest}
                                    </span>
                                ))
                            ) : (
                                <p className="text-surface-400 text-xs italic text-center w-full py-4">Set your adventure preferences...</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Content */}
                <div className="flex-1 min-w-0">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {activeTab === 'posts' && <ProfileFeed userId={profileId} showPostBox={isOwner} />}
                        {activeTab === 'about' && (
                            <Card className="p-10 border-none shadow-premium bg-surface-50 dark:bg-surface-900 dark:bg-surface-900" hover={false}>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-600">
                                        <Info size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight">About {profile.fullName?.split(' ')[0]}</h2>
                                </div>
                                <div className="space-y-10">
                                    <div>
                                        <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-4">Bio & Overview</h3>
                                        <p className="text-surface-600 dark:text-surface-400 font-medium leading-relaxed max-w-2xl">{profile.bio || "No summary provided."}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="p-6 rounded-2xl app-bg/50 border border-surface-100 dark:border-surface-800">
                                            <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-3">Live Location</h3>
                                            <div className="flex items-center gap-3 text-surface-900 dark:text-white font-black text-sm">
                                                <MapPin size={18} className="text-primary-500" />
                                                {profile.location || "Nepal"}
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-2xl app-bg/50 border border-surface-100 dark:border-surface-800">
                                            <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-3">Contact Email</h3>
                                            <div className="flex items-center gap-3 text-surface-900 dark:text-white font-black text-sm lowercase tracking-tight">
                                                <Mail size={18} className="text-primary-500" />
                                                {profile.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                        {activeTab === 'friends' && <FriendsSection userId={profileId} onFriendClick={(id) => navigate(`/profile/${id}`)} />}
                        {activeTab === 'photos' && <MediaGrid type="IMAGE" userId={profileId} />}
                        {activeTab === 'videos' && <MediaGrid type="VIDEO" userId={profileId} />}
                    </motion.div>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-surface-950/60 backdrop-blur-md" 
                            onClick={() => setIsEditModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-900 w-full max-w-2xl rounded-[2.5rem] shadow-premium relative z-10 overflow-hidden"
                        >
                            <div className="px-10 py-8 border-b dark:border-surface-800 flex items-center justify-between bg-surface-50/50 dark:bg-surface-950/50">
                                <div>
                                    <h2 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight">Edit Profile</h2>
                                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mt-1">Personnel Information Settings</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 bg-surface-50 dark:bg-surface-900 dark:bg-surface-800 rounded-full flex items-center justify-center hover:bg-surface-100 transition-all">
                                    <X size={20} className="text-surface-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                                <div className="space-y-6">
                                    <Input
                                        label="Full Name"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleFormChange}
                                        placeholder="Your full name"
                                        required
                                        icon={<User className="w-4 h-4" />}
                                    />

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest ml-1">Professional Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleFormChange}
                                            rows="4"
                                            placeholder="Tell us about yourself..."
                                            className="w-full px-5 py-4 bg-surface-50 dark:bg-surface-800 border-2 border-transparent focus:border-primary-500 focus:bg-surface-50 dark:focus:bg-surface-900 dark:focus:bg-surface-900 rounded-2xl text-surface-900 dark:text-white font-medium text-sm transition-all resize-none shadow-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Location"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleFormChange}
                                            placeholder="e.g. Kathmandu"
                                            icon={<MapPin className="w-4 h-4" />}
                                        />
                                        <Input
                                            label="Avatar URL"
                                            name="profilePictureUrl"
                                            value={formData.profilePictureUrl}
                                            onChange={handleFormChange}
                                            placeholder="Image source link"
                                            icon={<Camera className="w-4 h-4" />}
                                        />
                                    </div>

                                    <Input
                                        label="Interests"
                                        name="interests"
                                        value={formData.interests}
                                        onChange={handleFormChange}
                                        placeholder="Tag interests separated by commas"
                                        icon={<Plus className="w-4 h-4" />}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-surface-100 dark:border-surface-800"
                                    >
                                        Discard
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-premium"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Story Viewer Modal */}
            <AnimatePresence>
                {selectedStory && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-8"
                    >
                        <div className="relative w-full max-w-lg aspect-[9/16] bg-surface-900 rounded-3xl overflow-hidden shadow-2xl">
                            {/* Progress Bars */}
                            <div className="absolute top-4 inset-x-4 flex gap-1 z-20">
                                {userStories.map((_, i) => (
                                    <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                        {i === storyIndex && (
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 5, ease: "linear" }}
                                                onAnimationComplete={() => {
                                                    if (storyIndex < userStories.length - 1) {
                                                        setStoryIndex(storyIndex + 1);
                                                        setSelectedStory(userStories[storyIndex + 1]);
                                                    } else {
                                                        setSelectedStory(null);
                                                    }
                                                }}
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
                                        <img 
                                            src={getProfileImageUrl(profile.profilePictureUrl) || `https://ui-avatars.com/api/?name=${profile.fullName || profile.email}`} 
                                            alt="" 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{profile.fullName}</p>
                                        <p className="text-white/60 text-xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> 24h
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isOwner && (
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
                                        src={`http://localhost:8080${selectedStory.mediaUrls[0]}`} 
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CreateStoryModal 
                isOpen={isStoryModalOpen} 
                onClose={() => setIsStoryModalOpen(false)} 
                onRefresh={() => loadUserStories(profileId)} 
            />
        </div>
    );
};

const FriendsSection = ({ userId, onFriendClick }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            if (!userId) return;
            try {
                const { getUserFriends } = await import('../api/friendApi');
                const data = await getUserFriends(userId);
                setFriends(data);
            } catch (err) {
                console.error("Failed to fetch friends", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFriends();
    }, [userId]);

    if (loading) return <div className="text-center p-8 font-bold text-muted">Loading friends...</div>;

    return (
        <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-900 rounded-2xl shadow-premium border border-surface-100 dark:border-surface-800 p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-black text-surface-900 dark:text-white mb-6 tracking-tight">Friends</h2>
            {friends.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {friends.map(friend => (
                        <div
                            key={friend.id}
                            onClick={() => onFriendClick && onFriendClick(friend.id)}
                            className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-2xl flex flex-col items-center gap-3 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all cursor-pointer group"
                        >
                            <img
                                src={friend.profilePictureUrl ? (friend.profilePictureUrl.startsWith('http') ? friend.profilePictureUrl : `http://localhost:8080${friend.profilePictureUrl}`) : `https://ui-avatars.com/api/?name=${friend.fullName || friend.email}&background=random`}
                                className="w-16 h-16 rounded-full shadow-inner"
                                alt="Friend"
                            />
                            <span className="font-bold text-xs text-center text-surface-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase tracking-tight">{friend.fullName || friend.email}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-surface-400">
                    <p className="font-bold">No friends added yet.</p>
                </div>
            )}
        </div>
    );
};

const MediaGrid = ({ type, userId }) => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMedia = async () => {
            if (!userId) return;
            try {
                const { getUserMediaPosts } = await import('../api/postApi');
                const data = await getUserMediaPosts(userId, type);
                setMedia(data);
            } catch (err) {
                console.error("Failed to fetch media", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMedia();
    }, [userId, type]);

    if (loading) return <div className="text-center p-8 font-bold text-surface-400">Loading {type.toLowerCase()}...</div>;

    return (
        <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-900 rounded-2xl shadow-premium border border-surface-100 dark:border-surface-800 p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-black text-surface-900 dark:text-white mb-6 tracking-tight">{type === 'IMAGE' ? 'Photos' : 'Videos'}</h2>
            {media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {media.map(post => (
                        <div key={post.id} className="aspect-square bg-surface-100 dark:bg-surface-800 rounded-2xl overflow-hidden hover:scale-105 transition-all">
                            {type === 'IMAGE' ? (
                                <img src={`http://localhost:8080${post.mediaUrl}`} className="w-full h-full object-cover" alt="Media" />
                            ) : (
                                <video src={`http://localhost:8080${post.mediaUrl}`} className="w-full h-full object-cover" />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-surface-400">
                    <p className="font-bold">No {type.toLowerCase()} shared yet.</p>
                </div>
            )}
        </div>
    );
};

export default Profile;
