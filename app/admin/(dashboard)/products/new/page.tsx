import Link from "next/link";
import ProductForm from "../_components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link href="/admin/products" className="text-stone-400 hover:text-stone-600 transition-colors">
          Products
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-700 font-medium">New Product</span>
      </nav>

      <h1 className="text-2xl font-bold text-stone-900 mb-6">Add New Product</h1>

      <ProductForm mode="create" />
    </div>
  );
}
