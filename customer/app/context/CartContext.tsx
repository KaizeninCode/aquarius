import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useContext, createContext } from "react";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  isLoaded: boolean;
};

const CART_STORAGE_KEY = "cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // load cart from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
        stored && setItems(JSON.parse(stored));
      } catch (error) {
        console.log("Failed to load cart: ", error);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  /*
    Persist cart on every change, but only after initial load completes. This avoids overwritingthe stored cart with an empty array during the load itself 
    */
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch((err) =>
      console.error("Failed to save cart:  ", err),
    );
  }, [items, isLoaded]);

   const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems(prev => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => setItems(prev => prev.filter(i => i.productId !== productId))

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
        removeItem(productId)
        return
    }

    setItems(prev => prev.map(i => i.productId === productId ? {...i, quantity} : i))
    
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{items, addItem, removeItem, updateQuantity, clearCart, total, isLoaded}}>
        {children}
    </CartContext.Provider>
  )
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used within CartProvider.')
    return ctx
}
