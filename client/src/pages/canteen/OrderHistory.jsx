import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

// Reusable star rating component
const StarRating = ({ rating }) => {
    const totalStars = 5;
    return (
        <div className="flex items-center">
            {[...Array(totalStars)].map((_, index) => (
                <svg
                    key={index}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ${index < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};


const OrderHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/canteens/orders/history');
                setHistory(data);
            } catch (error) {
                toast.error('Could not fetch order history.');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredHistory = useMemo(() => {
        return history.filter(order => {
            const nameMatch = order.studentName.toLowerCase().includes(searchTerm.toLowerCase());
            const dateMatch = !dateFilter || new Date(order.createdAt).toISOString().slice(0, 10) === dateFilter;
            return nameMatch && dateMatch;
        });
    }, [history, searchTerm, dateFilter]);

    if (loading) {
        return <div className="text-center mt-10">Loading order history...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link to="/canteen/analytics" className="text-sm text-brand-green hover:underline mb-2 inline-block">
                    &larr; Back to Analytics
                </Link>
                <h1 className="text-3xl font-bold text-brand-dark-blue">Completed Order History</h1>
                <p className="text-gray-500">View details of all your past completed orders.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by student name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-md"
                />
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md"
                />
            </div>

            {/* History Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Order Details</th>
                                <th scope="col" className="px-6 py-3">Products Ordered</th>
                                <th scope="col" className="px-6 py-3">Prep Time (Est vs Actual)</th>
                                <th scope="col" className="px-6 py-3">Review</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length > 0 ? filteredHistory.map(order => (
                                <tr key={order._id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{order.studentName}</p>
                                        <p className="text-xs">{new Date(order.createdAt).toLocaleString()}</p>
                                        <p className="font-semibold text-brand-green">₹{order.totalAmount}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <ul className="list-disc list-inside text-xs">
                                            {order.products.map((product, i) => <li key={i}>{product}</li>)}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p>{order.estimatedPrepTime} min / {order.actualPrepTime ? `${order.actualPrepTime} min` : 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.rating ? (
                                            <>
                                                <StarRating rating={order.rating} />
                                                <p className="text-xs max-w-xs truncate mt-1">{order.comment || "No comment"}</p>
                                            </>
                                        ) : (
                                            <span className="text-gray-400">Not Rated</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-10">No completed orders found for the selected criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;

