import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Heart, MessageCircle, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '../../ui/BaseComponents';
import FavoriteButton from '../../common/FavoriteButton';
import { cn } from '../../../utils/cn';

const GuideHero = ({ guide, onMessage, onBook, isOwner, onEdit }) => {
  return (
    <div className="relative mb-12">
      {/* Banner Image */}
      <div className="h-[250px] md:h-[350px] w-full relative overflow-hidden rounded-b-[2rem] md:rounded-b-[3rem] shadow-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900">
        {guide?.coverImageUrl && (
          <img
            src={guide.coverImageUrl}
            alt="Guide Banner"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Profile Header Overlap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 md:-mt-24 flex flex-col md:flex-row items-end md:items-center justify-between gap-6 pb-6 border-b border-surface-100 dark:border-surface-800">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full md:w-auto text-center md:text-left">
            {/* Profile Picture */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="relative p-2 bg-white dark:bg-surface-900 rounded-full shadow-2xl"
            >
              {guide?.profilePictureUrl ? (
                <img
                  src={guide.profilePictureUrl}
                  alt={guide?.guideName}
                  className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover border-4 border-white dark:border-surface-900 shadow-inner"
                />
              ) : (
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center border-4 border-white dark:border-surface-900 shadow-inner">
                    <span className="text-4xl md:text-6xl font-black text-surface-400 dark:text-surface-600 uppercase">
                        {guide?.guideName?.substring(0, 1) || "G"}
                    </span>
                </div>
              )}
              <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-primary-600 text-white p-1.5 md:p-2 rounded-full border-4 border-white dark:border-surface-900 shadow-lg">
                <CheckCircle className="w-4 h-4 md:w-6 md:h-6 fill-current" />
              </div>
            </motion.div>

            {/* Guide Info */}
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-surface-900 dark:text-surface-100">
                  {guide?.guideName}
                </h1>
                {guide?.rating >= 4.5 && (
                  <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                    Top Guide
                  </span>
                )}
              </div>
              <p className="text-lg md:text-xl font-bold text-primary-600 dark:text-primary-400 mb-3 uppercase tracking-wider">
                {guide?.specialization || "Certified Guide"}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-surface-500 dark:text-surface-400 font-bold uppercase tracking-widest text-xs">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{guide?.city || "Nepal"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-surface-900 dark:text-surface-100">{guide?.rating?.toFixed(1) || "0.0"}</span>
                  <span>({guide?.reviewCount || "0"} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            {isOwner ? (
              <Button
                variant="secondary"
                size="lg"
                onClick={onEdit}
                className="flex-1 md:flex-none gap-2 font-bold shadow-md h-[54px] border-surface-200 dark:border-surface-800"
              >
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Edit Profile
              </Button>
            ) : (
              <>
                <FavoriteButton 
                  itemId={guide?.userId} 
                  itemType="GUIDE" 
                  className="p-3.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 shadow-md transition-all active:scale-95 text-red-500" 
                />
                
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onMessage}
                  className="flex-1 md:flex-none gap-2 font-bold shadow-md h-[54px]"
                >
                  <MessageCircle className="w-5 h-5" />
                  Message
                </Button>
                
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onBook}
                  className="flex-1 md:flex-none gap-2 font-black shadow-xl shadow-primary-200 dark:shadow-none h-[54px] px-8"
                >
                  <Calendar className="w-5 h-5" />
                  Book Now
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideHero;
