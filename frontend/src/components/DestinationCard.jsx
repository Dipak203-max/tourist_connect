import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FavoriteButton from './common/FavoriteButton';
import { Card, Button, cn } from './ui/BaseComponents';

const DestinationCard = ({ destination }) => {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
            <Card className="group overflow-hidden border-none bg-surface-50 dark:bg-surface-900 dark:bg-surface-900 shadow-premium hover:shadow-2xl transition-all duration-500 rounded-[2rem]">
                <div className="relative h-64 overflow-hidden">
                    <img
                        src={destination.imageUrl || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa'}
                        alt={destination.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Glass Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute top-5 right-5 z-10" onClick={(e) => e.stopPropagation()}>
                        <FavoriteButton
                            itemId={destination.id}
                            itemType="DESTINATION"
                            className="bg-surface-50 dark:bg-surface-900/90 dark:bg-surface-800/90 backdrop-blur-md p-2.5 rounded-2xl shadow-premium border border-white/20 dark:border-surface-700/50 hover:scale-110 transition-transform"
                        />
                    </div>
                    
                    <div className="absolute bottom-5 left-5 z-10">
                        <div className="glass-card px-4 py-1.5 rounded-full border border-white/20 shadow-xl">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                {destination.city}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        <span className="text-[10px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-widest">
                            {destination.city}, {destination.country || 'Nepal'}
                        </span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-surface-900 dark:text-white mb-3 tracking-tight group-hover:text-primary-600 transition-colors">
                        {destination.name}
                    </h3>
                    
                    <p className="text-muted text-sm line-clamp-2 mb-8 leading-relaxed font-medium">
                        {destination.description}
                    </p>
                    
                    <Link to={`/destinations/${destination.id}`}>
                        <Button 
                            variant="secondary" 
                            className="w-full h-14 rounded-2xl group/btn overflow-hidden relative border-surface-100 dark:border-surface-800"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Explore Place
                                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                            </span>
                        </Button>
                    </Link>
                </div>
            </Card>
        </motion.div>
    );
};

export default DestinationCard;
