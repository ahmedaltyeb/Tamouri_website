import type { Product } from "@/lib/products";

// In static export mode, Next.js does not auto-prepend basePath to fetch().
// We must prefix manually so GitHub Pages resolves the correct path.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/api/products`);
  if (!res.ok) throw new Error("Failed to load products");
  return res.json() as Promise<Product[]>;
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const products = await fetchProducts();
  return products.find((p) => p.id === id) ?? null;
}
