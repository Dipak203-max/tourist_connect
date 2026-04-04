import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    ShieldAlert, 
    Clock, 
    CheckCircle2, 
    XCircle,
    Award,
    Globe,
    Briefcase
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import toast from 'react-hot-toast';

const AdminVerifyGuides = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING'); 
    useEffect(() => {
        fetchGuides();
    }, [filter]);

    const fetchGuides = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getGuides(filter === 'ALL' ? '' : filter);
            setGuides(res.data);
        } catch (e) {
            toast.error('Failed to fetch guides');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        if (!window.confirm('Are you sure you want to verify this guide?')) return;
        try {
            await adminApi.verifyGuide(id);
            toast.success('Guide verified successfully');
            fetchGuides();
        } catch (e) {
            toast.error('Verification failed');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this guide?')) return;
        try {
            await adminApi.rejectGuide(id);
            toast.success('Guide rejected');
            fetchGuides();
        } catch (e) {
            toast.error('Rejection failed');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'VERIFIED': return <span className="bg-emerald-50 text-emerald-600 border-emerald-100 border px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Verified</span>;
            case 'REJECTED': return <span className="bg-rose-50 text-rose-600 border-rose-100 border px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Rejected</span>;
            default: return <span className="bg-amber-50 text-amber-600 border-amber-100 border px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>;
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-surface-900 dark:text-surface-100 tracking-tight mb-2">
                        Guide Verification
                    </h1>
                    <p className="text-sm font-bold text-muted uppercase tracking-widest">
                        Review and authorize tourist guide applications
                    </p>
                </div>

                <div className="flex bg-surface-100 dark:bg-surface-800 p-1.5 rounded-[2rem] border border-surface-200 dark:border-surface-700">
                    {['PENDING', 'VERIFIED', 'REJECTED', 'ALL'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === status 
                                ? 'bg-surface-50 dark:bg-surface-900 text-indigo-600 shadow-md ring-1 ring-gray-100' 
                                : 'text-muted hover:text-gray-600'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : guides.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-900 rounded-[2.5rem] border border-surface-200 dark:border-surface-700 shadow-sm opacity-30">
                        <Clock className="w-16 h-16 mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest">No applications found</p>
                    </div>
                ) : guides.map((guide) => (
                    <div key={guide.id} className="bg-surface-50 dark:bg-surface-900 rounded-[2.5rem] border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col group">
                        <div className="p-8 flex items-start gap-6 border-b border-gray-50 flex-1">
                            <div className="w-24 h-24 flex-shrink-0 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-4xl group-hover:rotate-3 transition-transform duration-500">
                                <Award className="w-10 h-10 text-indigo-600" />
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-surface-900 dark:text-surface-100 tracking-tight group-hover:text-indigo-600 transition-colors">
                                            {guide.name || guide.email}
                                        </h3>
                                        <p className="text-sm font-bold text-muted mt-1">{guide.email}</p>
                                    </div>
                                    {getStatusBadge(guide.verificationStatus)}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-gray-500 bg-surface-100 dark:bg-surface-800/50 p-2 rounded-xl border border-surface-200 dark:border-surface-700">
                                        <Briefcase className="w-3.5 h-3.5 text-muted" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{guide.experienceYears || 0} Years Exp</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 bg-surface-100 dark:bg-surface-800/50 p-2 rounded-xl border border-surface-200 dark:border-surface-700">
                                        <Globe className="w-3.5 h-3.5 text-muted" />
                                        <span className="text-[10px] font-black uppercase tracking-widest truncate">{guide.languages?.join(', ') || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-100 dark:bg-surface-800/30 p-8 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted">Spec:</span>
                                <span className="text-xs font-bold text-gray-600">{guide.specialization || 'Generalist'}</span>
                             </div>

                             {guide.verificationStatus === 'PENDING' && (
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => handleReject(guide.id)}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95 shadow-sm"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleVerify(guide.id)}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Verify Guide
                                    </button>
                                </div>
                             )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminVerifyGuides;
