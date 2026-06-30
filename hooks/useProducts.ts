"use client";
import { useState, useEffect } from "react";
import type { Product } from "@/lib/products";
import { fetchProducts, fetchProduct } from "@/lib/api";

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

/**
 * When `initialData` is provided (server-prefetched), the hook skips the
 * client-side fetch entirely and returns the data immediately (loading=false).
 * This eliminates the skeleton on first page load without losing client-side
 * interactivity for subsequent navigation.
 */
export function useProducts(initialData?: Product[]): ProductsState {
  const [state, setState] = useState<ProductsState>({
    products: initialData ?? [],
    loading: !initialData,
    error: null,
  });

  useEffect(() => {
    // Skip fetch when the server already supplied products
    if (initialData && initialData.length > 0) return;

    let cancelled = false;
    fetchProducts()
      .then((products) => { if (!cancelled) setState({ products, loading: false, error: null }); })
      .catch((e: Error) => { if (!cancelled) setState({ products: [], loading: false, error: e.message }); });
    return () => { cancelled = true; };
  // initialData is a prop — its identity never changes after mount, so it's
  // safe to exclude from the dependency array.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

interface ProductState {
  product: Product | null | undefined; // undefined = loading, null = not found
  loading: boolean;
}

export function useProduct(id: string): ProductState {
  const [state, setState] = useState<ProductState>({ product: undefined, loading: true });

  useEffect(() => {
    let cancelled = false;
    setState({ product: undefined, loading: true });
    fetchProduct(id)
      .then((product) => { if (!cancelled) setState({ product, loading: false }); })
      .catch(() => { if (!cancelled) setState({ product: null, loading: false }); });
    return () => { cancelled = true; };
  }, [id]);

  return state;
}
