"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";

export default function AccountSidebar() {
  const { user, logout } = useCustomerAuth();
  const { tr, dir } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  const links = [
    {
      href: "/account/profile",
      label: tr("myProfile"),
      icon: (
        <svg className="w-4 h-4 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      ),
    },
    {
      href: "/account/orders",
      label: tr("myOrders"),
      icon: (
        <svg className="w-4 h-4 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
      ),
    },
    {
      href: "/account/addresses",
      label: tr("myAddresses"),
      icon: (
        <svg className="w-4 h-4 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      ),
    },
    {
      href: "/account/wishlist",
      label: tr("myWishlist"),
      icon: (
        <svg className="w-4 h-4 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-full md:w-60 flex-none" dir={dir}>
      {/* User greeting card */}
      <div className="bg-gradient-to-br from-brown to-brown-dark rounded-2xl p-5 text-white mb-4 shadow-sm">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-black mb-3">
          {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
        <p className="text-xs text-white/70 font-medium">{tr("hello")}</p>
        <p className="font-bold truncate">{user?.name ?? "..."}</p>
        <p className="text-[11px] text-white/60 truncate mt-0.5">{user?.email}</p>
      </div>

      {/* Nav links */}
      <nav className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-stone-50 last:border-b-0 cursor-pointer ${
                active
                  ? "bg-brown/5 text-brown border-s-2 border-s-brown"
                  : "text-stone-600 hover:bg-stone-50 hover:text-brown"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          {tr("signOut")}
        </button>
      </nav>
    </aside>
  );
}
