import React from 'react';
import { useDrop } from 'react-dnd';
// We will create the OrderKanbanCard component next
// import OrderKanbanCard from './OrderKanbanCard'; 

const OrderColumn = ({ title, status, orders, onDropOrder }) => {
    
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'order',
        drop: (item) => onDropOrder(item.id, status),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));
    
    // Placeholder for the OrderKanbanCard component
    const OrderKanbanCard = ({ order }) => (
        <div className="p-4 mb-4 bg-gray-100 rounded-lg shadow-sm cursor-grab">
            <p className="font-bold">Order #{order._id.substring(0, 6)}</p>
            <p className="text-sm">{order.user.name}</p>
            <ul className="text-xs mt-2">
                {order.items.map(item => (
                    <li key={item._id}>{item.quantity} x {item.menuItem.name}</li>
                ))}
            </ul>
            <p className="text-right font-bold mt-2">₹{order.totalAmount}</p>
        </div>
    );

    return (
        <div 
            ref={drop} 
            className={`bg-gray-50 rounded-lg p-4 w-full transition-colors duration-300 ${isOver ? 'bg-green-100' : ''}`}
        >
            <h3 className="font-bold text-lg mb-4 text-brand-dark-blue border-b pb-2">{title} ({orders.length})</h3>
            <div className="h-[65vh] overflow-y-auto pr-2">
                {orders.length > 0 ? (
                    orders.map(order => (
                        <OrderKanbanCard key={order._id} order={order} />
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-gray-400">No orders here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderColumn;
