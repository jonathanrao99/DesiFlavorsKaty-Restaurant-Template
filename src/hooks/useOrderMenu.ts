import { useState, useEffect } from 'react';
import { MenuItem } from '@/types/menu';
import { useMenuItems } from './useMenuItems';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';

export const useOrderMenu = () => {
  const {
    menuItems,
    categories,
    selectedCategory,
    setSelectedCategory,
    loading,
    error
  } = useMenuItems();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { addToCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const openOrderDialog = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setSpecialInstructions('');
    setIsDialogOpen(true);
  };

  const handleAddToCart = () => {
    if (selectedItem && quantity > 0) {
      const itemToAdd = {
        ...selectedItem,
        quantity: quantity,
        specialInstructions: specialInstructions.trim() || undefined
      };
      
      addToCart(itemToAdd);
      setIsDialogOpen(false);
      
      toast.success(`${quantity} x ${selectedItem.name} added to your cart`);
    }
  };
  
  return {
    activeCategory: selectedCategory,
    menuItems,
    isScrolled,
    categories,
    isDialogOpen,
    setIsDialogOpen,
    selectedItem,
    quantity,
    setQuantity,
    specialInstructions,
    setSpecialInstructions,
    handleCategoryClick,
    openOrderDialog,
    handleAddToCart,
    loading,
    error
  };
};
