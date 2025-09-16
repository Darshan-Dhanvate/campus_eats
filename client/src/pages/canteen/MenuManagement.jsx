import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import MenuItemRow from '../../components/canteen/MenuItemRow';
import AddEditItemModal from '../../components/canteen/AddEditItemModal';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All Items');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/canteens/menu/my-menu');
            setMenuItems(data);
        } catch (error) {
            toast.error('Could not fetch menu items.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);
    
    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSaveItem = async (itemData) => {
        try {
            if (editingItem) {
                // Update existing item
                await api.put(`/canteens/menu/${editingItem._id}`, itemData);
                toast.success('Item updated successfully!');
            } else {
                // Create new item
                await api.post('/canteens/menu', itemData);
                toast.success('Item added successfully!');
            }
            fetchMenuItems(); // Refresh the list
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save item.');
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            try {
                await api.delete(`/canteens/menu/${itemId}`);
                setMenuItems(prev => prev.filter(item => item._id !== itemId));
                toast.success('Item deleted successfully');
            } catch (error) {
                toast.error('Failed to delete item.');
            }
        }
    };
    
    const handleToggleAvailability = async (itemId, newAvailability) => {
        const originalItems = [...menuItems];
        setMenuItems(prev => prev.map(item => item._id === itemId ? { ...item, isAvailable: newAvailability } : item));
        try {
            await api.put(`/canteens/menu/${itemId}`, { isAvailable: newAvailability });
            toast.success(`Item is now ${newAvailability ? 'available' : 'unavailable'}`);
        } catch (error) {
            setMenuItems(originalItems);
            toast.error('Failed to update availability.');
        }
    };

    const categories = ['All Items', ...Array.from(new Set(menuItems.map(item => item.category)))];

    const filteredItems = activeTab === 'All Items'
        ? menuItems
        : menuItems.filter(item => item.category === activeTab);

    const TabButton = ({ name }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
                activeTab === name
                    ? 'bg-[#111184] text-white shadow-sm'
                    : 'text-brand-text-light bg-white hover:bg-gray-100'
            }`}
        >
            {name} ({name === 'All Items' ? menuItems.length : menuItems.filter(i => i.category === name).length})
        </button>
    );

    if (loading) return <p className="text-center mt-10">Loading menu...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-brand-dark-blue">Menu Management</h1>
                    <p className="text-gray-500">Manage your menu items and categories.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center bg-[green] text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                >
                    <PlusIcon />
                    Add Menu Item
                </button>
            </div>

            <div className="bg-gray-100 rounded-lg p-2 mb-6 flex space-x-2 overflow-x-auto">
                {categories.map(cat => <TabButton key={cat} name={cat} />)}
            </div>
            
            <div className="space-y-4">
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => 
                        <MenuItemRow 
                            key={item._id} 
                            item={item} 
                            onDelete={handleDelete}
                            onToggleAvailability={handleToggleAvailability}
                            onEdit={handleOpenModal}
                        />
                    )
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-700">No Menu Items Found</h3>
                        <p className="text-gray-500 mt-2">Click "Add Menu Item" to get started.</p>
                    </div>
                )}
            </div>

            <AddEditItemModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveItem}
                itemToEdit={editingItem}
            />
        </div>
    );
};

export default MenuManagement;

