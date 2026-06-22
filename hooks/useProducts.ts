"use client";
import { useState, useEffect } from "react";
import type { Product } from "@/lib/products";
import { fetchProducts, fetchProduct } from "@/lib/api";

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function useProducts(): ProductsState {
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((products) => { if (!cancelled) setState({ products, loading: false, error: null }); })
      .catch((e: Error) => { if (!cancelled) setState({ products: [], loading: false, error: e.message }); });
    return () => { cancelled = true; };
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
