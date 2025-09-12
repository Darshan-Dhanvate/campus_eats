import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StudentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.083 12.083 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.083 12.083 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l11 6 11-6" />
    </svg>
);

const StudentSignup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
            // The router will automatically navigate on successful registration
        } catch (error) {
            // Error toast is handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-xl p-8 sm:p-12 w-full max-w-md">
            <Link to="/" className="text-sm text-brand-text-light hover:text-brand-dark-blue mb-8 inline-block">
                &larr; Back to Home
            </Link>
            <div className="text-center mb-8">
                <div className="bg-green-100 rounded-full p-4 mb-4 inline-block">
                    <StudentIcon />
                </div>
                <h1 className="text-2xl font-bold text-brand-dark-blue">Create Student Account</h1>
            </div>
            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-brand-text-light mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-brand-medium-gray rounded-lg focus:ring-brand-green focus:border-brand-green"
                        placeholder="Enter your full name"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-brand-text-light mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-brand-medium-gray rounded-lg focus:ring-brand-green focus:border-brand-green"
                        placeholder="Enter your college email"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-brand-text-light mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-brand-medium-gray rounded-lg focus:ring-brand-green focus:border-brand-green"
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-text-light mb-2">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-brand-medium-gray rounded-lg focus:ring-brand-green focus:border-brand-green"
                        placeholder="Confirm your password"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-green text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition duration-300 disabled:bg-green-300"
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>
            <p className="text-center text-sm text-brand-text-light mt-6">
                Already have an account?{' '}
                <Link to="/login/student" className="font-medium text-brand-green hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
};

export default StudentSignup;
