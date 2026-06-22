import { Suspense } from "react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShopContent from "@/components/ShopContent";

export default function ShopPage() {
  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />
      <Suspense>
        <ShopContent />
      </Suspense>
      <Footer />
    </main>
  );
}
