import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

// Reusable component for the KPI cards
const KpiCard = ({ title, value, subValue }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-brand-dark-blue">{value}</p>
        {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
    </div>
);


const Analytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/canteens/analytics');
                setAnalyticsData(data);
            } catch (error) {
                toast.error("Could not fetch analytics data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="text-center mt-10">Loading analytics...</div>;
    }

    if (!analyticsData) {
        return <div className="text-center mt-10">Could not load analytics data.</div>;
    }

    const { kpi, dailyData, popularItems } = analyticsData;

    const formattedDailyData = dailyData.map(d => ({
        name: new Date(d._id).toLocaleDateString('en-US', { weekday: 'short' }),
        sales: d.totalSales,
        orders: d.totalOrders,
    }));

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-brand-dark-blue">Analytics Dashboard</h1>
                <p className="text-gray-500">Track your canteen's performance and insights.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <KpiCard title="Total Revenue" value={`₹${kpi.totalRevenue.toLocaleString('en-IN')}`} />
                <KpiCard title="Total Orders" value={kpi.totalOrders} />
                <KpiCard title="Average Rating" value={kpi.avgRating} />
                {/* FIX: Add the new Prep Time KPI Card */}
                <KpiCard 
                    title="Avg Prep Time" 
                    value={`${kpi.avgActualPrepTime} min`}
                    subValue={`(Est: ${kpi.avgEstimatedPrepTime} min)`}
                />
                <KpiCard title="Active Customers" value={kpi.activeCustomers} />
            </div>

            {/* Main Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-4 text-brand-dark-blue">Daily Sales & Orders (Last 7 Days)</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={formattedDailyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" orientation="left" stroke="#22C55E" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value, name) => name === 'sales' ? `₹${value}`: value}/>
                        <Legend wrapperStyle={{fontSize: "14px"}} />
                        <Bar yAxisId="left" dataKey="sales" fill="#22C55E" name="Sales (₹)" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="orders" fill="#3B82F6" name="Orders" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-brand-dark-blue">Popular Menu Items</h2>
                        <Link to="/canteen/history" className="text-sm font-medium text-brand-green hover:underline">
                            View All Orders
                        </Link>
                    </div>
                     {popularItems.length > 0 ? (
                        <ul className="space-y-3">
                            {popularItems.map((item, index) => (
                                <li key={item.name} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-700">{index + 1}. {item.name}</span>
                                    <span className="font-bold text-brand-dark-blue">{item.count} orders</span>
                                </li>
                            ))}
                        </ul>
                     ) : (
                        <p className="text-sm text-gray-500">No completed orders with items yet.</p>
                     )}
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-brand-dark-blue">Performance Insights</h2>
                     <ul className="space-y-3 text-sm">
                         <li className="p-3 bg-blue-50 rounded-lg">
                            <p><span className="font-bold">Peak Hours:</span> Your busiest time is 12-1 PM. Consider offering lunch specials.</p>
                         </li>
                         <li className="p-3 bg-green-50 rounded-lg">
                             <p><span className="font-bold">Top Performer:</span> {popularItems.length > 0 ? popularItems[0].name : 'N/A'} is your most popular item. Consider promoting similar options.</p>
                         </li>
                     </ul>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

