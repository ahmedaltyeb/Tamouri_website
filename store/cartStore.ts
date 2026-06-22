import { create } from "zustand";
import type { Product } from "@/lib/products";

export interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  wishlist: string[];
  _hydrated: boolean;
  _hydrate: (items: CartItem[], wishlist: string[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  wishlist: [],
  _hydrated: false,

  _hydrate: (items, wishlist) => set({ items, wishlist, _hydrated: true }),

  addToCart: (product) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      const items = existing
        ? state.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...state.items, { ...product, quantity: 1 }];
      saveToStorage({ items, wishlist: state.wishlist });
      return { items };
    });
  },

  removeFromCart: (id) => {
    set((state) => {
      const items = state.items.filter((i) => i.id !== id);
      saveToStorage({ items, wishlist: state.wishlist });
      return { items };
    });
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(id);
      return;
    }
    set((state) => {
      const items = state.items.map((i) =>
        i.id === id ? { ...i, quantity } : i
      );
      saveToStorage({ items, wishlist: state.wishlist });
      return { items };
    });
  },

  clearCart: () => {
    set((state) => {
      saveToStorage({ items: [], wishlist: state.wishlist });
      return { items: [] };
    });
  },

  toggleWishlist: (id) => {
    set((state) => {
      const wishlist = state.wishlist.includes(id)
        ? state.wishlist.filter((w) => w !== id)
        : [...state.wishlist, id];
      saveToStorage({ items: state.items, wishlist });
      return { wishlist };
    });
  },

  getTotalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
  getTotalPrice: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
}));

const STORAGE_KEY = "tamouri-cart";

function saveToStorage(data: { items: CartItem[]; wishlist: string[] }) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable — no-op
  }
}

export function loadFromStorage(): { items: CartItem[]; wishlist: string[] } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as { items: CartItem[]; wishlist: string[] }) : null;
  } catch {
    return null;
  }
}
