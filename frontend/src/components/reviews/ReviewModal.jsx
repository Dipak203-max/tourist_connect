import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import ReviewForm from './ReviewForm';

const ReviewModal = ({ bookingId, guideName, isOpen, onClose, onReviewSubmitted }) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop overlay */}
            <div 
                className="absolute inset-0 bg-surface-900/40 dark:bg-surface-900/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white dark:bg-surface-900 w-full max-w-lg rounded-3xl shadow-2xl border border-surface-200 dark:border-surface-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between sticky top-0 bg-white dark:bg-surface-900 z-10">
                    <h2 className="text-xl font-black text-surface-900 dark:text-surface-100 uppercase tracking-tight">
                        Review {guideName}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {/* Rendering the modular ReviewForm without its internal check logic */}
                    <ReviewForm 
                        bookingId={bookingId} 
                        onReviewSubmitted={onReviewSubmitted} 
                        isModalView={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
