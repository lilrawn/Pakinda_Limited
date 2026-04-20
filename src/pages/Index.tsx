import Navbar from "@/components/Navbar";
import IntroAnimation from "@/components/IntroAnimation";
import Hero from "@/components/Hero";
import Fleet from "@/components/Fleet";
import Process from "@/components/Process";
import Consign from "@/components/Consign";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <IntroAnimation />
      <Navbar />
      <main>
        <Hero />
        <Fleet />
        <Process />
        <Consign />
      </main>
      <Footer />
    </>
  );
};

export default Index;
