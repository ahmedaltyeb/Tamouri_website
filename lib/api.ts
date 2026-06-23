import type { Product } from "@/lib/products";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/api/products`);
  if (!res.ok) throw new Error("Failed to load products");
  return res.json() as Promise<Product[]>;
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${BASE}/api/products/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load product");
  return res.json() as Promise<Product>;
}
