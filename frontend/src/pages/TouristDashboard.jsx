import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import FeaturedDestinations from '../components/destinations/FeaturedDestinations';
import AISuggestions from '../components/common/AISuggestions';
import { Button } from '../components/ui/BaseComponents';
import { Compass, Users, Sparkles } from 'lucide-react';

const TouristDashboard = () => {
    const { user } = useContext(AuthContext);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12 pb-20"
        >
            {/* Welcome Banner */}
            <motion.div 
                variants={itemVariants}
                className="relative overflow-hidden bg-surface-950 rounded-[3rem] p-12 text-white shadow-premium"
            >
                <div className="relative z-10 max-w-2xl">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-50 dark:bg-surface-900/10 backdrop-blur-md border border-white/10 text-primary-200 text-[10px] font-black uppercase tracking-widest mb-6"
                    >
                        <Sparkles className="w-3 h-3" />
                        Adventure Awaits
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-none">
                        Welcome Back, <span className="text-primary-400">{user?.email?.split('@')[0]}!</span>
                    </h1>
                    <p className="text-lg text-surface-300 font-medium mb-10 leading-relaxed opacity-90 max-w-lg">
                        The world is waiting for your next story. Discover new horizons, connect with local guides, and create memories that last a lifetime.
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                        <NavLink to="/stories">
                            <Button variant="primary" size="lg" className="rounded-2xl gap-2 h-14 px-8 shadow-xl shadow-primary-500/20">
                                <Compass className="w-5 h-5" />
                                Explore Stories
                            </Button>
                        </NavLink>
                        <NavLink to="/friends">
                            <Button variant="ghost" size="lg" className="rounded-2xl gap-2 h-14 px-8 border border-white/10 text-white hover:bg-surface-50 dark:hover:bg-surface-900/5">
                                <Users className="w-5 h-5" />
                                Find Friends
                            </Button>
                        </NavLink>
                    </div>
                </div>

                {/* Abstract Background Design */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-surface-950 to-transparent pointer-events-none" />
                
                {/* Micro Icons Decor */}
                <div className="absolute top-20 right-40 opacity-20 pointer-events-none hidden lg:block">
                    <Compass className="w-40 h-40 rotate-12 text-primary-500" />
                </div>
            </motion.div>

            {/* Featured Destinations Section */}
            <motion.div variants={itemVariants}>
                <FeaturedDestinations />
            </motion.div>

            {/* AI Travel Suggestions Section */}
            <motion.div variants={itemVariants}>
                <AISuggestions />
            </motion.div>
        </motion.div>
    );
};

export default TouristDashboard;
