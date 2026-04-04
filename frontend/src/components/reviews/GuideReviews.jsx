import React, { useState, useEffect } from 'react';
import { reviewApi } from '../../api/reviewApi';
import RatingSummary from './RatingSummary';
import StarRating from '../common/StarRating';
import Avatar from '../common/Avatar';
import { format } from 'date-fns';

export default function GuideReviews({ guideId }) {
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reviewsRes, summaryRes] = await Promise.all([
                    reviewApi.getGuideReviews(guideId),
                    reviewApi.getGuideRatingSummary(guideId)
                ]);
                setReviews(reviewsRes.data);
                setSummary(summaryRes.data);
            } catch (error) {
                console.error("Failed to fetch guide reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        if (guideId) fetchData();
    }, [guideId]);

    if (loading) return <div className="animate-pulse space-y-4 pt-6"><div className="h-32 bg-gray-100 rounded-xl w-full"></div></div>;

    return (
        <div className="space-y-8 py-6">
            <RatingSummary
                averageRating={summary.averageRating}
                totalReviews={summary.totalReviews}
            />

            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-6">
                    <h3 className="text-2xl font-black text-surface-900 dark:text-surface-100 uppercase tracking-tight">Tourist Feedback</h3>
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800/50">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <span className="text-lg font-black text-primary-700 dark:text-primary-300">{summary.averageRating.toFixed(1)}</span>
                    </div>
                </div>

                {reviews.length === 0 ? (
                    <div className="py-20 text-center bg-surface-50 dark:bg-surface-900/30 rounded-[3rem] border-2 border-dashed border-surface-100 dark:border-surface-800">
                        <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8 text-surface-300" />
                        </div>
                        <h4 className="text-xl font-black text-surface-900 dark:text-white uppercase tracking-tight mb-2">No Reviews Yet</h4>
                        <p className="text-surface-400 font-bold italic max-w-xs mx-auto">Be the first one to share your experience with this guide!</p>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {reviews.map((review) => (
                            <motion.div 
                                key={review.id} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="relative p-8 rounded-[2.5rem] bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 shadow-sm hover:shadow-xl transition-all group"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar src={review.userAvatar} alt={review.userName} className="h-14 w-14 border-2 border-primary-500/20" />
                                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-surface-900">
                                                <Check className="w-2.5 h-2.5 stroke-[4]" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-surface-900 dark:text-surface-100 leading-none mb-1 uppercase tracking-tight">{review.userName}</h4>
                                            <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                                                Traveler • {format(new Date(review.createdAt), 'MMM yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50">
                                        <StarRating rating={review.rating} readOnly size="h-3.5 w-3.5" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <span className="absolute -top-4 -left-2 text-6xl text-primary-500/10 font-serif">"</span>
                                    <p className="text-surface-600 dark:text-surface-400 font-bold leading-relaxed italic relative z-10 pl-4">
                                        {review.comment}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
