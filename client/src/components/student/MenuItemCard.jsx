import React from 'react';
import { useCart } from '../../context/CartContext'; // ADDED: Import useCart to check for a booked slot

// The `onInitiateBooking` prop is still needed for the first item
const MenuItemCard = ({ item, canteen, onInitiateBooking }) => {
    // ADDED: Get addToCart and the current bookedSlot from the context
    const { addToCart, bookedSlot } = useCart();
    
    const imageUrl = item.imageUrl || `https://placehold.co/150x150/E2E8F0/475569?text=${item.name.replace(/\s/g,'+')}`;

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
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-start">
            <img src={imageUrl} alt={item.name} className="w-24 h-24 rounded-md object-cover mr-4 flex-shrink-0" />
            <div className="flex-grow">
                <h4 className="font-bold text-lg text-brand-dark-blue">{item.name}</h4>
                <p className="text-sm text-gray-500 mt-1 mb-2">{item.description}</p>
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-brand-green text-lg">₹{item.price}</p>
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