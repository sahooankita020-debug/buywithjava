import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  productName: string;
  clubId: string;
  clubName: string;
  quantity: number;
  price: number;
  priceType?: string;
}

interface CartState {
  items: CartItem[];
  clubId: string | null;
  clubName: string | null;
  addItem: (item: CartItem) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      clubId: null,
      clubName: null,

      addItem: (item) => {
        const state = get();
        // Single-club enforcement
        if (state.clubId && state.clubId !== item.clubId) {
          return false; // Caller should prompt user to clear cart
        }

        const existing = state.items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({
            items: [...state.items, item],
            clubId: item.clubId,
            clubName: item.clubName,
          });
        }
        return true;
      },

      removeItem: (productId) => {
        const state = get();
        const newItems = state.items.filter((i) => i.productId !== productId);
        set({
          items: newItems,
          clubId: newItems.length > 0 ? state.clubId : null,
          clubName: newItems.length > 0 ? state.clubName : null,
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], clubId: null, clubName: null }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "buywithjava-cart" }
  )
);
