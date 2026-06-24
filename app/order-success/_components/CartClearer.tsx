"use client";
import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

export default function CartClearer() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    // Clear localStorage cart
    clearCart();
    // Best-effort clear of DB cart (no-op for guests; 401 silently ignored)
    fetch("/api/cart", { method: "DELETE", credentials: "include" }).catch(() => {});
  }, [clearCart]);

  return null;
}
