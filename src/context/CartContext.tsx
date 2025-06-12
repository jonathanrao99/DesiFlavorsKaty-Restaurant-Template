'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

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

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Partial<CartItem> & { id: number; name: string; price: string; }) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity and any other changes
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        
        // Set quantity (either add to existing or use the provided quantity)
        if (item.quantity) {
          updatedItems[existingItemIndex].quantity = item.quantity;
        } else {
          updatedItems[existingItemIndex].quantity += 1;
        }
        
        // Always update special instructions if provided, even if empty string
        if (item.specialInstructions !== undefined) {
          updatedItems[existingItemIndex].specialInstructions = item.specialInstructions;
        }
        
        toast.success(`${item.name} quantity updated to ${updatedItems[existingItemIndex].quantity}`);
        
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
        
        toast.success(`${item.name} has been added to your cart`);
        
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === id);
      if (itemToRemove) {
        toast.success(`${itemToRemove.name} has been removed from your cart`);
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
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Extract numeric price from string (e.g., "$14.99" -> 14.99)
      const itemPrice = parseFloat(item.price.replace('$', ''));
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
      getCartTotal
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
