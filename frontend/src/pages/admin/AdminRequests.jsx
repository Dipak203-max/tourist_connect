import React from 'react';
import { ClipboardDocumentCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

const AdminRequests = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-surface-50 dark:bg-surface-900/50 backdrop-blur-xl p-12 rounded-[2.5rem] border border-white/20 shadow-2xl shadow-indigo-100/30 text-center">
                <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-indigo-100 shadow-inner">
                    <ClipboardDocumentCheckIcon className="w-10 h-10 text-indigo-600 animate-pulse" />
                </div>
                <h1 className="text-4xl font-black text-surface-900 dark:text-surface-100 tracking-tight mb-4">
                    Request <span className="text-indigo-600">Terminal</span>
                </h1>
                <p className="text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
                    Manage and validate special user requests and platform interactions. This terminal is under active development to provide granular control.
                </p>

                <div className="mt-12 inline-flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-gray-200">
                    <SparklesIcon className="w-4 h-4" />
                    Phase: Architecture Finalization
                </div>
            </div>
        </div>
    );
};

export default AdminRequests;
