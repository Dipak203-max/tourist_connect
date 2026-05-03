import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    ShieldAlert, 
    Clock, 
    CheckCircle2, 
    XCircle,
    Award,
    Globe,
    Briefcase,
    Eye,
    X,
    FileUp
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../config';


const AdminVerifyGuides = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING'); 
    const [selectedDocs, setSelectedDocs] = useState(null);
    const [rejectionModal, setRejectionModal] = useState({ show: false, guideId: null, reason: '' });
    const [verifyModal, setVerifyModal] = useState({ show: false, guideId: null, certificate: null });
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

    const handleVerify = async () => {
        const formData = new FormData();
        if (verifyModal.certificate) {
            formData.append('certificate', verifyModal.certificate);
        }
        
        try {
            await adminApi.verifyGuide(verifyModal.guideId, formData);
            toast.success('Guide verified successfully');
            setVerifyModal({ show: false, guideId: null, certificate: null });
            fetchGuides();
        } catch (e) {
            toast.error('Verification failed');
        }
    };

    const handleReject = async () => {
        if (!rejectionModal.reason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }
        try {
            await adminApi.rejectGuide(rejectionModal.guideId, rejectionModal.reason);
            toast.success('Guide rejected');
            setRejectionModal({ show: false, guideId: null, reason: '' });
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

                                {guide.verificationStatus === 'REJECTED' && guide.rejectionReason && (
                                    <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/50 rounded-xl">
                                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Rejection Reason:</p>
                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 italic">"{guide.rejectionReason}"</p>
                                    </div>
                                )}

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
                                 <span className="text-xs font-bold text-gray-600">{guide.specialization || 'Generalist'}</span>
                              </div>

                              {(guide.licenseDocumentUrl || guide.identityDocumentUrl) && (
                                <button 
                                    onClick={() => setSelectedDocs({
                                        license: guide.licenseDocumentUrl,
                                        identity: guide.identityDocumentUrl,
                                        name: guide.name
                                    })}
                                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    View Documents
                                </button>
                              )}

                             {guide.verificationStatus === 'PENDING' && (
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setRejectionModal({ show: true, guideId: guide.id, reason: '' })}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95 shadow-sm"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => setVerifyModal({ show: true, guideId: guide.id, certificate: null })}
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

            {/* Document Viewer Modal */}
            {selectedDocs && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-surface-50 dark:bg-surface-900 w-full max-w-5xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100 tracking-tight">Verification Documents</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted">Applicant: {selectedDocs.name}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedDocs(null)}
                                className="p-3 hover:bg-white rounded-2xl transition-all active:scale-90"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted text-center">Guide License</h3>
                                <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                    {selectedDocs.license ? (
                                        selectedDocs.license.toLowerCase().endsWith('.pdf') ? (
                                            <iframe 
                                                src={getMediaUrl(selectedDocs.license)} 
                                                className="w-full h-full border-none"
                                                title="License PDF"
                                            />
                                        ) : (
                                            <img 
                                                src={getMediaUrl(selectedDocs.license)} 
                                                alt="License" 
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/600x400?text=License+Image+Not+Found';
                                                }}
                                            />
                                        )

                                    ) : (
                                        <div className="text-center p-8">
                                            <ShieldAlert className="w-10 h-10 text-rose-300 mx-auto mb-2" />
                                            <p className="text-xs font-bold text-gray-400">No license image provided</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted text-center">Identity / Citizenship</h3>
                                <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                    {selectedDocs.identity ? (
                                        selectedDocs.identity.toLowerCase().endsWith('.pdf') ? (
                                            <iframe 
                                                src={getMediaUrl(selectedDocs.identity)} 
                                                className="w-full h-full border-none"
                                                title="Identity PDF"
                                            />
                                        ) : (
                                            <img 
                                                src={getMediaUrl(selectedDocs.identity)} 
                                                alt="Identity" 
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/600x400?text=Identity+Image+Not+Found';
                                                }}
                                            />
                                        )

                                    ) : (
                                        <div className="text-center p-8">
                                            <ShieldAlert className="w-10 h-10 text-rose-300 mx-auto mb-2" />
                                            <p className="text-xs font-bold text-gray-400">No identity image provided</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-surface-100 dark:bg-surface-800/50 border-t border-gray-100 dark:border-surface-700 flex justify-end">
                            <button 
                                onClick={() => setSelectedDocs(null)}
                                className="px-8 py-3 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:shadow-md transition-all active:scale-95"
                            >
                                Close Viewer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {rejectionModal.show && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-surface-50 dark:bg-surface-900 w-full max-w-lg rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100 tracking-tight">Rejection Reason</h2>
                            <button 
                                onClick={() => setRejectionModal({ show: false, guideId: null, reason: '' })}
                                className="p-3 hover:bg-white rounded-2xl transition-all active:scale-90"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-8">
                            <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest block mb-3">Please specify why the application is being rejected:</label>
                            <textarea 
                                value={rejectionModal.reason}
                                onChange={(e) => setRejectionModal({...rejectionModal, reason: e.target.value})}
                                placeholder="e.g., Document is unclear, invalid ID number, etc."
                                className="w-full h-32 p-4 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl text-sm font-bold text-surface-900 dark:text-surface-100 focus:ring-4 focus:ring-rose-50 transition-all outline-none resize-none"
                            />
                        </div>
                        <div className="p-8 bg-surface-100 dark:bg-surface-800/50 border-t border-gray-100 dark:border-surface-700 flex justify-end gap-4">
                            <button 
                                onClick={() => setRejectionModal({ show: false, guideId: null, reason: '' })}
                                className="px-6 py-3 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:shadow-md transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleReject}
                                className="px-8 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Verify Modal with Certificate Upload */}
            {verifyModal.show && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-surface-50 dark:bg-surface-900 w-full max-w-lg rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100 tracking-tight">Verify Guide</h2>
                            <button 
                                onClick={() => setVerifyModal({ show: false, guideId: null, certificate: null })}
                                className="p-3 hover:bg-white rounded-2xl transition-all active:scale-90"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-8">
                            <p className="text-xs font-bold text-gray-600 mb-6">Are you sure you want to verify this guide? You can optionally upload a verification certificate (PDF).</p>
                            
                            <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest block mb-3">Verification Certificate (Optional PDF):</label>
                            <div className="relative group">
                                <input 
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setVerifyModal({...verifyModal, certificate: e.target.files[0]})}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`w-full p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${
                                    verifyModal.certificate 
                                    ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-800/50" 
                                    : "bg-surface-100 border-surface-200 dark:bg-surface-800 dark:border-surface-700"
                                }`}>
                                    <FileUp className={`w-6 h-6 ${verifyModal.certificate ? "text-indigo-600" : "text-gray-400"}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        {verifyModal.certificate ? verifyModal.certificate.name : "Click to upload PDF"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-surface-100 dark:bg-surface-800/50 border-t border-gray-100 dark:border-surface-700 flex justify-end gap-4">
                            <button 
                                onClick={() => setVerifyModal({ show: false, guideId: null, certificate: null })}
                                className="px-6 py-3 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:shadow-md transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleVerify}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                            >
                                Confirm Verification
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerifyGuides;
