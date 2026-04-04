import React from 'react';
import { 
    UserPlus, 
    CalendarCheck, 
    CreditCard, 
    ShieldCheck, 
    ShieldAlert, 
    Clock,
    CircleDashed
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../ui/BaseComponents';

const ActivityFeed = ({ activities }) => {
    
    const getActivityConfig = (type) => {
        switch (type) {
            case 'USER_REGISTERED': return { 
                icon: <UserPlus className="w-4 h-4" />, 
                color: "text-primary-600 dark:text-primary-400", 
                bg: "bg-primary-50 dark:bg-primary-900/20" 
            };
            case 'BOOKING_CREATED': return { 
                icon: <CalendarCheck className="w-4 h-4" />, 
                color: "text-emerald-600 dark:text-emerald-400", 
                bg: "bg-emerald-50 dark:bg-emerald-900/20" 
            };
            case 'PAYMENT_SUCCESS': return { 
                icon: <CreditCard className="w-4 h-4" />, 
                color: "text-amber-600 dark:text-amber-400", 
                bg: "bg-amber-50 dark:bg-amber-900/20" 
            };
            case 'GUIDE_VERIFIED': return { 
                icon: <ShieldCheck className="w-4 h-4" />, 
                color: "text-violet-600 dark:text-violet-400", 
                bg: "bg-violet-50 dark:bg-violet-900/20" 
            };
            case 'GUIDE_REJECTED': return { 
                icon: <ShieldAlert className="w-4 h-4" />, 
                color: "text-rose-600 dark:text-rose-400", 
                bg: "bg-rose-50 dark:bg-rose-900/20" 
            };
            default: return { 
                icon: <Clock className="w-4 h-4" />, 
                color: "text-surface-600 dark:text-surface-400", 
                bg: "bg-surface-50 dark:bg-surface-800" 
            };
        }
    };

    return (
        <div className="flex flex-col h-full ring-1 ring-surface-100 dark:ring-surface-800">
            <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-none">
                {activities && activities.length > 0 ? (
                    <div className="divide-y divide-surface-50 dark:divide-surface-800/50">
                        {activities.map((activity, index) => {
                            const config = getActivityConfig(activity.type);
                            return (
                                <div key={activity.id || index} className="p-5 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-all flex gap-4 group">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                        config.bg,
                                        config.color
                                    )}>
                                        {config.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1 gap-4">
                                            <p className="text-sm font-bold text-surface-900 dark:text-white leading-tight truncate">
                                                {activity.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-surface-400 truncate">
                                                    {activity.userName || 'System Auto'}
                                                </span>
                                                {activity.referenceId && (
                                                    <span className="text-[10px] font-black text-primary-500/80 bg-primary-500/5 px-1.5 rounded">
                                                        #{activity.referenceId}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold text-surface-400 whitespace-nowrap">
                                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-16 h-16 bg-surface-50 dark:bg-surface-800 rounded-3xl flex items-center justify-center mb-4">
                            <CircleDashed className="w-8 h-8 text-surface-200 animate-spin-slow" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-surface-300">No recent activity detected</p>
                    </div>
                )}
            </div>
            
            <button className="p-4 bg-surface-50 dark:bg-surface-800/50 text-[10px] font-black uppercase tracking-widest text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors border-t border-surface-100 dark:border-surface-800 mt-auto">
                View Detailed Platform History
            </button>
        </div>
    );
};

export default ActivityFeed;
