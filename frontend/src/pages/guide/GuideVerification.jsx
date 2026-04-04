import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { uploadDocuments } from '../../api/guideApi';
import { Card, Button, cn } from '../../components/ui/BaseComponents';
import { ShieldCheck, FileUp, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

const GuideVerification = () => {
    const [license, setLicense] = useState(null);
    const [identity, setIdentity] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!license || !identity) {
            toast.error("Please select both documents.");
            return;
        }

        const formData = new FormData();
        formData.append('license', license);
        formData.append('identity', identity);

        setIsUploading(true);
        const promise = uploadDocuments(formData);

        toast.promise(promise, {
            loading: 'Uploading your documents...',
            success: 'Documents uploaded successfully! We will review them shortly.',
            error: 'Upload failed. Please try again.'
        });

        try {
            await promise;
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    const FileInput = ({ label, icon: Icon, onChange, fileName }) => (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <input
                    type="file"
                    onChange={onChange}
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={cn(
                    "w-full px-6 py-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3",
                    fileName 
                    ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/50" 
                    : "bg-surface-50 border-surface-200 dark:bg-surface-900/50 dark:border-surface-800 group-hover:border-primary-400 group-hover:bg-primary-50/10"
                )}>
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                        fileName ? "bg-emerald-500 text-white" : "bg-surface-50 dark:bg-surface-900 dark:bg-surface-800 text-surface-400 group-hover:text-primary-500"
                    )}>
                        {fileName ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="text-center">
                        <p className={cn("text-xs font-black uppercase tracking-widest", fileName ? "text-emerald-600 dark:text-emerald-400" : "text-surface-600 dark:text-surface-400")}>
                            {fileName ? fileName : `Select ${label}`}
                        </p>
                        <p className="text-[10px] text-surface-400 font-medium mt-1">
                            PDF, PNG or JPG (Max 5MB)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto pb-20"
        >
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest mb-4">
                    <ShieldCheck className="w-3 h-3" />
                    Secure Verification
                </div>
                <h1 className="text-4xl font-black text-surface-900 dark:text-white tracking-tight mb-4">Verification Center</h1>
                <p className="text-muted font-medium max-w-sm mx-auto">
                    Upload your professional credentials to unlock premium guide features and build trust with explorers.
                </p>
            </div>

            <Card className="p-10 border-none shadow-premium relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FileUp className="w-32 h-32 text-primary-500" />
                </div>

                <form onSubmit={handleUpload} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FileInput 
                            label="Guide License" 
                            icon={ShieldCheck} 
                            fileName={license?.name}
                            onChange={(e) => setLicense(e.target.files[0])}
                        />
                        <FileInput 
                            label="Government ID" 
                            icon={FileUp} 
                            fileName={identity?.name}
                            onChange={(e) => setIdentity(e.target.files[0])}
                        />
                    </div>

                    <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/50 p-6 rounded-[1.5rem] flex gap-4">
                        <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0" />
                        <p className="text-[11px] text-primary-900 dark:text-primary-300 font-medium leading-relaxed">
                            Your documents are stored securely and encrypted. Our compliance team will review your application within 24-48 hours.
                        </p>
                    </div>

                    <Button 
                        type="submit" 
                        isLoading={isUploading}
                        className="w-full h-14 rounded-2xl text-xs uppercase tracking-widest font-black"
                    >
                        {isUploading ? "Processing..." : "Submit Verification Request"}
                    </Button>
                </form>
            </Card>

            {/* Support Section */}
            <div className="mt-8 text-center">
                <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">
                    Need help? <button className="text-primary-600 hover:underline">Contact compliance support</button>
                </p>
            </div>
        </motion.div>
    );
};

export default GuideVerification;
