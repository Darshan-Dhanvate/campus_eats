import React from 'react';
import { useDrag } from 'react-dnd';

const formatTime = (isoString) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(isoString).toLocaleTimeString('en-IN', options);
};

const OrderKanbanCard = ({ order }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'order',
        item: { id: order._id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            className={`p-4 mb-4 bg-white rounded-lg shadow-sm border cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 border-dashed border-brand-green' : 'border-transparent'}`}
        >
            <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-sm text-brand-dark-blue">
                    {order.user.name}
                </p>
                <p className="text-xs text-gray-500">
                    {formatTime(order.createdAt)}
                </p>
            </div>
            
            <ul className="text-xs text-gray-600 border-t border-b py-2 my-2">
                {order.items.map(item => (
                    <li key={item._id} className="flex justify-between">
                        <span>{item.quantity} x {item.menuItem.name}</span>
                        <span>₹{item.price * item.quantity}</span>
                    </li>
                ))}
            </ul>

            <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium text-gray-500">Total:</span>
                <p className="text-right font-bold text-lg text-brand-green">
                    ₹{order.totalAmount}
                </p>
            </div>
        </div>
    );
};

export default OrderKanbanCard;
