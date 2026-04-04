import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { CheckCircle2, XCircle, Loader2, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, failed
    const { user } = useAuth();
    const pidx = searchParams.get('pidx');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!pidx) {
                setStatus('failed');
                return;
            }

            try {
                const response = await axiosInstance.post('/payments/verify', { pidx });
                if (response.data.status === 'Completed') {
                    setStatus('success');
                    toast.success('Payment successful!');
                } else {
                    setStatus('failed');
                    toast.error('Payment verification failed');
                }
            } catch (error) {
                setStatus('failed');
                toast.error('Error verifying payment');
                console.error(error);
            }
        };

        verifyPayment();
    }, [pidx]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-surface-50 dark:bg-surface-900 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-10 text-center border border-surface-200 dark:border-surface-700">
                {status === 'verifying' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <Loader2 className="w-20 h-20 text-indigo-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100">Verifying Payment</h2>
                        <p className="text-gray-500 font-medium">Please wait while we confirm your transaction with Khalti...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="flex justify-center">
                            <div className="bg-emerald-100 p-6 rounded-full">
                                <CheckCircle2 className="w-20 h-20 text-emerald-600" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-surface-900 dark:text-surface-100 tracking-tight">Payment Successful!</h2>
                        <p className="text-gray-500 font-medium">Your tour booking has been confirmed. You can now track it in your dashboard.</p>
                        <button
                            onClick={() => navigate('/tourist/bookings')}
                            className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all group"
                        >
                            Go to My Bookings
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => navigate('/admin/payments')}
                                className="w-full bg-indigo-50 text-indigo-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100 mt-4"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                View in Admin Panel
                            </button>
                        )}
                    </div>
                )}

                {status === 'failed' && (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="flex justify-center">
                            <div className="bg-red-100 p-6 rounded-full">
                                <XCircle className="w-20 h-20 text-red-600" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-surface-900 dark:text-surface-100 tracking-tight">Payment Failed</h2>
                        <p className="text-gray-500 font-medium">Something went wrong with your transaction. If money was deducted, please contact support.</p>
                        <button
                            onClick={() => navigate('/tourist/bookings')}
                            className="w-full bg-red-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition-all"
                        >
                            Back to Bookings
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
