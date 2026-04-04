import React from 'react';

/**
 * PageLoader
 * A premium, SaaS-style loading screen with glassmorphism and smooth animations.
 */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-surface-100 dark:bg-surface-800/50 backdrop-blur-sm fixed inset-0 z-[9999]">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* Outer pulse ring */}
        <div className="w-20 h-20 border-4 border-blue-600/10 rounded-full animate-ping absolute inset-0" />
        {/* Spinning loader */}
        <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin relative" />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <h3 className="font-black text-xs uppercase tracking-[0.4em] text-surface-900 dark:text-surface-100 animate-pulse ml-1">
          Loading
        </h3>
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
          TouristConnect
        </p>
      </div>
    </div>
  </div>
);

export default PageLoader;
