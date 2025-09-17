import React, { useState, useEffect } from 'react';

const AddEditItemModal = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const [itemData, setItemData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        prepTime: '',
        isAvailable: true,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If we are editing, populate the form with the item's data
        if (itemToEdit) {
            setItemData({
                name: itemToEdit.name || '',
                description: itemToEdit.description || '',
                price: itemToEdit.price || '',
                category: itemToEdit.category || '',
                prepTime: itemToEdit.prepTime || '',
                isAvailable: itemToEdit.isAvailable !== undefined ? itemToEdit.isAvailable : true,
            });
        } else {
            // If adding a new item, reset the form
            setItemData({
                name: '', description: '', price: '', category: '', prepTime: '', isAvailable: true,
            });
        }
    }, [itemToEdit, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setItemData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(itemData);
        setLoading(false);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg m-4">
                <h2 className="text-2xl font-bold text-brand-dark-blue mb-6">
                    {itemToEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" name="name" id="name" value={itemData.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" id="description" value={itemData.description} onChange={handleChange} rows="3" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₹)</label>
                            <input type="number" name="price" id="price" value={itemData.price} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <input type="text" name="category" id="category" value={itemData.category} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="e.g., Main Course, Snacks" required />
                        </div>
                         <div>
                            <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700">Prep Time (mins)</label>
                            <input type="number" name="prepTime" id="prepTime" value={itemData.prepTime} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-[green] text-white rounded-md hover:bg-green-600 disabled:bg-green-300">
                            {loading ? 'Saving...' : 'Save Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditItemModal;
