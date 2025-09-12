import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

// We will create the MenuItemRow component in the next step
// import MenuItemRow from '../../components/canteen/MenuItemRow';

const PlusIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All Items');

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/canteens/menu/my-menu');
                setMenuItems(data);
            } catch (error) {
                toast.error('Could not fetch menu items.');
                console.error("Fetch Menu Items Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenuItems();
    }, []);

    // Placeholder for MenuItemRow
    const MenuItemRow = ({ item }) => (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-4">
            <div className="flex items-center">
                <img src={`https://placehold.co/100x100/E2E8F0/475569?text=${item.name.replace(/\s/g,'+')}`} alt={item.name} className="w-16 h-16 rounded-md object-cover mr-4" />
                <div>
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-sm text-gray-500">Category: {item.category}</p>
                    <p className="font-semibold">₹{item.price}</p>
                </div>
            </div>
            <div>
                {/* Placeholder for actions */}
                <button className="text-blue-500">Edit</button>
                <button className="text-red-500 ml-4">Delete</button>
            </div>
        </div>
    );

    const categories = ['All Items', ...new Set(menuItems.map(item => item.category))];

    const filteredItems = activeTab === 'All Items'
        ? menuItems
        : menuItems.filter(item => item.category === activeTab);

    const TabButton = ({ name }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === name
                    ? 'bg-brand-dark-blue text-white shadow-sm'
                    : 'text-brand-text-light bg-white hover:bg-gray-100'
            }`}
        >
            {name} ({name === 'All Items' ? menuItems.length : menuItems.filter(i => i.category === name).length})
        </button>
    );

    if (loading) return <p className="text-center mt-10">Loading menu...</p>;

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-brand-dark-blue">Menu Management</h1>
                    <p className="text-gray-500">Manage your menu items and categories.</p>
                </div>
                <button className="flex items-center bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300">
                    <PlusIcon />
                    Add Menu Item
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="bg-gray-100 rounded-lg p-2 mb-6 flex space-x-2">
                {categories.map(cat => <TabButton key={cat} name={cat} />)}
            </div>
            
            {/* Menu Item List */}
            <div className="space-y-4">
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => <MenuItemRow key={item._id} item={item} />)
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-700">No Menu Items Found</h3>
                        <p className="text-gray-500 mt-2">Click "Add Menu Item" to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuManagement;
