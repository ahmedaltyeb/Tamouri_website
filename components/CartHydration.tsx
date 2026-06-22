"use client";
import { useEffect } from "react";
import { useCartStore, loadFromStorage } from "@/store/cartStore";

export default function CartHydration() {
  const _hydrate = useCartStore((s) => s._hydrate);
  const _hydrated = useCartStore((s) => s._hydrated);

  useEffect(() => {
    if (_hydrated) return;
    const saved = loadFromStorage();
    _hydrate(saved?.items ?? [], saved?.wishlist ?? []);
  }, [_hydrate, _hydrated]);

  return null;
}
