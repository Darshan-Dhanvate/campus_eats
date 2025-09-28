import React, { useState, useEffect } from 'react';

const AddEditItemModal = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const [itemData, setItemData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        prepTime: '',
        discountPercentage: 0,
        isAvailable: true,
        imageUrl: '',
    });
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        // If we are editing, populate the form with the item's data
        if (itemToEdit) {
            setItemData({
                name: itemToEdit.name || '',
                description: itemToEdit.description || '',
                price: itemToEdit.price || '',
                category: itemToEdit.category || '',
                prepTime: itemToEdit.prepTime || '',
                discountPercentage: itemToEdit.discountPercentage || 0,
                isAvailable: itemToEdit.isAvailable !== undefined ? itemToEdit.isAvailable : true,
                imageUrl: itemToEdit.imageUrl || '',
            });
            setImagePreview(itemToEdit.imageUrl || null);
            setImageFile(null);
        } else {
            // If adding a new item, reset the form
            setItemData({
                name: '', description: '', price: '', category: '', prepTime: '', discountPercentage: 0, imageUrl: '', isAvailable: true,
            });
            setImagePreview(null);
            setImageFile(null);
        }
    }, [itemToEdit, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setItemData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;
        
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch('/api/v1/canteens/upload/menu-item-image', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.imageUrl;
            } else {
                throw new Error('Failed to upload image');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            throw error;
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            let finalItemData = { ...itemData };
            
            // Upload image if a new one is selected
            if (imageFile) {
                const uploadedImageUrl = await uploadImage();
                finalItemData.imageUrl = uploadedImageUrl;
            }
            
            await onSave(finalItemData);
        } catch (error) {
            console.error('Error saving item:', error);
        } finally {
            setLoading(false);
        }
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
                        <div>
                            <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700">Discount (%)</label>
                            <input type="number" name="discountPercentage" id="discountPercentage" value={itemData.discountPercentage} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" min="0" max="100" placeholder="0" />
                        </div>
                    </div>
                    
                    {/* Image Upload Section */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Menu Item Image</label>
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-green file:text-white hover:file:bg-green-600"
                                />
                            </div>
                            {imagePreview && (
                                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        {uploadingImage && (
                            <p className="text-sm text-blue-600 mt-1">Uploading image...</p>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || uploadingImage} className="px-4 py-2 bg-[green] text-white rounded-md hover:bg-green-600 disabled:bg-green-300">
                            {uploadingImage ? 'Uploading Image...' : loading ? 'Saving...' : 'Save Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditItemModal;
