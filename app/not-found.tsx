import Link from "next/link";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <TopBar />
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="max-w-lg w-full text-center">

          {/* 404 number */}
          <p className="text-8xl font-black text-gold/30 leading-none select-none mb-4">
            404
          </p>

          {/* Icon */}
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
          </div>

          <h1 className="text-2xl font-black text-brown mb-3">
            Page Not Found
          </h1>
          <p className="text-stone-500 mb-2">
            The page you are looking for does not exist or has been moved.
          </p>
          <p className="text-stone-400 text-sm mb-10" dir="rtl">
            الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Back to Home
            </Link>
            <Link
              href="/shop"
              className="border-2 border-brown text-brown hover:bg-brown hover:text-white px-8 py-3.5 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Browse Shop
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
