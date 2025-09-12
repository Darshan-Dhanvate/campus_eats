import React from 'react';

// A helper to format date and time
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

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                {steps.map((step, index) => (
                    <div key={step} className={`text-center ${index <= currentStepIndex ? 'font-semibold text-brand-green' : ''}`}>
                        {step}
                    </div>
                ))}
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-2">
                <div 
                    className="absolute top-0 left-0 bg-brand-green h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>
            </div>
        </div>
    );
};


const OrderCard = ({ order }) => {
    const { canteen, items, totalAmount, status, createdAt } = order;
    const isActiveOrder = ['Placed', 'Accepted', 'Preparing', 'Ready'].includes(status);

    return (
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
                    <OrderProgressBar status={status} />
                ) : (
                    <div className="flex items-center space-x-4 text-sm font-medium">
                        <button className="text-brand-green hover:underline">Rate Order</button>
                        <button className="text-gray-600 hover:underline">View Review</button>
                        <button className="text-gray-600 hover:underline">Reorder</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderCard;
