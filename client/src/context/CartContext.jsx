import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('cartItems');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            return [];
        }
    });
    
    const [canteenInfo, setCanteenInfo] = useState(() => {
        try {
            const localData = localStorage.getItem('canteenInfo');
            return localData ? JSON.parse(localData) : null;
        } catch (error) {
            return null;
        }
    });

    const [bookedSlot, setBookedSlot] = useState(() => {
        try {
            const localData = localStorage.getItem('bookedSlot');
            return localData ? JSON.parse(localData) : null;
        } catch (error) {
            return null;
        }
    });

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        localStorage.setItem('canteenInfo', JSON.stringify(canteenInfo));
        localStorage.setItem('bookedSlot', JSON.stringify(bookedSlot));
    }, [cartItems, canteenInfo, bookedSlot]);

    // MODIFIED: Updated to handle chair IDs instead of seat count
    const addToCart = (item, canteen, slot, chairIds) => {
        
        // First, check if the item already exists in the cart.
        const itemExists = cartItems.find(cartItem => cartItem.item._id === item._id);

        if (itemExists) {
            // If it exists, we are just increasing the quantity. No need for slot checks.
            setCartItems(prevItems =>
                prevItems.map(cartItem =>
                    cartItem.item._id === item._id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                )
            );
            toast.success(`${item.name} quantity updated.`);
            return; // Exit the function early.
        }

        // --- The rest of the function only runs when adding a NEW item to the cart ---
        
        // Check if ordering from a different canteen
        if (canteenInfo && canteenInfo._id !== canteen._id) {
            toast.error('You can only order from one canteen at a time. Please clear your cart first.');
            return;
        }
        
        // Check if ordering for a different time slot
        if (bookedSlot && slot && bookedSlot.startTime !== slot.startTime) {
            toast.error('You can only order for one time slot at a time. Please clear your cart first.');
            return;
        }
        
        // If cart is empty, set the canteen and slot info
        if (cartItems.length === 0) {
            setCanteenInfo(canteen);
            setBookedSlot({ ...slot, chairIds, seatsNeeded: chairIds.length });
        }

        // Add the new item to the cart state
        setCartItems(prevItems => {
            return [...prevItems, { item: item, quantity: 1 }];
        });
        toast.success(`${item.name} added to cart!`);
    };

    const removeFromCart = (itemId) => {
        setCartItems(prevItems => {
            const itemToRemove = prevItems.find(cartItem => cartItem.item._id === itemId);
            if (itemToRemove.quantity > 1) {
                return prevItems.map(cartItem =>
                    cartItem.item._id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
                );
            } else {
                return prevItems.filter(cartItem => cartItem.item._id !== itemId);
            }
        });

        if (cartItems.length === 1 && cartItems[0].quantity === 1) {
            setCanteenInfo(null);
            setBookedSlot(null);
        }
        toast.success('Item updated in cart.');
    };

    const clearCart = () => {
        setCartItems([]);
        setCanteenInfo(null);
        setBookedSlot(null);
        toast.success('Cart cleared.');
    };

    const cartTotal = cartItems.reduce((total, cartItem) => {
        // **FIX:** Check if cartItem and cartItem.item are valid before accessing properties
        if (!cartItem || !cartItem.item) {
            return total; // Skip this malformed item
        }

        const hasDiscount = cartItem.item.discountPercentage && cartItem.item.discountPercentage > 0;
        const effectivePrice = hasDiscount ? 
            cartItem.item.price * (1 - cartItem.item.discountPercentage / 100) : 
            cartItem.item.price;
        return total + effectivePrice * cartItem.quantity;
    }, 0);

    return (
        <CartContext.Provider value={{ cartItems, canteenInfo, bookedSlot, addToCart, removeFromCart, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};