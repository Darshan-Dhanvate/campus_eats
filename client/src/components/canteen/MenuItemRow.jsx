import React from 'react';

// Icons for the component
const EditIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);


const MenuItemRow = ({ item, onEdit, onDelete, onToggleAvailability }) => {
    const { name, description, price, category, isAvailable, prepTime, imageUrl: storedImage } = item;
    // Dummy rating placeholders (replace with real later)
    const rating = 4.6;
    const reviewCount = 45;
    // Determine image source: prefer absolute URL, else prefix relative with backend base, else placeholder
    const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1$/,'') || 'http://localhost:8000';
    const resolvedImage = storedImage
        ? (storedImage.startsWith('http') ? storedImage : `${base}${storedImage}`)
        : `https://placehold.co/150x150/E2E8F0/475569?text=${encodeURIComponent(name)}`;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center w-full sm:w-auto">
                <img src={resolvedImage} alt={name} className="w-20 h-20 rounded-md object-cover mr-4 flex-shrink-0" />
                <div className="flex-grow">
                    <div className="flex items-center mb-1">
                        <h4 className="font-bold text-lg text-brand-dark-blue mr-2">{name}</h4>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 max-w-md">{description}</p>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span className="font-semibold text-brand-green">₹{price}</span>
                        <span>{prepTime} min</span>
                        <span>⭐ {rating} ({reviewCount})</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                {/* Availability Toggle */}
                <label htmlFor={`toggle-${item._id}`} className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input id={`toggle-${item._id}`} type="checkbox" className="sr-only" checked={isAvailable} onChange={() => onToggleAvailability(item._id, !isAvailable)} />
                        <div className={`block w-10 h-6 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isAvailable ? 'transform translate-x-full' : ''}`}></div>
                    </div>
                </label>

                {/* Action Buttons */}
                <button onClick={() => onEdit(item)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors">
                    <EditIcon />
                </button>
                <button onClick={() => onDelete(item._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors">
                    <DeleteIcon />
                </button>
            </div>
        </div>
    );
};

export default MenuItemRow;
