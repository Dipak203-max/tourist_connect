import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialRole = queryParams.get('role')?.toUpperCase() === 'GUIDE' ? 'GUIDE' : 'TOURIST';

    const [mode] = useState('EMAIL'); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(initialRole);
    const [phoneNumber, setPhoneNumber] = useState('');

    const { register, registerPhone } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await register(email, password, role);
            console.log("REGISTER RESPONSE:", response.data); 
            const returnedEmail = response.data?.email || email;
            navigate('/verify-otp', { state: { email: returnedEmail } });
        } catch (err) {
            console.error("REGISTER ERROR:", err.response || err);
            setError(
                err.response?.data?.message ||
                'Registration failed. Email might be in use or password too weak.'
            );
        }
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerPhone(phoneNumber);
            navigate('/verify-otp', { state: { phoneNumber } });
        } catch (err) {
            setError(err.response?.data?.message || 'Phone registration failed.');
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-800">
            <div className="bg-surface-50 dark:bg-surface-900 p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Register</h2>

                

                {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}

                {mode === 'EMAIL' ? (
                    <form onSubmit={handleEmailSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Role</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="TOURIST">Tourist</option>
                                <option value="GUIDE">Guide</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition duration-200">Register</button>
                    </form>
                ) : (
                    <form onSubmit={handlePhoneSubmit}>
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Phone Number</label>
                            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1234567890" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition duration-200">Get OTP</button>
                    </form>
                )}

                

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};
export default Register;
