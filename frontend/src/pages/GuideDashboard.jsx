import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import FeaturedDestinations from '../components/destinations/FeaturedDestinations';
import { Button, Card } from '../components/ui/BaseComponents';
import { MapPin, ShieldCheck, Users, Radio } from 'lucide-react';
import { cn } from '../utils/cn';

const GuideDashboard = () => {
    const { user } = useContext(AuthContext);
    const [updatingLocation, setUpdatingLocation] = useState(false);
    const [locationStatus, setLocationStatus] = useState(null);

    const updateLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus({ type: 'error', message: "Geolocation is not supported by your browser." });
            return;
        }

        setUpdatingLocation(true);
        setLocationStatus({ type: 'info', message: "Getting your location..." });

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    let city = "Unknown Location";
                    try {
                        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        if (geoRes.data && geoRes.data.address) {
                            city = geoRes.data.address.city || geoRes.data.address.town || geoRes.data.address.village || "Unknown Location";
                        }
                    } catch (e) {
                        console.warn("Could not reverse geocode", e);
                    }

                    await axiosInstance.post('/guide-profile/location', {
                        latitude,
                        longitude,
                        city
                    });

                    setLocationStatus({ type: 'success', message: "Location updated successfully! Tourists can now find you." });
                } catch (error) {
                    console.error("Failed to update location", error);
                    setLocationStatus({ type: 'error', message: "Failed to save location to server." });
                } finally {
                    setUpdatingLocation(false);
                }
            },
            (error) => {
                console.error("Geolocation error", error);
                let msg = "Unable to retrieve your location.";
                if (error.code === 1) msg = "Location access denied. Please enable permission.";
                setLocationStatus({ type: 'error', message: msg });
                setUpdatingLocation(false);
            }
        );
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20"
        >
            {/* Header / Welcome */}
            <Card className="p-10 border-none bg-gradient-to-br from-surface-50 to-white dark:from-surface-900 dark:to-surface-950 shadow-premium">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
                            <Radio className="w-3 h-3 animate-pulse" />
                            Guide Portal Active
                        </div>
                        <h1 className="text-4xl font-black text-surface-900 dark:text-white tracking-tight mb-4">
                            Welcome Back, <span className="text-primary-600">{user?.email?.split('@')[0]}!</span>
                        </h1>
                        <p className="text-muted font-medium leading-relaxed">
                            Manage your profile, handle verification, and coordinate with tourists. Your journey as a professional guide is just getting started.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <NavLink to="/guide/verification">
                            <Button variant="primary" size="lg" className="rounded-2xl gap-2 h-14 px-8">
                                <ShieldCheck className="w-5 h-5" />
                                Get Verified
                            </Button>
                        </NavLink>
                        <NavLink to="/guide/profile/edit">
                            <Button variant="secondary" size="lg" className="rounded-2xl gap-2 h-14 px-8 border-surface-200 dark:border-surface-800">
                                <Radio className="w-5 h-5 text-primary-500" />
                                Edit Profile
                            </Button>
                        </NavLink>
                        <NavLink to="/friends">
                            <Button variant="secondary" size="lg" className="rounded-2xl gap-2 h-14 px-8 border-surface-200 dark:border-surface-800">
                                <Users className="w-5 h-5" />
                                Community
                            </Button>
                        </NavLink>
                    </div>
                </div>
            </Card>

            {/* Featured Destinations Section */}
            <FeaturedDestinations />

            {/* Location Update Section */}
            <Card className="max-w-2xl mx-auto p-10 text-center relative overflow-hidden group">
                {/* Decorative background circle */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-3xl flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400">
                        <MapPin className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-surface-900 dark:text-white mb-2">Service Radius</h3>
                    <p className="text-muted font-medium mb-8 max-w-sm">
                        Update your live coordinates to remain visible to explorers in your area.
                    </p>

                    {locationStatus && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                                "mb-8 w-full px-6 py-4 rounded-2xl font-bold text-sm border",
                                locationStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' :
                                locationStatus.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50' : 
                                'bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800/50'
                            )}
                        >
                            {locationStatus.message}
                        </motion.div>
                    )}

                    <Button
                        onClick={updateLocation}
                        isLoading={updatingLocation}
                        size="lg"
                        className="rounded-2xl px-12 h-14 w-full sm:w-auto"
                    >
                        <Radio className={cn("w-4 h-4 mr-2", updatingLocation && "animate-pulse")} />
                        {updatingLocation ? "Broadcasting..." : "Broadcast Location"}
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
};

export default GuideDashboard;
