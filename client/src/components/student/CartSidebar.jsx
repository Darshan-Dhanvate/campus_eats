import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

// Icons for the cart actions
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const TrashIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);


const CartSidebar = () => {
    // MODIFIED: We now also get bookedSlot to display info
    const { cartItems, canteenInfo, bookedSlot, addToCart, removeFromCart, clearCart, cartTotal } = useCart();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="font-bold text-xl text-brand-dark-blue">Your Order</h3>
                {cartItems.length > 0 && (
                    <button onClick={clearCart} className="text-sm text-red-500 hover:underline flex items-center">
                        <TrashIcon /> <span className="ml-1">Clear</span>
                    </button>
                )}
            </div>

            {/* ADDED: Display the booked slot time if it exists */}
            {bookedSlot && (
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-4 text-sm">
                    <p><strong>Slot Booked:</strong> {bookedSlot.startTime}</p>
                    <p><strong>Seats Reserved:</strong> {bookedSlot.seatsNeeded}</p>
                </div>
            )}

            {cartItems.length === 0 ? (
                <p className="text-center text-gray-500 py-12">Your cart is empty</p>
            ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {/* MODIFIED: Changed `item` to `cartItem` to avoid confusion */}
                    {cartItems.map(cartItem => (
                        <div key={cartItem.item._id} className="flex items-center justify-between">
                            <div>
                                {/* MODIFIED: Access properties via `cartItem.item` */}
                                <p className="font-semibold text-sm">{cartItem.item.name}</p>
                                <p className="text-sm text-brand-green">₹{cartItem.item.price}</p>
                            </div>
                            <div className="flex items-center border rounded-lg">
                                {/* MODIFIED: Pass the correct item ID */}
                                <button onClick={() => removeFromCart(cartItem.item._id)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg">
                                    <MinusIcon />
                                </button>
                                {/* MODIFIED: Access quantity directly */}
                                <span className="px-3 py-1 text-sm font-bold">{cartItem.quantity}</span>
                                {/* MODIFIED: Pass the correct item object */}
                                <button onClick={() => addToCart(cartItem.item, canteenInfo)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg">
                                    <PlusIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {cartItems.length > 0 && (
                 <div className="border-t mt-4 pt-4">
                     <div className="flex justify-between text-lg font-bold">
                         <span>Total</span>
                         <span>₹{cartTotal}</span>
                     </div>
                      <Link to="/checkout">
                          <button className="w-full bg-[green] text-white font-bold py-3 rounded-lg mt-4 hover:bg-green-600 transition duration-300">
                              Go to Checkout
                          </button>
                      </Link>
                 </div>
            )}
        </div>
    );
};

export default CartSidebar;