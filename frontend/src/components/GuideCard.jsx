import React from 'react';
import { StarIcon, AwardIcon, MapPinIcon } from 'lucide-react';
import FavoriteButton from './common/FavoriteButton';
import { useNavigate } from 'react-router-dom';

const GuideCard = ({ guide, showFavorite = true }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/guide-profile/${guide.userId}`)}
            className="group bg-surface-50 dark:bg-surface-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-surface-200 dark:border-surface-700 cursor-pointer flex flex-col h-full"
        >
            {/* Image Section */}
            <div className="relative h-60 overflow-hidden">
                <img
                    src={guide.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${guide.userId}`}
                    alt={guide.guideName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {showFavorite && (
                    <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                        <FavoriteButton
                            itemId={guide.userId}
                            itemType="GUIDE"
                            className="bg-surface-50 dark:bg-surface-900/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm hover:scale-110 transition-transform"
                        />
                    </div>
                )}

                {guide.rating >= 4.5 && (
                    <div className="absolute top-4 left-4">
                        <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 backdrop-blur-sm bg-opacity-90">
                            <StarIcon className="w-3 h-3 fill-current" />
                            Top Rated
                        </span>
                    </div>
                )}

                <div className="absolute bottom-4 left-4">
                    <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                        <MapPinIcon className="w-3 h-3 text-indigo-200" />
                        {guide.city}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-black text-surface-900 dark:text-surface-100 leading-tight group-hover:text-indigo-600 transition-colors">
                            {guide.guideName}
                        </h3>
                        <div className="flex items-center text-indigo-500 font-bold mt-1.5 text-xs uppercase tracking-wider gap-1.5">
                            <AwardIcon className="w-3.5 h-3.5" />
                            {guide.specialization}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center bg-surface-100 dark:bg-surface-800 px-2.5 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700">
                            <span className="text-amber-500 text-sm mr-1">★</span>
                            <span className="text-sm font-black text-surface-900 dark:text-surface-100">{guide.rating ? guide.rating.toFixed(1) : 'NEW'}</span>
                        </div>
                        <span className="text-[10px] text-muted font-bold mt-1 uppercase tracking-tighter">{guide.reviewCount || 0} reviews</span>
                    </div>
                </div>

                <p className="text-gray-500 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
                    {guide.bio || "Experience a personalized tour with a professional guide dedicated to showcasing the best of this city."}
                </p>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-black text-indigo-600">${guide.price}</span>
                        <span className="text-muted text-xs font-bold uppercase ml-1">/ day</span>
                    </div>
                    <button className="bg-gray-900 text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-gray-100">
                        View Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuideCard;
