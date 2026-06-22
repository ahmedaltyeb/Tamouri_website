import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import CategoryCards from "@/components/CategoryCards";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhyTamouri from "@/components/WhyTamouri";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />
      <HeroSlider />
      <CategoryCards />
      <FeaturedProducts />
      <WhyTamouri />
      <Testimonials />
      <Footer />
    </main>
  );
}
