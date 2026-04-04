import { useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // For simulation, users copy token from email(console) and maybe paste it into a field if URL param not working or manual flow.
    // But typically URL is http://app/reset-password?token=XYZ
    // Let's assume user visits that link.
    // If token is missing, show input?

    const [inputToken, setInputToken] = useState(token || '');
    const [newPassword, setNewPassword] = useState('');
    const { resetPassword } = useContext(AuthContext);
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await resetPassword(inputToken, newPassword);
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError('Reset failed. Token expired or password weak (Min 8 chars, 1 Upper, 1 Lower, 1 Num, 1 Special).');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-800">
            <div className="bg-surface-50 dark:bg-surface-900 p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Reset Password</h2>
                {message && <p className="text-green-500 mb-4 text-sm text-center">{message}</p>}
                {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Token</label>
                        <input type="text" value={inputToken} onChange={(e) => setInputToken(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required placeholder="Paste token here" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200">Reset Password</button>
                </form>
            </div>
        </div>
    );
};
export default ResetPassword;
