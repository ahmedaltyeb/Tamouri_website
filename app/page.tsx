import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryCards from "@/components/CategoryCards";
import FeaturedProducts from "@/components/FeaturedProducts";
import HeroSlider from "@/components/HeroSlider";
import WhyTamouri from "@/components/WhyTamouri";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <TopBar />
      <Header />
      <Hero />
      <CategoryCards />
      <FeaturedProducts />
      <HeroSlider />
      <WhyTamouri />
      <Testimonials />
      <Footer />
    </main>
  );
}
