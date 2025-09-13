import React, { useState } from 'react';

const StarIcon = ({ filled, onClick }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-8 w-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300'}`} 
        viewBox="0 0 20 20" 
        fill="currentColor"
        onClick={onClick}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


const ReviewModal = ({ isOpen, onClose, onSubmit, order }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleRatingClick = (rate) => {
        setRating(rate);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a star rating.');
            return;
        }
        setLoading(true);
        await onSubmit(order._id, { rating, comment });
        setLoading(false);
        // Resetting state for next use
        setRating(0);
        setComment('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4">
                <h2 className="text-2xl font-bold text-brand-dark-blue mb-2">Rate Your Order</h2>
                <p className="text-gray-600 mb-6">from <span className="font-semibold">{order.canteen.canteenDetails.canteenName}</span></p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                        <div className="flex items-center space-x-1" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <div key={star} onMouseEnter={() => setHoverRating(star)}>
                                    <StarIcon 
                                        filled={hoverRating >= star || rating >= star}
                                        onClick={() => handleRatingClick(star)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Add a comment</label>
                        <textarea
                            id="comment"
                            rows="4"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green focus:border-brand-green"
                            placeholder="How was your food? What did you like?"
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-green-600 disabled:bg-green-300">
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
