import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CountUp } from 'countup.js';
import { 
    LineChart, 
    Line, 
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { cn } from '../ui/BaseComponents';

const StatCard = ({ title, value, icon, color, trend, growth, prefix = '', suffix = '' }) => {
    const countUpRef = useRef(null);
    const countUpInstance = useRef(null);
    const isPositive = growth >= 0;

    // Extract numeric value from string if needed (e.g., "NPR 5000" -> 5000)
    const numericValue = typeof value === 'string' 
        ? parseFloat(value.replace(/[^0-9.]/g, '')) 
        : value;

    useEffect(() => {
        if (countUpRef.current) {
            countUpInstance.current = new CountUp(countUpRef.current, numericValue, {
                startVal: 0,
                duration: 2,
                prefix: prefix,
                suffix: suffix,
                separator: ',',
                decimalPlaces: numericValue % 1 !== 0 ? 1 : 0
            });
            if (!countUpInstance.current.error) {
                countUpInstance.current.start();
            }
        }
    }, [numericValue, prefix, suffix]);

    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: 'var(--tw-shadow-premium-hover)' }}
            className="glass-card p-6 rounded-3xl border border-surface-100 dark:border-surface-800 transition-all duration-300 group overflow-hidden relative"
        >
            {/* Background Accent */}
            <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 blur-2xl transition-all duration-500 group-hover:scale-150", color)} />

            <div className="flex justify-between items-start mb-6">
                <div className={cn(
                    "p-3 rounded-2xl shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110",
                    color,
                    "shadow-sm"
                )}>
                    {React.cloneElement(icon, { className: "w-5 h-5 text-white" })}
                </div>
                
                {trend && trend.length > 0 && (
                    <div className="w-20 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend.map((v, i) => ({ value: v, i }))}>
                                <defs>
                                    <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={isPositive ? '#10b981' : '#ef4444'}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill={`url(#gradient-${title.replace(/\s+/g, '')})`}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
            
            <div className="relative z-10">
                <p className="text-[10px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-[0.2em] mb-1">
                    {title}
                </p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight leading-none">
                        <span ref={countUpRef}>0</span>
                    </h3>
                    {growth !== undefined && (
                        <div className={cn(
                            "flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-lg border",
                            isPositive 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50" 
                                : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50"
                        )}>
                            {isPositive ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export const StatCardSkeleton = () => (
    <div className="glass-card p-6 rounded-3xl border border-surface-100 dark:border-surface-800 animate-pulse">
        <div className="flex justify-between items-start mb-6">
            <div className="w-11 h-11 bg-surface-100 dark:bg-surface-800 rounded-2xl" />
            <div className="w-20 h-10 bg-surface-50 dark:bg-surface-800/50 rounded-lg" />
        </div>
        <div className="space-y-3">
            <div className="w-24 h-2 bg-surface-100 dark:bg-surface-800 rounded-full" />
            <div className="w-32 h-6 bg-surface-100 dark:bg-surface-800 rounded-lg" />
        </div>
    </div>
);

export default StatCard;
