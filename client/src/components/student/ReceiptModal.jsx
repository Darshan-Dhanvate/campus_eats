import React from 'react';

// Helper to format date and time
const formatDateTime = (isoString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(isoString).toLocaleDateString('en-IN', options);
};

const ReceiptModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const { canteen, items, totalAmount, status, createdAt, deliverySlot, bookedSlot, _id } = order;

    const handlePrint = () => {
        const printContent = document.getElementById('receipt-content').innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                ${printContent}
            </div>
        `;
        
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    // Calculate tax (assuming 5% GST)
    const tax = (totalAmount * 0.05).toFixed(2);
    const subtotal = (totalAmount - tax).toFixed(2);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-brand-dark-blue">Receipt</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Receipt Content */}
                <div id="receipt-content" className="p-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-brand-dark-blue mb-2">Campus Eats</h3>
                        <p className="text-sm text-gray-600">Digital Receipt</p>
                        <div className="border-b-2 border-dashed border-gray-300 my-4"></div>
                    </div>

                    {/* Order Info */}
                    <div className="mb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-lg text-brand-dark-blue">
                                    {canteen.canteenDetails.canteenName}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {canteen.canteenDetails.canteenAddress}
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Order ID:</p>
                                <p className="font-mono font-semibold">#{_id.substring(0, 8)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Date & Time:</p>
                                <p className="font-semibold">{formatDateTime(createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Status:</p>
                                <p className="font-semibold capitalize">{status}</p>
                            </div>
                            {(deliverySlot || bookedSlot) && (
                                <div>
                                    <p className="text-gray-600">Time Slot:</p>
                                    <p className="font-semibold">
                                        {bookedSlot ? 
                                            `${bookedSlot.startTime}${bookedSlot.endTime ? ` - ${bookedSlot.endTime}` : ''}` : 
                                            deliverySlot
                                        }
                                    </p>
                                    {bookedSlot && bookedSlot.chairIds && bookedSlot.chairIds.length > 0 && (
                                        <>
                                            <p className="text-gray-600 mt-2">Reserved Chairs:</p>
                                            <p className="font-semibold">
                                                Chair{bookedSlot.chairIds.length > 1 ? 's' : ''} {bookedSlot.chairIds.join(', ')}
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

                    {/* Items */}
                    <div className="mb-6">
                        <h5 className="font-bold text-brand-dark-blue mb-3">Items Ordered</h5>
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <span className="text-sm font-medium">{item.menuItem.name}</span>
                                        <div className="text-xs text-gray-600">
                                            ₹{item.price} × {item.quantity}
                                        </div>
                                    </div>
                                    <div className="font-semibold">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

                    {/* Billing Details */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600">Subtotal:</span>
                            <span>₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600">GST (5%):</span>
                            <span>₹{tax}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold border-t border-gray-300 pt-2">
                            <span>Total Amount:</span>
                            <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-500">
                        <p>Thank you for choosing Campus Eats!</p>
                        <p className="mt-1">For support, contact us at support@campuseats.com</p>
                        <p className="mt-2 font-mono">Generated on {new Date().toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t border-gray-200 flex space-x-3">
                    <button
                        onClick={handlePrint}
                        className="flex-1 bg-brand-green text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors duration-200 font-medium"
                    >
                        Print Receipt
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;