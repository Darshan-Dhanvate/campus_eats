import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import ReviewModal from './ReviewModal';
import ReceiptModal from './ReceiptModal';
import { useCart } from '../../context/CartContext';

// Helper to format date and time
const formatDateTime = (isoString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(isoString).toLocaleDateString('en-IN', options);
};

// Sub-component for the status badge
const OrderStatusBadge = ({ status }) => {
    const statusStyles = {
        Placed: 'bg-blue-100 text-blue-800',
        Accepted: 'bg-indigo-100 text-indigo-800',
        Preparing: 'bg-yellow-100 text-yellow-800',
        Ready: 'bg-purple-100 text-purple-800',
        Completed: 'bg-green-100 text-green-800',
        Cancelled: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

// Sub-component for the progress bar
const OrderProgressBar = ({ status }) => {
    const steps = ['Placed', 'Accepted', 'Preparing', 'Ready'];
    const currentStepIndex = steps.indexOf(status);
    const progressPercentage = currentStepIndex <= 0 ? 0 : (currentStepIndex / (steps.length - 1)) * 100;

    // FIX: Use a more robust CSS gradient for the progress bar
    const progressBarStyle = {
        background: `linear-gradient(to right, #22C55E ${progressPercentage}%, #E5E7EB ${progressPercentage}%)`
    };

    return (
        <div className="mt-4">
            <div 
                className="w-full h-1.5 rounded-full transition-all duration-500"
                style={progressBarStyle}
            ></div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                {steps.map((step, index) => (
                    <div key={step} className={`text-center ${index <= currentStepIndex ? 'font-semibold text-brand-dark-blue' : ''}`}>
                        {step}
                    </div>
                ))}
            </div>
        </div>
    );
};


const OrderCard = ({ order }) => {
    const { canteen, items, totalAmount, status, createdAt } = order;
    const isActiveOrder = ['Placed', 'Accepted', 'Preparing', 'Ready'].includes(status);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isReviewed, setIsReviewed] = useState(order.isReviewed || false);

    const { addToCart, clearCart, cartItems } = useCart();
    const navigate = useNavigate();

    const handleSubmitReview = async (orderId, reviewData) => {
        try {
            await api.post(`/orders/${orderId}/review`, reviewData);
            toast.success('Thank you for your review!');
            setIsReviewed(true);
            setIsReviewModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review.');
        }
    };

    const handleReorder = () => {
        if (cartItems.length > 0) {
            if (!window.confirm("This will clear your current cart. Are you sure you want to proceed?")) {
                return;
            }
        }
        
        clearCart();
        
        items.forEach(item => {
            for (let i = 0; i < item.quantity; i++) {
                addToCart(item.menuItem, canteen);
            }
        });

        toast.success("Items from your past order have been added to your cart!");
        navigate('/checkout');
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-brand-dark-blue">{canteen.canteenDetails.canteenName}</h3>
                            <p className="text-xs text-gray-500">
                                Order #{order._id.substring(0, 8)} &bull; {formatDateTime(createdAt)}
                            </p>
                        </div>
                        <OrderStatusBadge status={status} />
                    </div>

                    <div className="border-t border-b border-gray-200 py-4 my-4">
                        {items.map(item => (
                            <div key={item.menuItem._id} className="flex justify-between items-center text-sm mb-2 last:mb-0">
                                <span className="text-gray-700">{item.quantity} x {item.menuItem.name}</span>
                                <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center font-bold text-lg mb-4">
                        <span>Total</span>
                        <span>₹{totalAmount}</span>
                    </div>

                    {isActiveOrder ? (
                        <div>
                            <OrderProgressBar status={status} />
                            <div className="flex justify-end mt-3">
                                <button 
                                    onClick={() => setIsReceiptModalOpen(true)} 
                                    className="text-blue-600 hover:underline text-sm font-medium"
                                >
                                    View Receipt
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm font-medium">
                                {status === 'Completed' && (
                                    <>
                                        {isReviewed ? (
                                            <span className="text-gray-500 font-semibold">Reviewed</span>
                                        ) : (
                                            <button onClick={() => setIsReviewModalOpen(true)} className="text-brand-green hover:underline">Rate Order</button>
                                        )}
                                        <button onClick={handleReorder} className="text-gray-600 hover:underline">Reorder</button>
                                    </>
                                )}
                                {(status === 'Completed' || status === 'Cancelled') && (
                                    <button 
                                        onClick={() => setIsReceiptModalOpen(true)} 
                                        className="text-blue-600 hover:underline"
                                    >
                                        View Receipt
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleSubmitReview}
                order={order}
            />
            
            <ReceiptModal
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                order={order}
            />
        </>
    );
};

export default OrderCard;

