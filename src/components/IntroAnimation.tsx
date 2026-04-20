import { useEffect, useState } from "react";
import carHero from "@/assets/car-hero.png";

const IntroAnimation = () => {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem("Pakinda Limited-intro-played");
  });

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem("Pakinda Limited-intro-played", "1");
    const t = setTimeout(() => setShow(false), 4300);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden animate-intro-out" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-surface-deep/50 to-transparent" />
      <div className="absolute left-0 right-0 top-1/2 translate-y-[60%] h-px bg-foreground/30 animate-road" />
      <div className="absolute left-0 right-0 top-1/2 translate-y-[64%] h-px bg-foreground/10 animate-road" style={{ animationDelay: "0.2s" }} />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="eyebrow mb-4 animate-brand text-foreground/60">Nairobi · Kenya</span>
        <h1 className="font-display text-5xl md:text-8xl uppercase tracking-[0.35em] text-foreground animate-brand" style={{ animationDelay: "0.1s" }}>
          Pakinda Limited
        </h1>
        <span className="eyebrow mt-6 animate-brand text-foreground/60" style={{ animationDelay: "0.2s" }}>
          Kenya's Premier Luxury Fleet
        </span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-drive will-change-transform">
          <img src={carHero} alt="" width={1100} height={620} className="w-[80vw] max-w-[1100px] h-auto drop-shadow-[0_40px_30px_rgba(31,30,28,0.25)]" />
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;
