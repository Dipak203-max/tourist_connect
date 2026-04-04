import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const role = await googleLogin(credentialResponse.credential);
            if (role === 'ADMIN') navigate('/admin');
            else if (role === 'TOURIST') navigate('/tourist');
            else if (role === 'GUIDE') navigate('/guide');
            else navigate('/');
        } catch (err) {
            console.error("Google login error:", err);
            setError("Google Login Failed. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const role = await login(email, password);
            if (role === 'ADMIN') navigate('/admin');
            else if (role === 'TOURIST') navigate('/tourist');
            else if (role === 'GUIDE') navigate('/guide');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data || 'Invalid credentials or account not verified');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-800">
            <div className="bg-surface-50 dark:bg-surface-900 p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Login</h2>
                {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-200 mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-surface-800 dark:text-white" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-200 mb-2">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-surface-800 dark:text-white" required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200 font-semibold mb-4">Login</button>

                    <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        <Link to="/forgot-password" className="text-blue-500 hover:underline">Forgot Password?</Link>
                    </p>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
                    </p>
                </form>

                <div className="mt-6 flex flex-col items-center">
                    <div className="relative w-full mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm uppercase">
                            <span className="bg-surface-50 dark:bg-surface-900 px-2 text-muted">Or continue with</span>
                        </div>
                    </div>
                    
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            setError("Google Login Failed");
                        }}
                        useOneTap
                        theme="filled_blue"
                        shape="pill"
                    />
                </div>
            </div>
        </div>
    );
};
export default Login;
