import React from 'react';
import { Link } from 'react-router-dom';

// Icons for the card details
const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CanteenCard = ({ canteen }) => {
    // Destructure only the data available from the API
    const { canteenName, canteenAddress, isOpen, profileImage } = canteen.canteenDetails;
    
    // Use server image if available, otherwise placeholder
    const imageUrl = profileImage ? 
        `http://localhost:8000${profileImage}` : 
        `https://placehold.co/600x400/E2E8F0/475569?text=${canteenName.replace(/\s/g,'+')}`;

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <div className="relative">
                <img className="w-full h-48 object-cover" src={imageUrl} alt={canteenName} />
                <span className={`absolute top-2 left-2 text-xs font-bold py-1 px-2 rounded-full text-white ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isOpen ? 'Open' : 'Closed'}
                </span>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-brand-dark-blue mb-2">{canteenName}</h3>
                    <div className="flex items-center text-sm text-brand-text-light">
                        <LocationIcon />
                        <p className="ml-2">{canteenAddress}</p>
                    </div>
                </div>
                
                <div className="mt-4">
                    <Link
                        to={`/student/canteen/${canteen._id}/menu`}
                        className={`w-full text-center block font-bold py-2 px-4 rounded-lg transition duration-300 ${
                            isOpen
                            ? 'bg-[green] text-white hover:bg-green-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={(e) => !isOpen && e.preventDefault()}
                    >
                        View Menu
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CanteenCard;

