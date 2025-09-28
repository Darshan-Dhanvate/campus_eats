import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import EditProfileModal from '../../components/common/EditProfileModal';

// Reusable components
const InfoField = ({ label, value }) => (
    <div>
        <label className="text-sm text-gray-500">{label}</label>
        <p className="font-medium text-brand-dark-blue">{value}</p>
    </div>
);

const StatCard = ({ value, label }) => (
    <div className="text-center">
        <p className="text-3xl font-bold text-brand-green">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
    </div>
);

const SettingToggle = ({ label, description, isEnabled, onToggle }) => (
    <div className="flex justify-between items-center py-3 border-b last:border-b-0">
        <div>
            <h3 className="font-medium text-brand-dark-blue">{label}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <label htmlFor={label} className="flex items-center cursor-pointer">
            <div className="relative">
                <input id={label} type="checkbox" className="sr-only" checked={isEnabled} onChange={onToggle} />
                <div className={`block w-12 h-7 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${isEnabled ? 'transform translate-x-full' : ''}`}></div>
            </div>
        </label>
    </div>
);


const CanteenProfile = () => {
    const { user, setUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [settings, setSettings] = useState({
        showInDirectory: true,
        acceptOnlineOrders: true,
    });
    const [uploadingProfileImage, setUploadingProfileImage] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                setLoadingStats(true);
                const { data } = await api.get('/canteens/analytics');
                setStats(data.kpi);
            } catch (error) {
                toast.error("Could not load canteen stats.");
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, [user]);

    const handleToggle = (settingName) => {
        setSettings(prev => ({ ...prev, [settingName]: !prev[settingName] }));
    };
    
    const handleSaveProfile = async (formData) => {
        try {
            const { data } = await api.put('/users/profile', formData);
            setUser(data);
            toast.success('Profile updated successfully!');
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile.');
        }
    };

    const handleProfileImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadingProfileImage(true);
        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const response = await api.post('/canteens/upload/profile-image', formData);
            
            if (response.data.success) {
                // Update user state with new profile image
                setUser(prev => ({
                    ...prev,
                    canteenDetails: {
                        ...prev.canteenDetails,
                        profileImage: response.data.imageUrl
                    }
                }));
                toast.success('Profile image updated successfully!');
            }
        } catch (error) {
            toast.error('Failed to upload profile image');
            console.error('Profile image upload error:', error);
        } finally {
            setUploadingProfileImage(false);
        }
    };

    if (!user) {
        return <div>Loading profile...</div>;
    }

    const { name, email, canteenDetails } = user;

    return (
        <>
            <div>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-dark-blue">Canteen Profile</h1>
                        <p className="text-gray-500">Manage your canteen information and visibility.</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#111184] text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition duration-300"
                    >
                        Edit Profile
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Profile Image Section */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-6 text-brand-dark-blue border-b pb-4">Profile Image</h2>
                            <div className="flex items-center space-x-6">
                                <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                                    {canteenDetails.profileImage ? (
                                        <img 
                                            src={`http://localhost:8000${canteenDetails.profileImage}`} 
                                            alt="Canteen Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-sm">No Image</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-4">Upload a profile image for your canteen. This will be displayed to students when they browse canteens.</p>
                                    <label className="cursor-pointer bg-brand-green text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 inline-block">
                                        {uploadingProfileImage ? 'Uploading...' : 'Choose Image'}
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleProfileImageUpload}
                                            disabled={uploadingProfileImage}
                                            className="hidden"
                                        />
                                    </label>
                                    {uploadingProfileImage && (
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-brand-green h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-6 text-brand-dark-blue border-b pb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoField label="Canteen Name" value={canteenDetails.canteenName} />
                                <InfoField label="Owner Name" value={name} />
                                <InfoField label="Email Address" value={email} />
                                <InfoField label="Phone Number" value={canteenDetails.phone || 'Not provided'} />
                                <InfoField label="Address" value={canteenDetails.canteenAddress} />
                                <InfoField label="Operating Hours" value={canteenDetails.operatingHours || 'Not set'} />
                                <InfoField label="Number of Seats" value={canteenDetails.numberOfSeats ?? 'Not set'} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 text-brand-dark-blue text-center">Business Statistics</h2>
                            {loadingStats ? (
                                <p className="text-center text-sm text-gray-500">Loading stats...</p>
                            ) : (
                                <div className="flex justify-around">
                                    <StatCard value={stats?.avgRating ?? 'N/A'} label="Avg Rating" />
                                    <StatCard value={stats?.totalOrders ?? 0} label="Total Orders" />
                                    <StatCard value={stats?.activeCustomers ?? 0} label="Customers" />
                                </div>
                            )}
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-2 text-brand-dark-blue">Visibility Settings</h2>
                            <SettingToggle 
                                label="Show in Student Directory" 
                                description="Make your canteen visible to all students"
                                isEnabled={settings.showInDirectory}
                                onToggle={() => handleToggle('showInDirectory')}
                            />
                            <SettingToggle 
                                label="Accept Online Orders" 
                                description="Allow students to place pre-orders"
                                isEnabled={settings.acceptOnlineOrders}
                                onToggle={() => handleToggle('acceptOnlineOrders')}
                            />
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

export default CanteenProfile;