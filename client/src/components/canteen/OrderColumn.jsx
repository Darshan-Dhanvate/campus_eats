import React from 'react';
import { useDrop } from 'react-dnd';
import OrderKanbanCard from './OrderKanbanCard';

const OrderColumn = ({ title, status, orders, onDropOrder, onCompleteOrder }) => {
    
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'order',
        drop: (item) => onDropOrder(item.id, status),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div 
            ref={drop} 
            className={`bg-gray-50 rounded-lg p-4 w-full transition-colors duration-300 ${isOver ? 'bg-green-100' : ''}`}
        >
            <h3 className="font-bold text-lg mb-4 text-brand-dark-blue border-b pb-2">{title} ({orders.length})</h3>
            <div className="h-[65vh] overflow-y-auto pr-2">
                {orders.length > 0 ? (
                    orders.map(order => (
                        <OrderKanbanCard 
                            key={order._id} 
                            order={order}
                            status={status} // Pass the column's status down
                            onCompleteOrder={onCompleteOrder} // Pass the completion handler down
                        />
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

