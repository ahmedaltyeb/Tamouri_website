"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-stone-100">
        <p className="text-2xl font-bold text-gold">تموري</p>
        <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mt-0.5">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <NavItem
          href="/admin/products"
          label="Products"
          active={pathname.startsWith("/admin/products")}
          icon={<ProductsIcon />}
        />
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-stone-100">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors duration-150 cursor-pointer"
        >
          <ArrowLeftIcon />
          Back to Store
        </Link>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${
        active
          ? "bg-amber-50 text-amber-800 border border-amber-200"
          : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function ProductsIcon() {
  return (
    <svg
      className="w-5 h-5 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      className="w-4 h-4 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}
