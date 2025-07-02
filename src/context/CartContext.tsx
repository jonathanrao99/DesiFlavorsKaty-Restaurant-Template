'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { logAnalyticsEvent } from '@/utils/loyaltyAndAnalytics';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    umami?: (...args: any[]) => void;
  }
}

export interface CartItem {
  id: number;
  name: string;
  price: string;
  description?: string;
  quantity: number;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  specialInstructions?: string;
  imageSrc?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Partial<CartItem> & { id: number; name: string; price: string; }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updateSpecialInstructions: (id: number, instructions: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  fulfillmentMethod: 'pickup' | 'delivery';
  setFulfillmentMethod: (method: 'pickup' | 'delivery') => void;
  scheduledTime: string;
  setScheduledTime: (time: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    // Initialize cart from localStorage
    const savedCart = window.localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery'>(() => {
    if (typeof window === 'undefined') return 'pickup';
    const savedMethod = window.localStorage.getItem('fulfillmentMethod');
    return savedMethod === 'delivery' ? 'delivery' : 'pickup';
  });

  const [scheduledTime, setScheduledTime] = useState<string>(() => {
    if (typeof window === 'undefined') return 'ASAP';
    return window.localStorage.getItem('scheduledTime') || 'ASAP';
  });

  // Save cart and fulfillment options to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('fulfillmentMethod', fulfillmentMethod);
  }, [fulfillmentMethod]);

  useEffect(() => {
    localStorage.setItem('scheduledTime', scheduledTime);
  }, [scheduledTime]);

  const addToCart = (item: Partial<CartItem> & { id: number; name: string; price: string; }) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, increment quantity by provided amount (default 1)
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        const qtyToAdd = item.quantity && item.quantity > 0 ? item.quantity : 1;
        updatedItems[existingItemIndex].quantity = existingItem.quantity + qtyToAdd;
        // Update special instructions if provided
        if (item.specialInstructions !== undefined) {
          updatedItems[existingItemIndex].specialInstructions = item.specialInstructions;
        }
        return updatedItems;
      } else {
        // Item doesn't exist, add new item with quantity specified or default to 1
        const newItem: CartItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          quantity: item.quantity || 1,
          isVegetarian: item.isVegetarian,
          isSpicy: item.isSpicy,
          specialInstructions: item.specialInstructions,
          imageSrc: item.imageSrc
        };
        
        return [...prevItems, newItem];
      }
    });
    // Analytics: log add to cart
    logAnalyticsEvent('cart_item_added', { item });
    if (typeof window !== 'undefined') {
      window.gtag && window.gtag('event', 'add_to_cart', { item_id: item.id, item_name: item.name });
      if (typeof window.umami === 'function') window.umami('add_to_cart', { item_id: item.id, item_name: item.name });
    }
  };

  const removeFromCart = (id: number) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === id);
      if (itemToRemove) {
        toast.success(`${itemToRemove.name} has been removed from your cart`);
        // Analytics: log remove from cart
        logAnalyticsEvent('cart_item_removed', { item: itemToRemove });
        if (typeof window !== 'undefined') {
          window.gtag && window.gtag('event', 'remove_from_cart', { item_id: itemToRemove.id, item_name: itemToRemove.name });
          if (typeof window.umami === 'function') window.umami('remove_from_cart', { item_id: itemToRemove.id, item_name: itemToRemove.name });
        }
      }
      return prevItems.filter(item => item.id !== id);
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const updateSpecialInstructions = (id: number, instructions: string) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, specialInstructions: instructions } : item
      )
    );
    
    const itemName = cartItems.find(item => item.id === id)?.name || 'Item';
    toast.success(`Special instructions for ${itemName} have been updated`);
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('All items have been removed from your cart');
    // Analytics: log cart abandoned
    logAnalyticsEvent('cart_abandoned', { cart_items: cartItems });
    if (typeof window !== 'undefined') {
      window.gtag && window.gtag('event', 'cart_abandoned');
      if (typeof window.umami === 'function') window.umami('cart_abandoned');
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Extract numeric price from string (e.g., "$14.99" -> 14.99)
      const itemPrice = typeof item.price === 'string'
        ? parseFloat(item.price.replace('$', ''))
        : typeof item.price === 'number'
          ? item.price
          : parseFloat(String(item.price));
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateSpecialInstructions,
      clearCart,
      getCartTotal,
      fulfillmentMethod,
      setFulfillmentMethod,
      scheduledTime,
      setScheduledTime
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
