import { lazy, Suspense } from "react";

const CarViewer = lazy(() => import("./CarViewer"));

const Hero = () => {
  return (
    <section className="relative min-h-dvh flex flex-col overflow-hidden bg-background">
      <div className="absolute left-1/2 top-0 w-px h-40 bg-steel/30 -translate-x-1/2 z-10" />

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-[44vh] z-20">
        <span className="eyebrow mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Nairobi's Premier Luxury Fleet
        </span>

        <h1
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-light tracking-tight leading-[1.02] text-balance max-w-[18ch] animate-fade-up"
          style={{ animationDelay: "0.25s" }}
        >
          Drive Kenya{" "}
          <span className="italic text-steel">in absolute style.</span>
        </h1>

        <p
          className="mt-8 max-w-[52ch] text-base md:text-lg text-foreground/60 leading-relaxed font-light text-pretty animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          A privately curated portfolio of ultra-luxury vehicles, available across Nairobi and beyond. Concierge delivery. Full insurance. No hidden fees.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.55s" }}>
          <a href="#fleet" className="btn-vault">Browse the Fleet</a>
          <a href="#consign" className="btn-ghost-vault">Sell Your Car · 2%</a>
        </div>
      </div>

      {/* Vault stage */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[94%] max-w-[1400px] h-[44vh] rounded-t-[2.5rem] overflow-hidden border-t border-x border-background z-10"
        style={{ background: "var(--gradient-vault)", boxShadow: "var(--shadow-vault)" }}
      >
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center"><span className="eyebrow text-foreground/40">Preparing vehicle…</span></div>}>
          <CarViewer />
        </Suspense>

        <div className="absolute top-6 left-6 md:top-10 md:left-10 z-30 text-left pointer-events-none">
          <span className="eyebrow text-foreground/50 block mb-1">Featured · 006</span>
          <span className="font-display text-lg md:text-xl text-foreground">Lamborghini Urus S</span>
        </div>
        <div className="absolute top-6 right-6 md:top-10 md:right-10 z-30 text-right pointer-events-none">
          <span className="eyebrow text-foreground/50 block mb-1">Per day from</span>
          <span className="font-display text-lg md:text-xl text-foreground">KES 35,000</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
