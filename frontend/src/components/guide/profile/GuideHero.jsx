import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Heart, MessageCircle, Calendar, CheckCircle, Camera } from 'lucide-react';
import { Button } from '../../ui/BaseComponents';
import FavoriteButton from '../../common/FavoriteButton';
import { cn } from '../../../utils/cn';
import { uploadGuideImage } from '../../../api/guideApi';
import { toast } from 'react-hot-toast';
import { getMediaUrl } from '../../../config';


const GuideHero = ({ guide, onMessage, onBook, isOwner, onEdit, onProfilePictureUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file.");
      return;
    }

    setUploading(true);
    try {
      const fileUrl = await uploadGuideImage(file);
      const fullUrl = getMediaUrl(fileUrl);

      if (onProfilePictureUpdate) {
        await onProfilePictureUpdate(fullUrl);
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

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
        <div className="relative -mt-20 md:-mt-28">
          <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl border border-white/20 dark:border-surface-800/50">
            <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-8">
              <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto text-center md:text-left">
                {/* Profile Picture */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                  className="relative p-2 bg-white dark:bg-surface-800 rounded-full shadow-2xl border border-surface-100 dark:border-surface-700"
                >
                  {guide?.profilePictureUrl ? (
                    <img
                      src={guide.profilePictureUrl}
                      alt={guide?.guideName}
                      className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-white dark:border-surface-800 shadow-inner"
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center border-4 border-white dark:border-surface-800 shadow-inner">
                        <span className="text-4xl md:text-7xl font-black text-surface-400 dark:text-surface-500 uppercase">
                            {guide?.guideName?.substring(0, 1) || "G"}
                        </span>
                    </div>
                  )}
                  
                  {isOwner ? (
                    <>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        hidden 
                        accept="image/*" 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className={cn(
                          "absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-primary-600 text-white p-2 md:p-3 rounded-full border-4 border-white dark:border-surface-800 shadow-lg hover:bg-primary-700 transition-all active:scale-95 group",
                          uploading && "animate-pulse opacity-70"
                        )}
                        title="Change Profile Picture"
                      >
                        {uploading ? (
                          <div className="w-4 h-4 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4 md:w-6 md:h-6" />
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-primary-600 text-white p-2 md:p-3 rounded-full border-4 border-white dark:border-surface-800 shadow-lg">
                      <CheckCircle className="w-4 h-4 md:w-6 md:h-6 fill-current" />
                    </div>
                  )}
                </motion.div>
    
                {/* Guide Info */}
                <div className="flex-1 w-full">
                  <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                      <h1 className="text-3xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent break-words md:break-normal max-w-full md:max-w-[600px] leading-tight py-1 drop-shadow-sm">
                        {guide?.guideName}
                      </h1>
                      {guide?.rating >= 4.5 && (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                          Top Guide
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <p className="text-xs md:text-sm font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.3em] bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-xl border border-primary-100 dark:border-primary-800/50 shadow-sm">
                        {guide?.specialization || "Certified Guide"}
                      </p>
                    </div>
                  </div>
    
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-surface-500 dark:text-surface-400 font-bold uppercase tracking-widest text-[10px]">
                    <div className="flex items-center gap-2 bg-surface-50 dark:bg-surface-800/50 px-4 py-2 rounded-2xl border border-surface-100 dark:border-surface-800/50">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>{guide?.city || "Nepal"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-50 dark:bg-surface-800/50 px-4 py-2 rounded-2xl border border-surface-100 dark:border-surface-800/50">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-surface-900 dark:text-surface-100 font-black">{guide?.rating?.toFixed(1) || "0.0"}</span>
                      <span>({guide?.reviewCount || "0"} reviews)</span>
                    </div>
                    {guide?.responseTime && (
                      <div className="flex items-center gap-2 bg-surface-50 dark:bg-surface-800/50 px-4 py-2 rounded-2xl border border-surface-100 dark:border-surface-800/50">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>{guide.responseTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
    
              {/* Action Buttons - Desktop */}
              <div className="hidden lg:flex flex-col gap-3 min-w-[200px]">
                {isOwner ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={onEdit}
                    className="w-full gap-3 font-bold shadow-md h-[60px] border-surface-200 dark:border-surface-800 rounded-2xl text-base"
                  >
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <div className="flex gap-3">
                      <FavoriteButton 
                        itemId={guide?.userId} 
                        itemType="GUIDE" 
                        className="flex-1 p-5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl hover:bg-surface-50 dark:hover:bg-surface-700 shadow-md transition-all active:scale-95 text-red-500" 
                      />
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={onMessage}
                        className="flex-[2] gap-3 font-bold shadow-md h-[60px] rounded-2xl text-base"
                      >
                        <MessageCircle className="w-6 h-6" />
                        Message
                      </Button>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={onBook}
                      className="w-full gap-3 font-black shadow-xl shadow-primary-200 dark:shadow-none h-[60px] rounded-2xl text-base"
                    >
                      <Calendar className="w-6 h-6" />
                      Book Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Mobile Only */}
        <div className="md:hidden flex items-center gap-3 w-full mt-6">
          {isOwner ? (
            <Button
              variant="secondary"
              size="lg"
              onClick={onEdit}
              className="w-full gap-2 font-bold shadow-md h-[54px] border-surface-200 dark:border-surface-800 rounded-2xl"
            >
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Edit Profile
            </Button>
          ) : (
            <>
              <FavoriteButton 
                itemId={guide?.userId} 
                itemType="GUIDE" 
                className="p-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-md text-red-500" 
              />
              <Button
                variant="secondary"
                size="lg"
                onClick={onMessage}
                className="flex-1 gap-2 font-bold shadow-md h-[54px] rounded-2xl"
              >
                <MessageCircle className="w-5 h-5" />
                Message
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={onBook}
                className="flex-1 gap-2 font-black shadow-xl shadow-primary-200 h-[54px] rounded-2xl"
              >
                <Calendar className="w-5 h-5" />
                Book
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideHero;
