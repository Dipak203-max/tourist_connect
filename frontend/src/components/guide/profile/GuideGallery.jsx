import React from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Camera } from 'lucide-react';
import { Card } from '../../ui/BaseComponents';

const GalleryItem = ({ image, size = 'small' }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={cn(
      "relative rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-lg group cursor-pointer border border-surface-100 dark:border-surface-800 transition-all duration-500",
      size === 'large' ? 'md:col-span-2 md:row-span-2 h-[400px] mb-4' : 'h-[200px] mb-4'
    )}
  >
    <img
      src={image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1471"}
      alt="Gallery"
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
      <span className="text-xs font-black uppercase tracking-widest bg-primary-600/80 backdrop-blur-md px-3 py-1 rounded-lg">Photo Moment</span>
    </div>
  </motion.div>
);

// Utility function duplicated for simplicity since this is an atomic component
const cn = (...classes) => classes.filter(Boolean).join(' ');

const GuideGallery = ({ images }) => {
  const hasPhotos = images && images.length > 0;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
            <Camera className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100 uppercase tracking-tight">Gallery</h2>
        </div>
        {hasPhotos && (
            <button className="text-sm font-black text-primary-600 dark:text-primary-400 hover:underline decoration-2 underline-offset-4 uppercase tracking-widest">
                View all {images.length} photos
            </button>
        )}
      </div>

      {hasPhotos ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((img, i) => (
            <GalleryItem key={i} image={img} size={i === 0 ? 'large' : 'small'} />
            ))}
        </div>
      ) : (
        <div className="p-16 rounded-[3rem] bg-surface-50 dark:bg-surface-900/50 border-2 border-dashed border-surface-200 dark:border-surface-800 text-center">
            <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-10 h-10 text-surface-300" />
            </div>
            <h3 className="text-xl font-black text-surface-900 dark:text-white uppercase tracking-tight mb-2">No Gallery Photos</h3>
            <p className="text-surface-400 font-bold italic max-w-sm mx-auto">
                This guide hasn't shared any moments from their tours yet. 
                Keep an eye out for updates!
            </p>
        </div>
      )}
    </div>
  );
};

export default GuideGallery;
