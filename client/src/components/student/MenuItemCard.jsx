import React from 'react';
import { useCart } from '../../context/CartContext';

const MenuItemCard = ({ item, canteen }) => {
    const { addToCart } = useCart();
    
    // Fallback image if item has no image URL
    const imageUrl = item.imageUrl || `https://placehold.co/150x150/E2E8F0/475569?text=${item.name.replace(/\s/g,'+')}`;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-start">
            <img src={imageUrl} alt={item.name} className="w-24 h-24 rounded-md object-cover mr-4 flex-shrink-0" />
            <div className="flex-grow">
                <h4 className="font-bold text-lg text-brand-dark-blue">{item.name}</h4>
                <p className="text-sm text-gray-500 mt-1 mb-2">{item.description}</p>
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-brand-green text-lg">₹{item.price}</p>
                    <button 
                        onClick={() => addToCart(item, canteen)}
                        disabled={!item.isAvailable}
                        className="bg-[green] text-white font-bold py-2 px-5 rounded-lg text-sm hover:bg-green-600 transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {item.isAvailable ? 'Add' : 'Unavailable'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuItemCard;
