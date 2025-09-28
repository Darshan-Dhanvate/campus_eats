import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const SpendingAnalysisModal = ({ isOpen, onClose }) => {
    const [spendingData, setSpendingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timeFilter, setTimeFilter] = useState('monthly');
    const [monthlyGoal, setMonthlyGoal] = useState(2000);
    const [weeklyGoal, setWeeklyGoal] = useState(500);

    useEffect(() => {
        if (isOpen) {
            fetchSpendingData();
        }
    }, [isOpen, timeFilter]);

    const fetchSpendingData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/orders/spending-analysis?period=${timeFilter}`);
            setSpendingData(data);
        } catch (error) {
            toast.error('Failed to fetch spending data');
            console.error('Spending data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = (spent, goal) => {
        return Math.min((spent / goal) * 100, 100);
    };

    const getGoalStatus = (spent, goal) => {
        const percentage = (spent / goal) * 100;
        if (percentage >= 100) return { status: 'exceeded', color: 'text-red-600', bg: 'bg-red-100' };
        if (percentage >= 80) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        return { status: 'good', color: 'text-green-600', bg: 'bg-green-100' };
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-brand-dark-blue">Spending Analysis</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Time Filter */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setTimeFilter('weekly')}
                            className={`px-4 py-2 rounded-md font-medium ${
                                timeFilter === 'weekly'
                                    ? 'bg-brand-green text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setTimeFilter('monthly')}
                            className={`px-4 py-2 rounded-md font-medium ${
                                timeFilter === 'monthly'
                                    ? 'bg-brand-green text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setTimeFilter('yearly')}
                            className={`px-4 py-2 rounded-md font-medium ${
                                timeFilter === 'yearly'
                                    ? 'bg-brand-green text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Yearly
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
                    </div>
                ) : spendingData ? (
                    <div className="p-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-blue-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-800">Total Spent</h3>
                                <p className="text-3xl font-bold text-blue-900">₹{spendingData.summary.totalSpent}</p>
                                <p className="text-sm text-blue-600">
                                    {timeFilter === 'monthly' ? 'This Month' : timeFilter === 'weekly' ? 'This Week' : 'This Year'}
                                </p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-green-800">Total Orders</h3>
                                <p className="text-3xl font-bold text-green-900">{spendingData.summary.totalOrders}</p>
                                <p className="text-sm text-green-600">Orders placed</p>
                            </div>
                            <div className="bg-purple-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-purple-800">Average Order</h3>
                                <p className="text-3xl font-bold text-purple-900">₹{spendingData.summary.avgOrderValue}</p>
                                <p className="text-sm text-purple-600">Per order</p>
                            </div>
                        </div>

                        {/* Spending Goals */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Monthly Goal</h3>
                                    <input
                                        type="number"
                                        value={monthlyGoal}
                                        onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                </div>
                                {timeFilter === 'monthly' && (
                                    <>
                                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                            <div
                                                className={`h-3 rounded-full ${
                                                    getGoalStatus(spendingData.summary.totalSpent, monthlyGoal).status === 'exceeded'
                                                        ? 'bg-red-500'
                                                        : getGoalStatus(spendingData.summary.totalSpent, monthlyGoal).status === 'warning'
                                                        ? 'bg-yellow-500'
                                                        : 'bg-green-500'
                                                }`}
                                                style={{ width: `${calculateProgress(spendingData.summary.totalSpent, monthlyGoal)}%` }}
                                            ></div>
                                        </div>
                                        <div className={`text-sm font-medium ${getGoalStatus(spendingData.summary.totalSpent, monthlyGoal).color}`}>
                                            ₹{spendingData.summary.totalSpent} / ₹{monthlyGoal} ({calculateProgress(spendingData.summary.totalSpent, monthlyGoal).toFixed(1)}%)
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Weekly Goal</h3>
                                    <input
                                        type="number"
                                        value={weeklyGoal}
                                        onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                </div>
                                {timeFilter === 'weekly' && (
                                    <>
                                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                            <div
                                                className={`h-3 rounded-full ${
                                                    getGoalStatus(spendingData.summary.totalSpent, weeklyGoal).status === 'exceeded'
                                                        ? 'bg-red-500'
                                                        : getGoalStatus(spendingData.summary.totalSpent, weeklyGoal).status === 'warning'
                                                        ? 'bg-yellow-500'
                                                        : 'bg-green-500'
                                                }`}
                                                style={{ width: `${calculateProgress(spendingData.summary.totalSpent, weeklyGoal)}%` }}
                                            ></div>
                                        </div>
                                        <div className={`text-sm font-medium ${getGoalStatus(spendingData.summary.totalSpent, weeklyGoal).color}`}>
                                            ₹{spendingData.summary.totalSpent} / ₹{weeklyGoal} ({calculateProgress(spendingData.summary.totalSpent, weeklyGoal).toFixed(1)}%)
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Spending Over Time */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Over Time</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={spendingData.timeData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                                        <Bar dataKey="amount" fill="#22C55E" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Spending by Category */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={spendingData.categoryData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="amount"
                                            label={({ name, value }) => `${name}: ₹${value}`}
                                        >
                                            {spendingData.categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Canteens */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Canteens</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {spendingData.topCanteens.map((canteen, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-800">{canteen.name}</p>
                                            <p className="text-sm text-gray-600">{canteen.orders} orders</p>
                                        </div>
                                        <p className="font-bold text-brand-green">₹{canteen.amount}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No spending data available</p>
                    </div>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpendingAnalysisModal;