import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // FIX: Load from localStorage directly in useState to prevent wiping data
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem('cartItems');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to load cart", error);
      return [];
    }
  });

  // Save to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    
    if (existItem) {
      setCartItems(
        cartItems.map((x) =>
          x._id === product._id ? { ...existItem, qty: existItem.qty + quantity } : x
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, qty: quantity }]);
    }
    // Optional: alert(`${product.title} added to cart!`);
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x._id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};