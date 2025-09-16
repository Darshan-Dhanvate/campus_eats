import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import EditProfileModal from '../../components/common/EditProfileModal';

// Icon components for different sections
const UserCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const StatCard = ({ title, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
        <p className="text-xl font-bold text-brand-dark-blue">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
    </div>
);


const StudentProfile = () => {
    const { user, setUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Dummy data for stats until API provides it
    const stats = {
        totalOrders: 24,
        totalSpent: '₹2,460',
        avgRating: 4.8,
    };

    const handleSaveProfile = async (formData) => {
        try {
            const { data } = await api.put('/users/profile', formData);
            setUser(data); // Update the user in the global context
            toast.success('Profile updated successfully!');
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile.');
        }
    };

    if (!user) {
        return <div>Loading profile...</div>;
    }

    return (
        <>
            <div>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div className="flex items-center mb-4 sm:mb-0">
                        <div className="p-2 bg-gray-200 rounded-full">
                            <UserCircleIcon />
                        </div>
                        <div className="ml-4">
                            <h1 className="text-3xl font-bold text-brand-dark-blue">{user.name}</h1>
                            <p className="text-gray-500">Student Account</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#111184] text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-700 transition duration-300"
                    >
                        Edit Profile
                    </button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total Orders" value={stats.totalOrders} />
                    <StatCard title="Total Spent" value={stats.totalSpent} />
                    <StatCard title="Avg Rating Given" value={stats.avgRating} />
                </div>
                
                {/* Profile Details Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 text-brand-dark-blue">Personal Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500">Full Name</label>
                                <p className="font-medium">{user.name}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Email Address</label>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Phone Number</label>
                                <p className="font-medium">{user.phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 text-brand-dark-blue">Account Settings</h2>
                        <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">Push Notifications</h3>
                                <p className="text-sm text-gray-500">Get notified about order updates</p>
                            </div>
                            <button className="text-sm text-brand-green font-semibold">Configure</button>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">Payment Methods</h3>
                                <p className="text-sm text-gray-500">Manage your saved payment methods</p>
                            </div>
                            <button className="text-sm text-brand-green font-semibold">Manage</button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <EditProfileModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProfile}
                user={user}
            />
        </>
    );
};

export default StudentProfile;

