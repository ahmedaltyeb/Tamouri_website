"use client";
import { useEffect, useRef } from "react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useCartStore } from "@/store/cartStore";
import type { CartItem } from "@/store/cartStore";

type ServerItem = {
  productId: string;
  quantity: number;
  product: Omit<CartItem, "quantity">;
};

async function syncToServer(items: CartItem[]) {
  try {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      }),
    });
  } catch {
    // silent — best-effort sync
  }
}

export default function CartSync() {
  const { user } = useCustomerAuth();
  const { items, wishlist, _hydrate } = useCartStore();
  const prevUserId = useRef<string | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isMerging = useRef(false);

  // When user logs in: fetch server cart, merge with local, push merged back
  useEffect(() => {
    if (user && prevUserId.current !== user.id) {
      prevUserId.current = user.id;
      void mergeOnLogin();
    } else if (!user) {
      prevUserId.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function mergeOnLogin() {
    isMerging.current = true;
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (!res.ok) return;

      const serverItems = (await res.json()) as ServerItem[];
      const local = useCartStore.getState().items;
      const localWishlist = useCartStore.getState().wishlist;

      // Merge: server as base, take higher quantity for overlapping items
      const merged = new Map<string, CartItem>();
      for (const si of serverItems) {
        merged.set(si.productId, { ...si.product, id: si.productId, quantity: si.quantity });
      }
      for (const li of local) {
        const existing = merged.get(li.id);
        if (existing) {
          merged.set(li.id, { ...existing, quantity: Math.max(existing.quantity, li.quantity) });
        } else {
          merged.set(li.id, li);
        }
      }

      const mergedItems = Array.from(merged.values());
      _hydrate(mergedItems, localWishlist);
      await syncToServer(mergedItems);
    } catch {
      // Network error at startup or offline — best-effort, do not surface to user
    } finally {
      isMerging.current = false;
    }
  }

  // Debounced sync on every cart change (logged-in users only)
  useEffect(() => {
    if (!user || isMerging.current) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => syncToServer(items), 800);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, user?.id]);

  // Also sync wishlist changes as a no-op (wishlist is localStorage + account page handles DB)
  void wishlist;

  return null;
}
