import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const { forgotPassword } = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await forgotPassword(email);
            setMessage('Password reset link sent to your email.');
            setError('');
        } catch (err) {
            setError('Failed to send reset email. User may not exist.');
            setMessage('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-800">
            <div className="bg-surface-50 dark:bg-surface-900 p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Forgot Password</h2>
                {message && <p className="text-green-500 mb-4 text-sm text-center">{message}</p>}
                {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Enter your email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200">Send Reset Link</button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-blue-500 text-sm hover:underline">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};
export default ForgotPassword;
