import React, { useState } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../ui/BaseComponents';

const AdminCharts = ({ charts }) => {
    const [activeTab, setActiveTab] = useState('revenue');

    if (!charts) return null;

    const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-card p-4 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-2xl">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-black text-surface-900 dark:text-white">
                        {activeTab === 'revenue' && 'NPR '}
                        {payload[0].value.toLocaleString()}
                        {activeTab === 'users' && ' Users'}
                        {activeTab === 'bookings' && ' Bookings'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Trend Chart */}
            <div className="lg:col-span-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div className="flex bg-surface-100 dark:bg-surface-800/50 p-1 rounded-xl border border-surface-200 dark:border-surface-700/50 w-full sm:w-auto">
                        {['revenue', 'bookings', 'users'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "flex-1 sm:flex-none px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === tab 
                                    ? "bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm" 
                                    : "text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="h-full w-full"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                {activeTab === 'revenue' ? (
                                    <AreaChart data={charts.revenueData}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-surface-100 dark:text-surface-800" />
                                        <XAxis 
                                            dataKey="label" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                                            tickFormatter={(val) => `${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{stroke: '#0ea5e9', strokeWidth: 1, strokeDasharray: '4 4'}} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke="#0ea5e9" 
                                            strokeWidth={3} 
                                            fillOpacity={1} 
                                            fill="url(#colorRev)" 
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                ) : activeTab === 'bookings' ? (
                                    <BarChart data={charts.bookingData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-surface-100 dark:text-surface-800" />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'currentColor', opacity: 0.05}} className="text-surface-200" />
                                        <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} animationDuration={1500} />
                                    </BarChart>
                                ) : (
                                    <AreaChart data={charts.userData}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-surface-100 dark:text-surface-800" />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                                        <Tooltip content={<CustomTooltip />} cursor={{stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4'}} />
                                        <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" animationDuration={1500} />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Guide Distribution (Donut Chart) */}
            <div className="flex flex-col items-center">
                <div className="h-[300px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={charts.guideApprovalData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={10}
                                dataKey="value"
                                stroke="none"
                            >
                                {charts.guideApprovalData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Inner Text for Donut */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-surface-900 dark:text-white">
                            {charts.guideApprovalData.reduce((acc, curr) => acc + curr.value, 0)}
                        </span>
                        <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Total Guides</span>
                    </div>
                </div>
                
                {/* Custom Legend */}
                <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                    {charts.guideApprovalData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-surface-400 uppercase tracking-tighter leading-none">{entry.name}</span>
                                <span className="text-sm font-bold text-surface-900 dark:text-white">{entry.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminCharts;
