import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import StarRating from '../common/StarRating';
import Avatar from '../common/Avatar';
import { format } from 'date-fns';

export default function ReviewList({ guideId, refreshTrigger }) {
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const [reviewsRes, summaryRes] = await Promise.all([
                    axiosInstance.get(`/public/guides/${guideId}/reviews`),
                    axiosInstance.get(`/public/guides/${guideId}/rating-summary`)
                ]);
                setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
                setSummary(summaryRes.data);
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setLoading(false);
            }
        };

        if (guideId) {
            fetchReviews();
        }
    }, [guideId, refreshTrigger]);

    if (loading) return <div className="text-center py-4 text-gray-500">Loading reviews...</div>;

    return (
        <div className="mt-8">
            <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mr-4">Reviews</h2>
                <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <StarRating rating={summary.averageRating} readOnly size="h-5 w-5" />
                    <span className="ml-2 text-gray-700 font-semibold">{summary.averageRating}</span>
                    <span className="ml-2 text-gray-500 text-sm">({summary.totalReviews})</span>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="text-gray-500 italic">No reviews yet.</div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                            <div className="flex items-start">
                                <Avatar
                                    src={review.userAvatar}
                                    alt={review.userName}
                                    className="h-10 w-10 mr-3"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-semibold text-gray-800">{review.userName}</h4>
                                        <span className="text-gray-500 text-sm">
                                            {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <StarRating rating={review.rating} readOnly size="h-4 w-4" />
                                    </div>
                                    <p className="text-gray-700">{review.comment}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
