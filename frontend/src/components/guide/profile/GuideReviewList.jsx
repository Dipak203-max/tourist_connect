import React, { useMemo } from 'react';
import { Star, ThumbsUp, Calendar, ChevronDown, MessageSquare } from 'lucide-react';
import { Button, Card } from '../../ui/BaseComponents';
import { format } from 'date-fns';

const RatingBar = ({ stars, percentage }) => (
  <div className="flex items-center gap-4 w-full group">
    <span className="text-sm font-bold text-surface-400 w-12 group-hover:text-amber-500 transition-colors uppercase tracking-widest">{stars} ★</span>
    <div className="flex-1 h-3 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden shadow-inner">
      <div 
        className="h-full bg-amber-400 dark:bg-amber-500 rounded-full shadow-lg transition-all duration-1000 ease-out" 
        style={{ width: `${percentage}%` }} 
      />
    </div>
    <span className="text-sm font-black text-surface-900 dark:text-surface-100 w-10 text-right">{percentage}%</span>
  </div>
);

const ReviewItem = ({ review }) => (
  <div className="py-8 border-b border-surface-100 dark:border-surface-800 group transition-all duration-300 hover:px-2 rounded-2xl hover:bg-surface-50 dark:hover:bg-surface-800/30">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="p-1 bg-white dark:bg-surface-900 rounded-2xl shadow-md group-hover:shadow-lg transition-all">
          <img
            src={review?.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review?.userName || 'Traveler'}`}
            alt={review?.userName}
            className="w-14 h-14 rounded-xl object-cover"
          />
        </div>
        <div>
          <h4 className="text-lg font-black text-surface-900 dark:text-surface-100">{review?.userName || "Adventure Traveler"}</h4>
          <div className="flex items-center gap-3 text-sm text-surface-400 font-bold">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-primary-500" /> 
              {review?.createdAt ? format(new Date(review.createdAt), 'MMMM yyyy') : "October 2023"}
            </span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase border border-emerald-100">Verified Trip</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/50">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <span className="text-lg font-black text-amber-700 dark:text-amber-400">{review?.rating || "5.0"}</span>
      </div>
    </div>
    <p className="text-surface-600 dark:text-surface-400 text-lg leading-relaxed font-bold italic">
      {review?.comment ? `"${review.comment}"` : '"Incredible experience with this guide!"'}
    </p>
    <div className="mt-4 flex items-center gap-4">
      <button className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-black text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
        <ThumbsUp className="w-4 h-4" /> Helpful (0)
      </button>
    </div>
  </div>
);

const GuideReviewList = ({ reviews = [], stats }) => {
  const distribution = useMemo(() => {
    if (!reviews || reviews.length === 0) return [0, 0, 0, 0, 0];
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      const star = Math.max(1, Math.min(5, Math.floor(r.rating)));
      counts[5 - star]++;
    });
    return counts.map(count => Math.round((count / reviews.length) * 100));
  }, [reviews]);

  return (
    <div id="reviews" className="mb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
          <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100 uppercase tracking-tight">Traveler Reviews</h2>
      </div>

      <Card className="mb-12 p-10 bg-gradient-to-br from-white to-surface-50 dark:from-surface-900 dark:to-surface-800/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-surface-900 rounded-[3rem] shadow-xl border border-surface-200 dark:border-surface-700 w-full md:w-auto h-full">
            <span className="text-7xl font-black text-surface-900 dark:text-surface-100 tracking-tighter mb-2">{stats?.rating?.toFixed(1) || '0.0'}</span>
            <div className="flex items-center gap-1.5 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-6 h-6 ${s <= (stats?.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
              ))}
            </div>
            <span className="text-sm font-black text-surface-400 uppercase tracking-widest">{stats?.totalReviews || '0'} Reviews</span>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-black text-surface-400 uppercase tracking-widest mb-4">Rating Breakdown</h3>
            <RatingBar stars="5" percentage={distribution[0]} />
            <RatingBar stars="4" percentage={distribution[1]} />
            <RatingBar stars="3" percentage={distribution[2]} />
            <RatingBar stars="2" percentage={distribution[3]} />
            <RatingBar stars="1" percentage={distribution[4]} />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-surface-900 dark:text-surface-100 uppercase tracking-tight">Recent Reviews</h3>
          <Button variant="ghost" size="sm" className="gap-2 font-black uppercase tracking-widest">
            Sort by: Newest <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
        
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))
        ) : (
          <div className="p-12 bg-surface-50 dark:bg-surface-900 rounded-[2rem] border-2 border-dashed border-surface-200 dark:border-surface-800 text-center">
            <p className="text-surface-400 font-bold italic">No reviews yet for this guide.</p>
          </div>
        )}

        {reviews.length > 5 && (
          <div className="text-center mt-12">
            <Button variant="secondary" size="lg" className="rounded-2xl font-bold px-12 h-[54px] shadow-md border-surface-200 dark:border-surface-700">
              Show more reviews
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideReviewList;
