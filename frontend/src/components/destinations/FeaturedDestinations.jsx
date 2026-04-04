import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { destinationApi } from '../../api/destinationApi';
import DestinationCard from '../DestinationCard';
import { Sparkles, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Card } from '../ui/BaseComponents';

const FeaturedDestinations = () => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const response = await destinationApi.getAllDestinations(0, 6);
                const items = response.data.content || [];
                setDestinations(items.slice(0, 6));
            } catch (error) {
                console.error("Failed to fetch destinations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDestinations();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="h-12 w-64 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="h-[450px] animate-pulse border-none shadow-premium" />
                    ))}
                </div>
            </div>
        );
    }

    if (!Array.isArray(destinations) || destinations.length === 0) return null;

    return (
        <section className="py-8">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between mb-10"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-surface-900 dark:text-white tracking-tight">Popular Destinations</h2>
                        <p className="text-muted text-sm font-black uppercase tracking-widest mt-1 opacity-70">Handpicked for you</p>
                    </div>
                </div>
                <NavLink to="/destinations">
                    <motion.div 
                        whileHover={{ x: 5 }}
                        className="group flex items-center gap-2 text-primary-600 dark:text-primary-400 font-black text-[10px] uppercase tracking-widest"
                    >
                        Explore All
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </motion.div>
                </NavLink>
            </motion.div>

            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.1
                        }
                    }
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {destinations.map(dest => (
                    <DestinationCard
                        key={dest.id}
                        destination={dest}
                    />
                ))}
            </motion.div>
        </section>
    );
};

export default FeaturedDestinations;
