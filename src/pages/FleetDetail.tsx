import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import BookingFlow from "@/components/BookingFlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FleetDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { fleetCars, currentUser } = useApp();
  const navigate = useNavigate();
  const car = fleetCars.find((c) => c.slug === slug);
  const [showBooking, setShowBooking] = useState(false);

  if (!car) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-4xl mb-4">Vehicle not found</p>
          <Link to="/" className="eyebrow text-foreground/50 hover:text-foreground transition-colors">← Return to fleet</Link>
        </div>
      </div>
    );
  }

  const handleBook = () => {
    if (!currentUser) {
      navigate("/auth", { state: { returnTo: `/fleet/${car.slug}`, carSlug: car.slug, mode: "signin" } });
      return;
    }
    setShowBooking(true);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-0">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="mb-12">
            <Link to="/#fleet" className="eyebrow text-foreground/40 hover:text-foreground transition-colors">← The Fleet</Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
            {/* Left: image */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[16/10] overflow-hidden bg-surface rounded-lg">
                <img src={car.image as string} alt={car.name} className="w-full h-full object-contain" />
                <div className="absolute top-6 left-6">
                  <span className="eyebrow bg-foreground text-background px-3 py-1">{car.category}</span>
                </div>
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <span className="eyebrow text-foreground/50">№ {car.id}</span>
                  {!car.available && (
                    <span className="eyebrow bg-red-500 text-white px-2 py-0.5 rounded">Unavailable</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: details */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <span className="eyebrow text-foreground/40 mb-3">{car.series}</span>
              <h1 className="font-display text-4xl md:text-5xl mb-4 leading-tight">{car.name}</h1>
              <p className="text-foreground/60 leading-relaxed mb-8">{car.description}</p>

              <dl className="grid grid-cols-3 gap-6 mb-8">
                <div><dt className="eyebrow text-foreground/40 mb-1">Power</dt><dd className="font-display text-xl">{car.spec.hp}</dd></div>
                <div><dt className="eyebrow text-foreground/40 mb-1">Top Speed</dt><dd className="font-display text-xl">{car.spec.top}</dd></div>
                <div><dt className="eyebrow text-foreground/40 mb-1">0–100</dt><dd className="font-display text-xl">{car.spec.zero}</dd></div>
              </dl>

              <div className="hairline mb-8" />

              <ul className="space-y-2 mb-8">
                {car.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-foreground/70">
                    <span className="w-1 h-1 bg-steel rounded-full flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>

              <div className="bg-surface p-6 rounded-lg">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="eyebrow text-foreground/40 block mb-1">Per Day</span>
                    <span className="font-display text-3xl text-steel">KES {car.pricePerDay.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-foreground/40">Full insurance · Concierge delivery</span>
                </div>

                {car.available ? (
                  <>
                    <button onClick={handleBook} className="w-full btn-vault text-center">
                      {currentUser ? "Book This Vehicle" : "Sign In to Book"}
                    </button>
                    <p className="text-center text-xs text-foreground/30 mt-3">
                      {currentUser ? "Select dates & pay securely" : "Quick sign-in or create account — takes 2 minutes"}
                    </p>
                  </>
                ) : (
                  <div className="w-full py-4 text-center bg-foreground/5 text-foreground/30 text-[10px] uppercase tracking-[0.25em]">
                    Currently Unavailable
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {showBooking && <BookingFlow car={car} onClose={() => setShowBooking(false)} />}
    </>
  );
};

export default FleetDetail;
