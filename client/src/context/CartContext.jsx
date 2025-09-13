import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        // Load cart from local storage on initial load
        try {
            const localData = localStorage.getItem('cartItems');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            return [];
        }
    });
    
    const [canteenInfo, setCanteenInfo] = useState(() => {
        // Load canteen info from local storage
        try {
            const localData = localStorage.getItem('canteenInfo');
            return localData ? JSON.parse(localData) : null;
        } catch (error) {
            return null;
        }
    });

    useEffect(() => {
        // Save cart to local storage whenever it changes
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        localStorage.setItem('canteenInfo', JSON.stringify(canteenInfo));
    }, [cartItems, canteenInfo]);

    const addToCart = (item, canteen) => {
        // Check if ordering from a different canteen
        if (canteenInfo && canteenInfo._id !== canteen._id) {
            toast.error('You can only order from one canteen at a time. Please clear your cart first.');
            return;
        }
        
        // If cart is empty, set the canteen info
        if (cartItems.length === 0) {
            setCanteenInfo(canteen);
        }

        setCartItems(prevItems => {
            const itemExists = prevItems.find(cartItem => cartItem._id === item._id);
            if (itemExists) {
                // Increase quantity if item already exists
                return prevItems.map(cartItem =>
                    cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            } else {
                // Add new item to cart
                return [...prevItems, { ...item, quantity: 1 }];
            }
        });
        toast.success(`${item.name} added to cart!`);
    };

    const removeFromCart = (itemId) => {
        setCartItems(prevItems => {
            const itemToRemove = prevItems.find(cartItem => cartItem._id === itemId);
            if (itemToRemove.quantity > 1) {
                // Decrease quantity
                return prevItems.map(cartItem =>
                    cartItem._id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
                );
            } else {
                // Remove item completely
                return prevItems.filter(cartItem => cartItem._id !== itemId);
            }
        });
        toast.success('Item updated in cart.');
    };

    const clearCart = () => {
        setCartItems([]);
        setCanteenInfo(null);
        toast.success('Cart cleared.');
    };

    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, canteenInfo, addToCart, removeFromCart, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};
