import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Check, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/BaseComponents';
import { cn } from '../../../utils/cn';
import { AnimatePresence } from 'framer-motion';

const TourCard = ({ tour, isSelected, onSelect }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      onClick={onSelect}
      className={cn(
        "group cursor-pointer bg-white dark:bg-surface-900 rounded-[2rem] overflow-hidden border transition-all duration-300",
        isSelected 
          ? "border-primary-500 ring-4 ring-primary-500/10 shadow-2xl scale-[1.02]" 
          : "border-surface-100 dark:border-surface-800 shadow-lg hover:shadow-2xl"
      )}
    >
      <div className="relative h-64 overflow-hidden bg-surface-100 dark:bg-surface-800">
        {tour?.imageUrl ? (
            <img
            src={tour.imageUrl}
            alt={tour?.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-800 dark:to-surface-900">
                <span className="text-4xl">🏔️</span>
            </div>
        )}
        
        {/* Selection Badge */}
        <AnimatePresence>
          {isSelected && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-4 left-4 bg-primary-600 text-white p-2 rounded-full shadow-lg z-10"
            >
              <Check className="w-5 h-5 stroke-[4]" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-4 right-4 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1 shadow-lg">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-sm font-black text-surface-900 dark:text-surface-100">{tour?.rating?.toFixed(1) || "4.9"}</span>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
            {tour?.category || "Trek"}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className={cn(
          "text-xl font-black mb-2 line-clamp-1 transition-colors",
          isSelected ? "text-primary-600" : "text-surface-900 dark:text-surface-100 group-hover:text-primary-600"
        )}>
          {tour?.title}
        </h3>
        
        <div className="flex items-center gap-4 text-surface-500 dark:text-surface-400 text-sm font-bold mb-6">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary-500" />
            <span>{tour?.duration || "Flexible"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>From ${tour?.pricePerPerson}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-surface-100 dark:border-surface-800">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Rate pp</span>
            <span className="text-xl font-black text-surface-900 dark:text-surface-100">${tour?.pricePerPerson}</span>
          </div>
          <Button 
            variant={isSelected ? "primary" : "secondary"}
            size="md" 
            className="rounded-2xl gap-2 font-black transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TourCard;
