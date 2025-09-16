import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CanteenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-dark-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" />
    </svg>
);

const CanteenLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate(); // Get the navigate function from the router

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            return toast.error('Please fill in all fields.');
        }
        setLoading(true);
        try {
            const loggedInUser = await login(email, password);
            // FIX: Only navigate AFTER the login is confirmed to be successful
            if (loggedInUser) {
                navigate('/canteen/orders'); // Manually navigate to the dashboard
            }
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
                <div className="bg-blue-100 rounded-full p-4 mb-4 inline-block">
                    <CanteenIcon />
                </div>
                <h1 className="text-2xl font-bold text-brand-dark-blue">Canteen Owner Login</h1>
            </div>
            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-brand-text-light mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-brand-medium-gray rounded-lg focus:ring-[#111184] focus:border-[#111184]"
                        placeholder="Enter your business email"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-brand-text-light mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-brand-medium-gray rounded-lg focus:ring-[#111184] focus:border-[#111184]"
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#111184] text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition duration-300 disabled:bg-slate-400"
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
            <p className="text-center text-sm text-brand-text-light mt-6">
                Don't have an account?{' '}
                <Link to="/register/canteen" className="font-medium text-brand-dark-blue hover:underline">
                    Register canteen
                </Link>
            </p>
        </div>
    );
};

export default CanteenLogin;

