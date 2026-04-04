import React from 'react';
import StarRating from '../common/StarRating';

export default function RatingSummary({ averageRating = 0, totalReviews = 0 }) {
    return (
        <div className="card p-6 rounded-xl flex flex-col md:flex-row items-center gap-8">
            <div className="text-center md:border-r md:pr-8 border-surface-200 dark:border-surface-700">
                <div className="text-5xl font-bold text-surface-900 dark:text-surface-100 mb-2">{averageRating.toFixed(1)}</div>
                <StarRating rating={averageRating} readOnly size="h-6 w-6" />
                <div className="mt-2 text-gray-500 text-sm font-medium">{totalReviews} reviews</div>
            </div>

            <div className="flex-1 w-full space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 w-3">{star}</span>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-400 rounded-full"
                                style={{ width: `${totalReviews > 0 ? (star === Math.round(averageRating) ? 70 : 10) : 0}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
