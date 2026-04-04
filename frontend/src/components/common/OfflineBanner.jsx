import React from 'react';
import { useConnectivity } from '../../context/ConnectivityContext';
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

const OfflineBanner = () => {
    const { isOnline } = useConnectivity();

    if (isOnline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-300">
            <div className="bg-amber-500 text-white px-4 py-3 shadow-2xl flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                    <WifiOff className="w-5 h-5 animate-pulse" />
                    <span className="text-sm font-black uppercase tracking-widest">Offline Mode</span>
                </div>
                <div className="h-4 w-[1px] bg-surface-50 dark:bg-surface-900/30 hidden md:block" />
                <p className="text-xs font-medium hidden md:block">
                    You're disconnected. Still, you can browse cached itineraries and maps.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-1.5 bg-surface-50 dark:bg-surface-900/20 hover:bg-surface-50 dark:hover:bg-surface-900/30 px-3 py-1.5 rounded-xl transition-all border border-white/20 group"
                >
                    <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Retry Connection</span>
                </button>
            </div>

            {/* Safe Area Spacer for Content */}
            <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 animate-gradient-x" />
        </div>
    );
};

export default OfflineBanner;
