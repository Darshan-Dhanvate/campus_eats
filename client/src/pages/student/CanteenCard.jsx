import React from 'react';
import { Link } from 'react-router-dom';

// Icons for the card details
const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CuisineIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CanteenCard = ({ canteen }) => {
    const { canteenName, canteenAddress, isOpen } = canteen.canteenDetails;
    // Dummy data until backend provides it
    const rating = 4.5; 
    const prepTime = "15-20 min";
    const cuisine = "Indian, Continental";
    const imageUrl = `https://placehold.co/600x400/E2E8F0/475569?text=${canteenName.replace(/\s/g,'+')}`;

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <div className="relative">
                <img className="w-full h-48 object-cover" src={imageUrl} alt={canteenName} />
                <span className={`absolute top-2 left-2 text-xs font-bold py-1 px-2 rounded-full text-white ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isOpen ? 'Open' : 'Closed'}
                </span>
                <span className="absolute top-2 right-2 text-xs font-bold py-1 px-2 rounded-full text-white bg-black bg-opacity-50">
                    {prepTime}
                </span>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-brand-dark-blue">{canteenName}</h3>
                    <div className="flex items-center">
                        <StarIcon />
                        <span className="ml-1 text-sm font-medium text-gray-700">{rating}</span>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-brand-text-light">
                    <div className="flex items-center">
                        <LocationIcon />
                        <p className="ml-2">{canteenAddress}</p>
                    </div>
                    <div className="flex items-center">
                        <CuisineIcon />
                        <p className="ml-2">{cuisine}</p>
                    </div>
                </div>
                
                <div className="mt-4">
                    <Link
                        to={`/canteen/${canteen._id}/menu`}
                        className={`w-full text-center block font-bold py-2 px-4 rounded-lg transition duration-300 ${
                            isOpen
                            ? 'bg-brand-green text-white hover:bg-green-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        // Prevent navigation if canteen is closed
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
