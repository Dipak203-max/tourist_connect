import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { getDetailedGuideProfile } from '../api/guideApi';
import { getFriendshipStatus, sendFriendRequest } from '../api/friendApi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Grid, MessageSquare, Star, ArrowRight } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

// New Components
import GuideHero from '../components/guide/profile/GuideHero';
import GuideStatsStrip from '../components/guide/profile/GuideStatsStrip';
import GuideAbout from '../components/guide/profile/GuideAbout';
import TourCard from '../components/guide/profile/TourCard';
import GuideReviewList from '../components/guide/profile/GuideReviewList';
import GuideGallery from '../components/guide/profile/GuideGallery';
import BookingSidebar from '../components/guide/profile/BookingSidebar';
import GuideContact from '../components/guide/profile/GuideContact';
import PageLoader from '../components/common/PageLoader';

const GuidePublicProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    // Determine which ID to fetch: URL param or self
    const effectiveUserId = userId || user?.id;
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [friendStatus, setFriendStatus] = useState('NONE');
    const [selectedTour, setSelectedTour] = useState(null);

    useEffect(() => {
        if (!effectiveUserId) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const res = await getDetailedGuideProfile(effectiveUserId);

// 🔥 FETCH TOURS SEPARATELY
const toursRes = await axiosInstance.get(`/tours/guide/${effectiveUserId}`);

const fullData = {
    ...res,
    tours: toursRes.data
};

setData(fullData);


                if (user && user.id != effectiveUserId) {
                    const statusRes = await getFriendshipStatus(effectiveUserId);
                    setFriendStatus(statusRes.status);
                }
            } catch (err) {
                console.error("Failed to load guide profile", err);
                setError("Could not load guide profile. Reference ID: " + effectiveUserId);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [effectiveUserId, user]);

    const handleMessageClick = () => {
        navigate('/chat', { state: { openChatWith: userId } });
    };

    const handleBookClick = (guests, date) => {
    navigate(`/tourist/book/${userId}`, { 
        state: { 
            tourId: selectedTour ? Number(selectedTour.id) : null,
            date: date, 
            guests: Number(guests) 
        } 
    });
};

    if (loading) return <PageLoader />;
    if (error) return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-8 rounded-3xl text-center max-w-md">
                <h2 className="text-2xl font-black text-red-600 dark:text-red-400 mb-2 uppercase tracking-tight">Profile Not Found</h2>
                <p className="text-red-500 font-bold mb-6 italic">"{error}"</p>
                <button 
                  onClick={() => navigate(-1)} 
                  className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200 uppercase tracking-widest text-xs"
                >
                  Go Back
                </button>
            </div>
        </div>
    );

    const { guide, tours, reviews, stats, commissionPercent } = data;
    const isOwner = user && user.id == guide.userId;

    return (
        <div className="min-h-screen app-bg pb-20">
            <GuideHero 
                guide={guide} 
                onMessage={handleMessageClick}
                onBook={handleBookClick}
                isOwner={isOwner}
                onEdit={() => navigate('/guide/profile/edit')}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stats Strip */}
                <GuideStatsStrip stats={{...stats, verified: guide.verified}} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2">
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <GuideAbout 
                                bio={guide.bio} 
                                certifications={guide.certifications} 
                                languages={guide.languages} 
                            />
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-16"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
                                        <Grid className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100 uppercase tracking-tight">Services & Tours</h2>
                                </div>
                                <span className="text-xs font-black text-surface-400 uppercase tracking-widest">{tours.length} Experiences</span>
                            </div>

                            <div 
    onClick={() => setSelectedTour(null)}
    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
        selectedTour === null 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-gray-200'
    }`}
>
    <h3 className="font-bold text-lg">Guide Only (No Tour)</h3>
    <p className="text-sm text-gray-500">
        Book the guide at base rate (${guide.price}/day)
    </p>
</div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {tours.map(tour => (
                                    <TourCard 
                                        key={tour.id} 
                                        tour={tour} 
                                        isSelected={selectedTour?.id === tour.id}
                                        onSelect={() => setSelectedTour(tour)}
                                    />
                                ))}
                                {tours.length === 0 && (
                                    <div className="col-span-full p-12 bg-surface-50 dark:bg-surface-900 rounded-[2rem] border-2 border-dashed border-surface-200 dark:border-surface-800 text-center">
                                        <p className="text-surface-400 font-bold italic">This guide hasn't uploaded any tour packages yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <GuideReviewList stats={stats} reviews={reviews} />
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <GuideGallery images={guide.galleryImages} />
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <GuideContact guide={guide} />
                        </motion.section>
                    </div>

                    {/* Sidebar Column */}
                    <div className="relative hidden lg:block">
                        <BookingSidebar 
                            guide={guide}
                            selectedTour={selectedTour} 
                            onBook={handleBookClick} 
                        />
                    </div>
                </div>
            </main>

            {/* Mobile Sticky Booking Footer (Only visible on MD and below) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-t border-surface-200 dark:border-surface-800 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-black text-surface-900 dark:text-surface-100">
                            ${selectedTour?.pricePerPerson || guide.price || 0}
                            <span className="text-sm font-bold text-surface-400 italic">/{selectedTour ? 'person' : 'day'}</span>
                        </p>
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest truncate max-w-[150px]">
                            {selectedTour?.title || "Daily Base Rate"}
                        </p>
                    </div>
                    <button 
                        onClick={handleBookClick}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-200 dark:shadow-none transition-all active:scale-95"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuidePublicProfile;
