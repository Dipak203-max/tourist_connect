import React, { useState, useMemo } from 'react';
import { Calendar, Users, Info, ShieldCheck, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { Button, Card, Input } from '../../ui/BaseComponents';
import { motion, AnimatePresence } from 'framer-motion';

const BookingSidebar = ({ guide, selectedTour, onBook }) => {
  const [guests, setGuests] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Set default to tomorrow's date (or today if preferred)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const unitPrice = selectedTour?.pricePerPerson || guide?.price || 0;

  const total = useMemo(() => {
    return unitPrice * guests;
  }, [unitPrice, guests]);

  return (
    <div className="sticky top-24">
      <Card className="p-8 shadow-2xl border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-3xl font-black text-surface-900 dark:text-surface-100">
              ${unitPrice}
            </span>
            <span className="text-sm font-bold text-surface-400 uppercase tracking-widest ml-1">/ {selectedTour ? 'person' : 'day'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-500 uppercase tracking-widest">
            <Check className="w-4 h-4" /> No extra fees
          </div>
        </div>

        {/* Selected Tour Summary */}
        <div className="mb-6 p-4 rounded-2xl bg-surface-50 dark:bg-surface-800 border border-surface-100 dark:border-surface-700">
            <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Current selection</p>
            {selectedTour ? (
                <p className="font-black text-surface-900 dark:text-surface-100 text-sm truncate">{selectedTour.title}</p>
            ) : (
                <p className="text-red-500 font-bold text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Please select a tour
                </p>
            )}
        </div>

        <div className="space-y-4 mb-8">
          <div className="relative">
            <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest absolute top-2.5 left-4 z-10">Select Date</label>
            <div className="relative">
  <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest absolute top-2.5 left-4 z-10">
    Select Date
  </label>

  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    min={new Date().toISOString().split('T')[0]}
    className="w-full p-4 pt-7 bg-surface-50 dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 font-bold text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 outline-none"
  />

  <Calendar className="w-5 h-5 text-primary-500 absolute bottom-4 left-4 pointer-events-none" />
</div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest absolute top-2.5 left-4 z-10">Travelers</label>
            <select 
              className="w-full p-4 pt-7 bg-surface-50 dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 appearance-none font-bold text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'Traveler' : 'Travelers'}</option>
              ))}
            </select>
            <Users className="w-5 h-5 text-primary-500 absolute bottom-4 left-4" />
            <ChevronDown className="w-4 h-4 absolute bottom-4 right-4 text-surface-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-4 mb-8 p-4 bg-surface-50 dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700/50">
          <div className="flex justify-between text-sm font-bold text-surface-600 dark:text-surface-400 uppercase tracking-widest">
            <span>${unitPrice} x {guests} {selectedTour ? 'guests' : 'days'}</span>
            <span>${total}</span>
          </div>
          <div className="pt-4 border-t border-surface-200 dark:border-surface-700 flex justify-between items-end">
            <div>
                <span className="text-lg font-black text-surface-900 dark:text-surface-100 uppercase tracking-tight">Total</span>
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest leading-tight">Includes service fee</p>
            </div>
            <span className="text-2xl font-black text-primary-600 dark:text-primary-400 tracking-tight">${total}</span>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => onBook(guests, selectedDate)}
          disabled={!selectedTour}
          className="w-full py-5 rounded-[1.5rem] text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
        >
          {selectedTour ? 'Book Experience' : 'Select a Tour'}
        </Button>

        <p className="text-[10px] text-center text-surface-400 font-bold uppercase tracking-widest mt-6 leading-relaxed">
          No charge yet. You won't be charged until the guide approves your request.
        </p>

        <div className="mt-8 pt-6 border-t border-surface-100 dark:border-surface-800 space-y-3">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest leading-none">Free cancellation (48h)</span>
          </div>
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest leading-none">Best Price Guarantee</span>
          </div>
        </div>
      </Card>
      
      {/* Response Quality Badge */}
      <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800/50 flex items-center gap-4 group cursor-help transition-all hover:bg-primary-100 dark:hover:bg-primary-800/30">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin duration-[3s]" />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary-700 dark:text-primary-400">{guide?.rating >= 4.8 ? 'TOP' : 'PRO'}</span>
        </div>
        <div>
          <h4 className="text-xs font-black text-primary-700 dark:text-primary-400 uppercase tracking-widest">
            {guide?.rating >= 4.5 ? 'Elite Responder' : 'Verified Guide'}
          </h4>
          <p className="text-[10px] font-bold text-primary-600/70 dark:text-primary-400/70 uppercase tracking-widest">
            Replies {guide?.responseTime || 'within 3 hours'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSidebar;
