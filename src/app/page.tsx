import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/Home/HeroSection";
import AboutSection from "@/components/sections/Home/AboutSection";
import ServicesSection from "@/components/sections/Home/ServicesSection";

export const metadata: Metadata = {
  title: "Voyage — Craft Without Limits",
  description: "The digital product agency crafting exceptional software at scale. Turning ambitious ideas into products that perform and last.",
};

export default function HomePage() {
  return (
    <main>
      <Header />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
    </main>
  );
}
