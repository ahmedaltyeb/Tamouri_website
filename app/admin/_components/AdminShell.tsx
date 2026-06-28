"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

interface Props {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
}

// AdminShell owns the mobile sidebar open/close state.
// On desktop (lg+): the sidebar stays in the normal flex flow — identical to
// the original layout. On mobile/tablet: it becomes a fixed off-canvas drawer.
export default function AdminShell({ children, userName, userEmail }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Close on route change (user tapped a nav link)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape key + body scroll lock
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Restore focus to the button that opened the drawer
      triggerRef.current?.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  return (
    // dir="ltr" preserved from the original layout
    <div className="flex h-screen overflow-hidden" dir="ltr">

      {/* ── Mobile / Tablet top bar ─────────────────────────────────────────── */}
      {/* Hidden on desktop (lg+) — zero impact on the current desktop layout */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-white border-b border-stone-200 flex items-center px-4 gap-3 flex-shrink-0">
        <button
          ref={triggerRef}
          onClick={() => setOpen(true)}
          aria-label="Open sidebar menu"
          aria-expanded={open}
          aria-controls="admin-sidebar"
          className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <p className="text-sm font-black text-brown">مربع الغربية</p>
        <span className="text-stone-300 text-xs">·</span>
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Admin Panel</p>
      </div>

      {/* ── Backdrop (mobile/tablet only) ───────────────────────────────────── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar wrapper ─────────────────────────────────────────────────── */}
      {/*
        Mobile/tablet: fixed off-canvas, slides in from left, z-50.
        Desktop (lg+):  back in the normal flex flow, no transform, no z-index.
        The AdminSidebar component itself is unchanged.
      */}
      <div
        id="admin-sidebar"
        role="navigation"
        aria-label="Admin navigation"
        className={[
          // Mobile/tablet: fixed off-canvas drawer
          "fixed inset-y-0 left-0 z-50",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop: revert to in-flow permanent sidebar (undo fixed + transform)
          "lg:relative lg:inset-auto lg:z-auto lg:translate-x-0 lg:flex lg:flex-shrink-0",
        ].join(" ")}
      >
        <AdminSidebar userName={userName} userEmail={userEmail} />
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      {/*
        pt-14 on mobile/tablet offsets the fixed top bar so content isn't hidden under it.
        lg:pt-0 removes the padding on desktop where the top bar is hidden.
      */}
      <main className="flex-1 overflow-y-auto bg-stone-50 pt-14 lg:pt-0">
        {children}
      </main>

    </div>
  );
}
