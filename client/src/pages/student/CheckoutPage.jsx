import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
    const { cartItems, canteenInfo, bookedSlot, cartTotal, clearCart } = useCart(); // Also get bookedSlot
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handlePlaceOrder = async () => {
        if (!user) {
            toast.error("Please log in to place an order.");
            return navigate('/login/student');
        }
        if (cartItems.length === 0) {
            toast.error("Your cart is empty.");
            return;
        }

        setLoading(true);

        const orderData = {
            canteen: canteenInfo._id,
            // Use discounted prices for order items
            items: cartItems.map(cartItem => {
                const hasDiscount = cartItem.item.discountPercentage && cartItem.item.discountPercentage > 0;
                const effectivePrice = hasDiscount ? 
                    cartItem.item.price * (1 - cartItem.item.discountPercentage / 100) : 
                    cartItem.item.price;
                return {
                    menuItem: cartItem.item._id,
                    quantity: cartItem.quantity,
                    price: effectivePrice,
                };
            }),
            totalAmount: cartTotal,
            // ADDED: Include the booked slot info in the order
            bookedSlot: {
                startTime: bookedSlot.startTime,
                seatsOccupied: bookedSlot.seatsNeeded
            },
            paymentMethod: 'Card',
            paymentStatus: 'Paid'
        };

        try {
            await api.post('/orders', orderData);
            toast.success('Order placed successfully!');
            clearCart();
            navigate('/student/orders');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
            console.error("Place Order Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
                <Link to="/student/browse" className="bg-[green] text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600">
                    Browse Canteens
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-brand-dark-blue mb-8 text-center">Checkout</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Summary (Right Column on Desktop) */}
                <div className="lg:col-span-1 lg:order-2">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                        <h2 className="text-xl font-semibold border-b pb-4 mb-4">Order Summary</h2>
                        {/* ADDED: Display booked slot details */}
                        {bookedSlot && (
                            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-4 text-sm">
                                <p><strong>Slot Booked:</strong> {bookedSlot.startTime}</p>
                                <p><strong>Seats Reserved:</strong> {bookedSlot.seatsNeeded}</p>
                            </div>
                        )}
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-4">
                            {/* MODIFIED: Use cartItem and access the nested item object */}
                            {cartItems.map(cartItem => {
                                const hasDiscount = cartItem.item.discountPercentage && cartItem.item.discountPercentage > 0;
                                const effectivePrice = hasDiscount ? 
                                    cartItem.item.price * (1 - cartItem.item.discountPercentage / 100) : 
                                    cartItem.item.price;
                                return (
                                    <div key={cartItem.item._id} className="flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-semibold">{cartItem.item.name} <span className="text-gray-500">x{cartItem.quantity}</span></p>
                                            {hasDiscount && (
                                                <p className="text-xs text-red-500">{cartItem.item.discountPercentage}% OFF</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {hasDiscount ? (
                                                <>
                                                    <p className="text-gray-700">₹{(effectivePrice * cartItem.quantity).toFixed(2)}</p>
                                                    <p className="text-xs text-gray-500 line-through">₹{(cartItem.item.price * cartItem.quantity).toFixed(2)}</p>
                                                </>
                                            ) : (
                                                <p className="text-gray-700">₹{(effectivePrice * cartItem.quantity).toFixed(2)}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span>₹{cartTotal}</span>
                            </div>
                        </div>
                         <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="w-full mt-6 bg-[green] text-white font-bold py-3 rounded-lg hover:bg-green-600 transition duration-300 disabled:bg-green-300"
                        >
                            {loading ? 'Placing Order...' : `Place Order (₹${cartTotal})`}
                        </button>
                    </div>
                </div>

                {/* Payment Details (Left Column on Desktop) */}
                <div className="lg:col-span-2 lg:order-1">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                        <p className="text-sm text-gray-500 mb-6">This is a simulated payment form for demonstration.</p>
                        <form>
                            <div className="mb-4">
                                <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                <input type="text" id="card-number" className="w-full px-3 py-2 border rounded-md" placeholder="1234 5678 9101 1121" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input type="text" id="expiry" className="w-full px-3 py-2 border rounded-md" placeholder="MM/YY" />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                    <input type="text" id="cvv" className="w-full px-3 py-2 border rounded-md" placeholder="123" />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;