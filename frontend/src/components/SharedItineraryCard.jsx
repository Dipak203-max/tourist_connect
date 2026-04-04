import React from 'react';
import { CalendarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const SharedItineraryCard = ({ itineraryData }) => {
    const navigate = useNavigate();

    if (!itineraryData) return null;

    const { title, startDate, endDate, shareToken } = itineraryData;

    const handleView = () => {
        // Navigate to public view or full view
        if (shareToken) {
            navigate(`/public/itinerary/${shareToken}`);
        } else {
            // Fallback if no token (shouldn't happen for shared ones)
            console.error("No share token found");
        }
    };

    return (
        <div className="bg-surface-50 dark:bg-surface-900 rounded-lg border border-gray-200 shadow-sm overflow-hidden max-w-sm mt-1">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Itinerary</span>
            </div>
            <div className="p-4">
                <h4 className="font-bold text-gray-800 mb-2 truncate">{title}</h4>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                    <CalendarIcon className="w-4 h-4 mr-1.5" />
                    <span>
                        {new Date(startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {' - '}
                        {new Date(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                </div>
                <button
                    onClick={handleView}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition flex items-center justify-center"
                >
                    View Itinerary
                    <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                </button>
            </div>
        </div>
    );
};

export default SharedItineraryCard;
