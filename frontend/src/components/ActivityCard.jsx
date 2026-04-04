import React from 'react';
import {
    ClockIcon,
    PencilSquareIcon,
    TrashIcon,
    StarIcon as StarIconOutline
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const ActivityCard = ({ item, onEdit, onDelete, onPin }) => {
    return (
        <div className={`p-3 bg-surface-50 dark:bg-surface-900 border ${item.pinned ? 'border-yellow-300 shadow-sm' : 'border-surface-200 dark:border-surface-700'} rounded-lg shadow-sm hover:shadow-md transition group relative`}>
            {/* Pinned Badge/Highlight */}
            {item.pinned && (
                <div className="absolute top-0 right-0 -mt-1 -mr-1 z-10">
                    <StarIconSolid className="w-5 h-5 text-yellow-400 drop-shadow-sm" />
                </div>
            )}

            <div className="flex items-center justify-between mb-2">
                <div className="inline-flex items-center text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {item.timeSlot || 'TBD'}
                </div>

                {/* Actions: Show on hover */}
                <div className="hidden group-hover:flex space-x-1 transition-opacity duration-200 bg-surface-50 dark:bg-surface-900/80 backdrop-blur-sm rounded-lg px-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPin(item); }}
                        className="p-1.5 text-muted hover:text-yellow-500 rounded hover:bg-yellow-50 transition"
                        title={item.pinned ? "Unpin" : "Pin to top"}
                    >
                        {item.pinned ? <StarIconSolid className="w-4 h-4" /> : <StarIconOutline className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                        className="p-1.5 text-muted hover:text-blue-500 rounded hover:bg-blue-50 transition"
                        title="Edit"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                        className="p-1.5 text-muted hover:text-red-500 rounded hover:bg-red-50 transition"
                        title="Delete"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="font-medium text-gray-800 text-sm leading-snug pr-2 break-words">
                {item.description}
            </div>
        </div>
    );
};

export default ActivityCard;
