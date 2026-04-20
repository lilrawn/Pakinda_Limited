import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { categories, type Category } from "@/data/fleet";

const Fleet = () => {
  const { fleetCars } = useApp();
  const [active, setActive] = useState<"All" | Category>("All");

  const visible = useMemo(
    () => (active === "All" ? fleetCars : fleetCars.filter((c) => c.category === active)),
    [active, fleetCars]
  );

  return (
    <section id="fleet" className="relative bg-background py-32 md:py-48 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <span className="eyebrow block mb-6">Chapter I · The Collection</span>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
              Nairobi's finest, <span className="italic text-steel">ready when you are.</span>
            </h2>
          </div>
          <p className="max-w-sm text-foreground/60 leading-relaxed">
            Every vehicle is hand-selected, insured, and delivered to your location across Nairobi. Filter by type and book by the day.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3 mb-16 border-b border-foreground/10 pb-8">
          {categories.map((c) => {
            const isActive = c === active;
            return (
              <button key={c} onClick={() => setActive(c)}
                className={`px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] font-medium transition-all duration-500 border ${
                  isActive ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground/60 border-foreground/15 hover:border-foreground/40 hover:text-foreground"
                }`}>
                {c}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10">
          {visible.map((car) => (
            <Link to={`/fleet/${car.slug}`} key={car.id}
              className="group bg-background hover:bg-surface transition-colors duration-700 p-8 md:p-10 flex flex-col relative">
              {!car.available && (
                <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
                  <span className="eyebrow text-foreground/40 bg-background px-4 py-2 border border-foreground/10">Unavailable</span>
                </div>
              )}
              <div className="flex justify-between items-start mb-8">
                <span className="eyebrow text-foreground/40">№ {car.id}</span>
                <span className="eyebrow text-foreground/40">{car.category}</span>
              </div>

              <div className="relative aspect-[16/10] mb-8 overflow-hidden">
                <img src={car.image as string} alt={car.name} loading="lazy" width={1280} height={720}
                  className="w-full h-full object-contain transition-transform duration-1000 ease-out group-hover:scale-105" />
              </div>

              <h3 className="font-display text-2xl md:text-3xl mb-1">{car.name}</h3>
              <span className="eyebrow text-foreground/40">{car.series}</span>
              <div className="hairline my-6" />

              <dl className="grid grid-cols-3 gap-4 mb-8">
                <Spec label="Power" value={car.spec.hp} />
                <Spec label="Top" value={car.spec.top} />
                <Spec label="0–100" value={car.spec.zero} />
              </dl>

              <div className="mt-auto flex items-end justify-between">
                <div>
                  <span className="eyebrow text-foreground/40 block mb-1">Per day</span>
                  <span className="font-display text-2xl">KES {car.pricePerDay.toLocaleString()}</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] font-medium border-b border-foreground/30 pb-1 group-hover:border-foreground transition-colors">
                  Book Now →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="text-center text-foreground/50 py-20 italic font-display text-xl">No vehicles in this category at present.</p>
        )}
      </div>
    </section>
  );
};

const Spec = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="eyebrow text-foreground/40 mb-1">{label}</dt>
    <dd className="font-display text-lg">{value}</dd>
  </div>
);

export default Fleet;
