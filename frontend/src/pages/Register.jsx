
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [mode, setMode] = useState('EMAIL'); // EMAIL or PHONE
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('TOURIST');
    const [phoneNumber, setPhoneNumber] = useState('');

    const { register, registerPhone, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await register(email, password, role);

        console.log("REGISTER RESPONSE:", response.data); // debug

        // ✅ Use backend email (more reliable)
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
            // Navigate to phone verify? New component required? 
            // Reuse VerifyOtp but adapt it? 
            // Or create VerifyPhone.jsx
            // Let's reuse verify-otp layout but state will differentiate.
            navigate('/verify-otp', { state: { phoneNumber, mode: 'PHONE' } });
        } catch {
            setError('Phone registration failed. Number might be in use.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-800">
            <div className="bg-surface-50 dark:bg-surface-900 p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Register</h2>

                <div className="flex mb-4 border-b">
                    <button onClick={() => { setMode('EMAIL'); setError(''); }} className={`flex-1 py-2 ${mode === 'EMAIL' ? 'border-b-2 border-blue-500 font-bold' : ''}`}>Email</button>
                    <button onClick={() => { setMode('PHONE'); setError(''); }} className={`flex-1 py-2 ${mode === 'PHONE' ? 'border-b-2 border-blue-500 font-bold' : ''}`}>Phone</button>
                </div>

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
                        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition duration-200">Register with Email</button>
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

                <div className="mt-4 border-t pt-4">
                    <button onClick={async () => {
                        const email = prompt("Enter Google Email for Simulation:");
                        if (email) {
                            try {
                                const idToken = "valid_token:" + email;
                                await googleLogin(idToken); // This saves token and sets user
                                navigate('/tourist'); // Default redirect for google
                            } catch { setError("Google Login Failed"); }
                        }
                    }} className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-200">
                        Sign up with Google
                    </button>
                </div>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};
export default Register;
