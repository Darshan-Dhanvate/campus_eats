import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import MenuItemCard from '../../components/student/MenuItemCard';
import CartSidebar from '../../components/student/CartSidebar';

const CanteenMenu = () => {
    const { canteenId } = useParams();
    const [canteen, setCanteen] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCanteenData = async () => {
            try {
                setLoading(true);
                // In a real app, you might have separate endpoints. Here we fetch the user object which contains canteen details.
                const menuRes = await api.get(`/canteens/${canteenId}/menu`);
                
                // Since the menu items don't contain full canteen details, we might need another call
                // For now, let's assume the menu endpoint could be improved or we make a second call
                // This is a placeholder for fetching the specific canteen's details if not in menu items.
                // For this implementation, we will pass a simplified canteen object to the cart.
                setMenuItems(menuRes.data);
                // A simplified canteen object for the cart context
                setCanteen({ _id: canteenId, name: menuRes.data.length > 0 ? menuRes.data[0].canteen.canteenDetails.canteenName : 'Canteen' });

            } catch (error) {
                toast.error('Could not load canteen menu.');
                console.error("Fetch Canteen Menu Error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (canteenId) {
            fetchCanteenData();
        }
    }, [canteenId]);

    const SkeletonCard = () => (
      <div className="bg-white p-4 rounded-lg shadow-sm flex items-start animate-pulse">
          <div className="w-24 h-24 rounded-md bg-gray-300 mr-4 flex-shrink-0"></div>
          <div className="flex-grow">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
              <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-300 rounded-lg w-1/3"></div>
              </div>
          </div>
      </div>
    );

    if (loading) {
        return (
             <div className="container mx-auto px-4 py-8">
                 <div className="mb-8 p-6 bg-white rounded-lg shadow-md animate-pulse">
                    <div className="h-10 bg-gray-300 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                 </div>
             </div>
        );
    }

    if (!menuItems || menuItems.length === 0) {
        return <div className="text-center mt-10">This canteen has no menu items available.</div>;
    }
    
    // Extract canteen details from the first menu item (assuming they are all from the same canteen)
    const canteenDetails = menuItems[0].canteen.canteenDetails;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-4">
                <Link to="/student/browse" className="text-sm text-brand-green hover:underline">&larr; Back to all canteens</Link>
            </div>
            {/* Canteen Header */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-4xl font-bold text-brand-dark-blue">{canteenDetails.canteenName}</h1>
                <p className="text-gray-500 mt-2">{canteenDetails.canteenAddress}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Menu Items Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4 text-brand-dark-blue">Menu</h2>
                    <div className="space-y-4">
                        {menuItems.map(item => <MenuItemCard key={item._id} item={item} canteen={item.canteen} />)}
                    </div>
                </div>

                {/* Cart Sidebar Section */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                       <CartSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CanteenMenu;

