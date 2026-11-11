import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isCustomer } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    subtotal: 0,
    deliveryFee: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(false);

  // Recalculate local totals
  const recalculate = (items) => {
    let subtotal = 0;
    let totalItems = 0;

    items.forEach((item) => {
      const price = item.product?.price || item.unitPrice || 0;
      subtotal += price * item.quantity;
      totalItems += item.quantity;
    });

    const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;
    const totalAmount = subtotal + deliveryFee;

    return {
      items,
      totalItems,
      subtotal,
      deliveryFee,
      totalAmount
    };
  };

  // Fetch cart from backend if customer is logged in
  const fetchCart = useCallback(async () => {
    if (!isCustomer) {
      // Load from localStorage for guest
      const localCart = localStorage.getItem('bakery_guest_cart');
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart);
          setCart(recalculate(parsed.items || []));
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.warn('Could not fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to Cart
  const addToCart = async (product, quantity = 1) => {
    if (isCustomer) {
      try {
        const res = await api.post('/cart/add', {
          productId: product._id,
          quantity
        });
        if (res.data.success) {
          setCart(res.data.cart);
          return res.data;
        }
      } catch (err) {
        throw err;
      }
    } else {
      // Local cart for guest
      setCart((prev) => {
        const existingIdx = prev.items.findIndex(
          (i) => (i.product?._id || i.product) === product._id
        );
        let updatedItems = [...prev.items];
        if (existingIdx > -1) {
          const newQty = updatedItems[existingIdx].quantity + quantity;
          if (newQty > product.stock) {
            throw new Error(`Only ${product.stock} items available in stock`);
          }
          updatedItems[existingIdx].quantity = newQty;
        } else {
          if (quantity > product.stock) {
            throw new Error(`Only ${product.stock} items available in stock`);
          }
          updatedItems.push({
            product,
            quantity,
            unitPrice: product.price
          });
        }
        const updatedCart = recalculate(updatedItems);
        localStorage.setItem('bakery_guest_cart', JSON.stringify(updatedCart));
        return updatedCart;
      });
      return { success: true };
    }
  };

  // Update quantity (Increase / Decrease)
  const updateQuantity = async (productId, quantity) => {
    if (isCustomer) {
      try {
        const res = await api.put('/cart/update', { productId, quantity });
        if (res.data.success) {
          setCart(res.data.cart);
          return res.data;
        }
      } catch (err) {
        throw err;
      }
    } else {
      setCart((prev) => {
        let updatedItems = [...prev.items];
        const idx = updatedItems.findIndex(
          (i) => (i.product?._id || i.product) === productId
        );
        if (idx > -1) {
          if (quantity <= 0) {
            updatedItems.splice(idx, 1);
          } else {
            updatedItems[idx].quantity = quantity;
          }
        }
        const updatedCart = recalculate(updatedItems);
        localStorage.setItem('bakery_guest_cart', JSON.stringify(updatedCart));
        return updatedCart;
      });
    }
  };

  // Remove from Cart
  const removeFromCart = async (productId) => {
    if (isCustomer) {
      try {
        const res = await api.delete(`/cart/item/${productId}`);
        if (res.data.success) {
          setCart(res.data.cart);
        }
      } catch (err) {
        throw err;
      }
    } else {
      setCart((prev) => {
        const updatedItems = prev.items.filter(
          (i) => (i.product?._id || i.product) !== productId
        );
        const updatedCart = recalculate(updatedItems);
        localStorage.setItem('bakery_guest_cart', JSON.stringify(updatedCart));
        return updatedCart;
      });
    }
  };

  // Clear Cart
  const clearCart = async () => {
    if (isCustomer) {
      try {
        await api.delete('/cart/clear');
      } catch (err) {
        console.error(err);
      }
    }
    localStorage.removeItem('bakery_guest_cart');
    setCart({
      items: [],
      totalItems: 0,
      subtotal: 0,
      deliveryFee: 0,
      totalAmount: 0
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
