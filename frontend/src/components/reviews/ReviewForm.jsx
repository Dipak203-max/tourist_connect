import React, { useState, useEffect } from 'react';
import StarRating from '../common/StarRating';
import { reviewApi } from '../../api/reviewApi';
import { toast } from 'react-hot-toast';

export default function ReviewForm({ bookingId, guideId, onReviewSubmitted, isModalView = false }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (isModalView) {
            setChecking(false);
            return;
        }
        const checkStatus = async () => {
            try {
                const res = await reviewApi.checkIfReviewed(bookingId);
                setAlreadyReviewed(res.data);
            } catch (error) {
                console.error("Error checking review status:", error);
            } finally {
                setChecking(false);
            }
        };
        if (bookingId) checkStatus();
    }, [bookingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setLoading(true);
        try {
            await reviewApi.submitReview({
                bookingId,
                rating,
                comment
            });
            toast.success("Thank you for your review!");
            setAlreadyReviewed(true);
            if (onReviewSubmitted) onReviewSubmitted(rating);
        } catch (error) {
            console.error("Failed to submit review", error);
            const msg = error.response?.data || "Failed to submit review";
            toast.error(typeof msg === 'string' ? msg : "Conflict: Review already exists");
        } finally {
            setLoading(false);
        }
    };

    if (checking) return <div className="text-muted p-4">Verifying booking...</div>;

    if (alreadyReviewed) {
        return (
            <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                <p className="text-green-700 font-medium">You already reviewed this guide.</p>
                <p className="text-green-600 text-sm mt-1">Thank you for sharing your feedback!</p>
            </div>
        );
    }

    return (
        <div className={isModalView ? "animate-fadeIn" : "card p-6 rounded-xl animate-fadeIn"}>
            {!isModalView && (
                <>
                    <h3 className="text-xl font-bold mb-1 text-surface-900 dark:text-surface-100">Rate your experience</h3>
                    <p className="text-gray-500 text-sm mb-6">How was your trip with the guide?</p>
                </>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Overall Rating</label>
                    <StarRating rating={rating} setRating={setRating} size="h-10 w-10" />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Detailed Feedback</label>
                    <textarea
                        className="w-full border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[120px] bg-surface-100 dark:bg-surface-800"
                        rows="4"
                        placeholder="What did you like about the trip? Highlight specific moments..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={1000}
                    ></textarea>
                    <div className="text-right text-xs text-muted mt-1">{comment.length}/1000</div>
                </div>

                <button
                    type="submit"
                    disabled={loading || rating === 0}
                    className={`w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-blue-700 transform transition-all duration-200 active:scale-[0.98] ${loading || rating === 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Posting...
                        </span>
                    ) : 'Post Review'}
                </button>
            </form>
        </div>
    );
}
