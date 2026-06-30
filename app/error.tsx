"use client";

// error.tsx is a Client Component — Next.js requirement.
// It catches runtime errors thrown during rendering of any page or component
// within the app directory. The root layout (providers, Header, Footer context)
// is still applied — this component only replaces the erroring page content.

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to console in development; swap for Sentry.captureException(error) when monitoring is added
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-cream">
      <div className="max-w-lg w-full text-center">

        {/* Icon */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-brown mb-3">
          Something went wrong
        </h1>
        <p className="text-stone-500 mb-2">
          An unexpected error occurred. You can try again or return to the homepage.
        </p>
        <p className="text-stone-400 text-sm mb-8" dir="rtl">
          حدث خطأ غير متوقع. يمكنك المحاولة مجدداً أو العودة إلى الصفحة الرئيسية.
        </p>

        {/* Error digest — shown only in dev, useful for server-side error lookup */}
        {process.env.NODE_ENV === "development" && error.message && (
          <p className="text-xs text-stone-400 font-mono bg-stone-100 rounded-lg px-3 py-2 mb-8 text-start break-all">
            {error.message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border-2 border-brown text-brown hover:bg-brown hover:text-white px-8 py-3.5 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
