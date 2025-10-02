import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { PiUser, PiEnvelopeSimple, PiLockSimple, PiEye, PiEyeClosed, PiStudent, PiArrowLeft, PiGoogleLogo } from 'react-icons/pi';

// Reusing the styles from the login page for 100% consistency.
const pageStyles = `
  .bg-image {
    background-image: url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop');
    filter: blur(8px);
    transform: scale(1.1);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .animate-slide-up {
    animation: slideUp 0.6s ease-out forwards;
    opacity: 0;
    animation-fill-mode: forwards;
  }
  
  /* Floating Label Styles */
  .floating-label-group {
    position: relative;
  }

  .floating-label-group .floating-label {
    position: absolute;
    top: 50%;
    left: 3rem; /* Align with icon */
    transform: translateY(-50%);
    transition: all 0.2s ease-out;
    pointer-events: none;
    color: #9ca3af; /* gray-400 */
  }

  .floating-label-group input:not(:placeholder-shown) + .floating-label,
  .floating-label-group input:focus + .floating-label {
    top: -0.75rem;
    left: 0.75rem;
    font-size: 0.75rem;
    padding: 0 0.25rem;
    background-color: #1e293b; /* slate-800, needs to match card's bg */
    color: #5eead4; /* teal-300 */
  }
`;

const StudentSignup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            return toast.error('Please fill in all fields.');
        }
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match.');
        }
        setLoading(true);
        try {
            await register({ role: 'student', name, email, password });
        } catch (error) {
            // Error toast is handled in AuthContext
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleSignUp = () => {
        // TODO: Implement Google Sign-Up logic here
        toast('Google Sign-Up coming soon!', { icon: '🚀' });
    };

    return (
        <>
            <style>{pageStyles}</style>
            <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-gray-900 p-4">
                {/* Background & Overlay */}
                <div className="absolute inset-0 z-0 bg-image"></div>
                <div className="absolute inset-0 bg-black/70 z-0"></div>

                <Link
                    to="/"
                    className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                    <PiArrowLeft /> Back to Home
                </Link>

                {/* Form Container */}
                <div className="relative z-10 w-full max-w-md animate-slide-up">
                    <div className="border border-white/10 bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-8 sm:p-12">
                        <div className="text-center mb-8">
                            <div className="inline-block bg-teal-500/10 rounded-full p-4 mb-4">
                                <PiStudent className="text-5xl text-teal-300" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Create Student Account</h1>
                            <p className="text-gray-400 mt-2">Join CampusEats today!</p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="space-y-6">
                            {/* Full Name Input */}
                            <div className="floating-label-group">
                                <PiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-teal-400 transition-colors" />
                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="peer w-full pl-12 pr-4 py-3 bg-white/5 text-white rounded-lg border-2 border-transparent focus:border-teal-400/50 focus:bg-white/10 focus:ring-0 transition-all placeholder:text-transparent" placeholder="Full Name" required />
                                <label htmlFor="name" className="floating-label">Full Name</label>
                            </div>

                            {/* Email Input */}
                            <div className="floating-label-group">
                                <PiEnvelopeSimple className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-teal-400 transition-colors" />
                                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="peer w-full pl-12 pr-4 py-3 bg-white/5 text-white rounded-lg border-2 border-transparent focus:border-teal-400/50 focus:bg-white/10 focus:ring-0 transition-all placeholder:text-transparent" placeholder="College Email" required />
                                <label htmlFor="email" className="floating-label">College Email</label>
                            </div>

                            {/* Password Input */}
                            <div className="floating-label-group">
                                <PiLockSimple className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-teal-400 transition-colors" />
                                <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="peer w-full pl-12 pr-12 py-3 bg-white/5 text-white rounded-lg border-2 border-transparent focus:border-teal-400/50 focus:bg-white/10 focus:ring-0 transition-all placeholder:text-transparent" placeholder="Password" required />
                                <label htmlFor="password" className="floating-label">Password</label>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showPassword ? <PiEye /> : <PiEyeClosed />}</button>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="floating-label-group">
                                <PiLockSimple className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-teal-400 transition-colors" />
                                <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="peer w-full pl-12 pr-12 py-3 bg-white/5 text-white rounded-lg border-2 border-transparent focus:border-teal-400/50 focus:bg-white/10 focus:ring-0 transition-all placeholder:text-transparent" placeholder="Confirm Password" required />
                                <label htmlFor="confirmPassword" className="floating-label">Confirm Password</label>
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showConfirmPassword ? <PiEye /> : <PiEyeClosed />}</button>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-400 transition-all duration-300 disabled:bg-teal-500/50 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/30">
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="flex items-center my-8">
                            <hr className="flex-grow border-t border-gray-600" />
                            <span className="mx-4 text-xs text-gray-400">OR</span>
                            <hr className="flex-grow border-t border-gray-600" />
                        </div>

                        <button onClick={handleGoogleSignUp} className="w-full flex justify-center items-center gap-3 bg-white/10 text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/20 transition-all duration-300">
                            <PiGoogleLogo weight="bold" />
                            Sign up with Google
                        </button>

                        <p className="text-center text-sm text-gray-400 mt-8">
                            Already have an account?{' '}
                            <Link to="/login/student" className="font-medium text-teal-300 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentSignup;