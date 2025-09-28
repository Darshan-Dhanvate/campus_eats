import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import MenuItemCard from '../../components/student/MenuItemCard';
import CartSidebar from '../../components/student/CartSidebar';
import ChairSelectionModal from '../../components/common/ChairSelectionModal'; // Import the new modal
import { useCart } from '../../context/CartContext'; // Import useCart

const CanteenMenu = () => {
    const { canteenId } = useParams();
    const { addToCart } = useCart(); // Get addToCart function from context
    const [canteen, setCanteen] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State for managing the slot selection modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const fetchCanteenData = async () => {
            try {
                setLoading(true);
                // Fetch canteen details and menu in parallel for better performance
                const [canteenRes, menuRes] = await Promise.all([
                    api.get(`/canteens/${canteenId}`),
                    api.get(`/canteens/${canteenId}/menu`)
                ]);
                
                setCanteen(canteenRes.data);
                setMenuItems(menuRes.data);

            } catch (error) {
                toast.error('Could not load canteen data.');
                console.error("Fetch Canteen Data Error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (canteenId) {
            fetchCanteenData();
        }
    }, [canteenId]);

    // Handler to open the modal, passed to MenuItemCard
    const handleInitiateBooking = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    // Handler to confirm the booking, passed to SlotSelectionModal
    const handleConfirmBookingAndAddToCart = async (item, canteen, slot, chairIds) => {
        // DON'T reserve chairs yet - just add to cart with chair selection
        // Chairs will be reserved only when the order is actually placed
        
        addToCart(item, canteen, slot, chairIds);

        const chairCount = chairIds.length;
        toast.success(`${chairCount} chair${chairCount > 1 ? 's' : ''} selected for ${slot.startTime}! Added to cart.`);
        setIsModalOpen(false); // Close the modal on success
    };

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

    if (!canteen) {
        return <div className="text-center mt-10">Could not find the requested canteen.</div>;
    }

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-4">
                    <Link to="/student/browse" className="text-sm text-brand-green hover:underline">&larr; Back to all canteens</Link>
                </div>
                {/* Canteen Header */}
                <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                    <h1 className="text-4xl font-bold text-brand-dark-blue">{canteen.canteenDetails.canteenName}</h1>
                    <p className="text-gray-500 mt-2">{canteen.canteenDetails.canteenAddress}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Menu Items Section */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-4 text-brand-dark-blue">Menu</h2>
                        {menuItems.length > 0 ? (
                            <div className="space-y-4">
                                {menuItems.map(item => (
                                    <MenuItemCard 
                                        key={item._id} 
                                        item={item} 
                                        canteen={canteen} 
                                        onInitiateBooking={handleInitiateBooking} // Pass the handler
                                    />
                                ))}
                            </div>
                        ) : (
                            <p>This canteen has no menu items available.</p>
                        )}
                    </div>

                    {/* Cart Sidebar Section */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                           <CartSidebar />
                        </div>
                    </div>
                </div>
            </div>

            {/* Render the modal conditionally */}
            {selectedItem && (
                 <ChairSelectionModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmBookingAndAddToCart}
                    item={selectedItem}
                    canteen={canteen}
                />
            )}
        </>
    );
};

export default CanteenMenu;