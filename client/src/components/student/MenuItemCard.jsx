import React from 'react';
import { useCart } from '../../context/CartContext'; // ADDED: Import useCart to check for a booked slot

// The `onInitiateBooking` prop is still needed for the first item
const MenuItemCard = ({ item, canteen, onInitiateBooking }) => {
    // ADDED: Get addToCart and the current bookedSlot from the context
    const { addToCart, bookedSlot } = useCart();
    
    const imageUrl = item.imageUrl || `https://placehold.co/150x150/E2E8F0/475569?text=${item.name.replace(/\s/g,'+')}`;

    // Calculate discounted price
    const hasDiscount = item.discountPercentage && item.discountPercentage > 0;
    const discountedPrice = hasDiscount ? (item.price * (1 - item.discountPercentage / 100)).toFixed(2) : item.price;

    const handleAddItem = () => {
        // This is the core of the new logic 👇
        if (bookedSlot) {
            // If a slot is already booked, add the item directly to the cart.
            // We pass the existing bookedSlot and no seatsNeeded, as seats are already accounted for.
            addToCart(item, canteen, bookedSlot);
        } else {
            // If no slot is booked, initiate the booking process by opening the modal.
            onInitiateBooking(item);
        }
    };

    // ADDED: The button text changes depending on whether a slot is booked
    const buttonText = bookedSlot ? 'Add' : 'Book Slot';

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-start relative">
            {hasDiscount && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-lg animate-pulse">
                    <span className="text-yellow-300 mr-1">★</span>
                    {item.discountPercentage}% OFF
                </div>
            )}
            <img src={imageUrl} alt={item.name} className="w-24 h-24 rounded-md object-cover mr-4 flex-shrink-0" />
            <div className="flex-grow">
                <h4 className="font-bold text-lg text-brand-dark-blue">{item.name}</h4>
                <p className="text-sm text-gray-500 mt-1 mb-2">{item.description}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {hasDiscount ? (
                            <>
                                <p className="font-semibold text-brand-green text-lg">₹{discountedPrice}</p>
                                <p className="text-sm text-gray-500 line-through">₹{item.price}</p>
                            </>
                        ) : (
                            <p className="font-semibold text-brand-green text-lg">₹{item.price}</p>
                        )}
                    </div>
                    <button 
                        onClick={handleAddItem} // MODIFIED: Calls the new handler function
                        disabled={!item.isAvailable}
                        className="bg-[green] text-white font-bold py-2 px-5 rounded-lg text-sm hover:bg-green-600 transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {item.isAvailable ? buttonText : 'Unavailable'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuItemCard;