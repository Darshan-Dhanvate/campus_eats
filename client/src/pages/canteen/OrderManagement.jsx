import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import OrderColumn from '../../components/canteen/OrderColumn';
import { useAuth } from '../../context/AuthContext';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, setUser } = useAuth();
    
    const [isCanteenOpen, setIsCanteenOpen] = useState(user?.canteenDetails?.isOpen || true);

    const fetchOrders = async () => {
        try {
            // Only fetch active orders for the Kanban board
            const { data } = await api.get('/canteens/orders?status=active');
            setOrders(data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        } catch (error) {
            toast.error('Could not fetch orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);
    
    useEffect(() => {
        if(user) {
            setIsCanteenOpen(user.canteenDetails.isOpen);
        }
    }, [user]);

    const handleDropOrder = async (orderId, newStatus) => {
        const originalOrders = [...orders];
        setOrders(prevOrders =>
            prevOrders.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
        );

        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order moved to ${newStatus}`);
        } catch (error) {
            setOrders(originalOrders);
            toast.error('Failed to update order status.');
        }
    };

    const handleCompleteOrder = async (orderId) => {
        const originalOrders = [...orders];
        // Optimistically remove the order from the UI
        setOrders(prevOrders => prevOrders.filter(o => o._id !== orderId));

        try {
            await api.put(`/orders/${orderId}/status`, { status: 'Completed' });
            toast.success('Order marked as completed!');
        } catch (error) {
            setOrders(originalOrders); // Revert UI on error
            toast.error('Failed to complete order.');
        }
    };
    
    const handleStatusToggle = async () => {
        const newStatus = !isCanteenOpen;
        setIsCanteenOpen(newStatus);

        try {
            const { data } = await api.put('/users/profile', { isOpen: newStatus });
            setUser(data);
            toast.success(`Canteen is now ${newStatus ? 'Open' : 'Closed'}`);
        } catch (error) {
            setIsCanteenOpen(!newStatus);
            toast.error('Failed to update canteen status.');
        }
    };

    const columns = [
        { title: 'New Order', status: 'Placed' },
        { title: 'Accepted', status: 'Accepted' },
        { title: 'Preparing', status: 'Preparing' },
        { title: 'Ready', status: 'Ready' },
    ];

    if (loading) return <p className="text-center mt-10">Loading orders...</p>;

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-dark-blue">Order Management</h1>
                        <p className="text-gray-500">Manage incoming orders and track their progress.</p>
                    </div>
                    <div className="flex items-center mt-4 sm:mt-0">
                        <span className="mr-3 font-medium text-gray-700">Canteen Status:</span>
                        <label htmlFor="toggle" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input id="toggle" type="checkbox" className="sr-only" checked={isCanteenOpen} onChange={handleStatusToggle} />
                                <div className={`block w-14 h-8 rounded-full ${isCanteenOpen ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isCanteenOpen ? 'transform translate-x-full' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-gray-700 font-medium">
                                {isCanteenOpen ? 'Open' : 'Closed'}
                            </div>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {columns.map(col => (
                        <OrderColumn
                            key={col.status}
                            title={col.title}
                            status={col.status}
                            orders={orders.filter(o => o.status === col.status)}
                            onDropOrder={handleDropOrder}
                            onCompleteOrder={handleCompleteOrder} // Pass the new handler
                        />
                    ))}
                </div>
            </div>
        </DndProvider>
    );
};

export default OrderManagement;

