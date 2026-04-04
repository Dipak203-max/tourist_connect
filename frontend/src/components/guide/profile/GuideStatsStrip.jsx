import React from 'react';
import { Star, Calendar, Users, Globe, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const StatItem = ({ icon: Icon, label, value, colorClass }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-surface-900 rounded-3xl border border-surface-100 dark:border-surface-800 shadow-sm transition-all duration-300"
  >
    <div className={`p-3 rounded-xl mb-3 ${colorClass}`}>
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-2xl font-black text-surface-900 dark:text-surface-100">{value}</span>
    <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest mt-1">{label}</span>
  </motion.div>
);

const GuideStatsStrip = ({ stats }) => {
  const items = [
    {
      icon: Star,
      label: 'Avg Rating',
      value: stats?.rating?.toFixed(1) || '0.0',
      colorClass: 'bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400'
    },
    {
      icon: Users,
      label: 'Reviews',
      value: stats?.totalReviews || '0',
      colorClass: 'bg-primary-50 text-primary-500 dark:bg-primary-900/30 dark:text-primary-400'
    },
    {
      icon: Calendar,
      label: 'Experiences',
      value: stats?.totalTours || '0',
      colorClass: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400'
    },
    {
      icon: ShieldCheck,
      label: 'Status',
      value: stats?.verified ? 'Verified' : 'Pending',
      colorClass: stats?.verified 
        ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400'
        : 'bg-surface-50 text-surface-400 dark:bg-surface-800 dark:text-surface-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {items.map((item, index) => (
        <StatItem key={index} {...item} />
      ))}
    </div>
  );
};

export default GuideStatsStrip;
