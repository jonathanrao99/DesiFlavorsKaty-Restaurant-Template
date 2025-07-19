import { Trash2, Plus, Minus, Edit, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  specialInstructions?: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
}

interface CartItemsProps {
  items: CartItem[];
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onUpdateInstructions: (id: number, instructions: string) => void;
}

const CartItems = ({ items, onRemove, onUpdateQuantity, onUpdateInstructions }: CartItemsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<{id: number, instructions: string} | null>(null);

  const openEditDialog = (id: number, instructions: string = '') => {
    setEditItem({ id, instructions });
    setIsEditDialogOpen(true);
  };

  const handleSaveInstructions = () => {
    if (editItem) {
      // Call the provided method to update instructions
      onUpdateInstructions(editItem.id, editItem.instructions);
      
      // Close the dialog
      setIsEditDialogOpen(false);
      setEditItem(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
        <p className="text-gray-400 text-sm">Add some delicious items to your cart</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="font-display font-bold text-lg">Item Details</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="p-6 flex flex-col sm:flex-row justify-between hover:bg-gray-50 transition-colors">
            <div className="flex-1 mb-4 sm:mb-0">
              <div className="flex flex-col">
                <div className="flex items-start">
                  <div>
                    <h3 className="font-playfair font-medium text-lg flex items-center">
                      {item.name}
                      {item.isVegetarian && (
                        <span className="ml-2 px-2.5 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          Veg
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="ml-2 px-2.5 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                          Spicy
                        </span>
                      )}
                    </h3>
                    <p className="text-desi-orange font-medium mt-2 text-lg">{item.price}</p>
                  </div>
                </div>
                
                {item.specialInstructions && (
                  <div className="mt-3 bg-gray-50 p-3 rounded-md text-sm text-gray-700 flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-medium">Special instructions:</span> {item.specialInstructions}
                    </div>
                    <button 
                      onClick={() => openEditDialog(item.id, item.specialInstructions)}
                      className="text-desi-orange hover:text-desi-orange/80 ml-3 flex-shrink-0"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                )}

                {!item.specialInstructions && (
                  <button 
                    onClick={() => openEditDialog(item.id, '')}
                    className="text-desi-orange hover:text-desi-orange/80 text-sm mt-2 flex items-center self-start"
                  >
                    <Edit size={16} className="mr-1" />
                    Add special instructions
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button 
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-1.5 border-x border-gray-300 font-medium">
                  {item.quantity}
                </span>
                <button 
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <button 
                onClick={() => onRemove(item.id)}
                className="text-gray-500 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                aria-label="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Instructions Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-display pb-2">Special Instructions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Add special preparation instructions:</label>
              <Textarea
                id="instructions"
                placeholder="Any special preparation instructions? (e.g., less spicy, no cilantro)"
                value={editItem?.instructions || ''}
                onChange={(e) => editItem && setEditItem({...editItem, instructions: e.target.value})}
                className="min-h-[80px]"
              />
            </div>
            <DialogFooter className="pt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveInstructions} className="bg-desi-orange hover:bg-desi-orange/90 text-white">
                Save Instructions
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartItems; 
