import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Strip } from "@/components/strip";
import { Features } from "@/components/features";
import { Gallery } from "@/components/gallery";
import { Reviews } from "@/components/reviews";
import { Split } from "@/components/split";
import { CtaFinal } from "@/components/cta-final";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Strip />
        <Features />
        <Gallery />
        <Reviews />
        <Split />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
