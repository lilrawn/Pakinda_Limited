import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CarMarket = () => {
  const { marketListings } = useApp();
  const approved = useMemo(() => marketListings.filter(l => l.status === "approved"), [marketListings]);
  const [selected, setSelected] = useState<string | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);

  const selectedListing = approved.find(l => l.id === selected);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-0">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">

          {/* Header */}
          <div className="mb-16">
            <span className="eyebrow block mb-6">Pakinda Limited · Car Market</span>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h1 className="font-display text-4xl md:text-6xl leading-tight text-balance">
                Vetted vehicles. <span className="italic text-steel">Private sellers.</span>
              </h1>
              <div className="max-w-sm">
                <p className="text-foreground/60 text-sm leading-relaxed">
                  Every listing is reviewed and approved by Pakinda Limited. Buy with confidence — no scams, no middlemen.
                </p>
                <a href="/#consign" className="inline-flex mt-4 text-[10px] uppercase tracking-[0.25em] font-medium border-b border-foreground/30 pb-1 hover:border-foreground transition-colors">
                  Sell your car here →
                </a>
              </div>
            </div>
          </div>

          {approved.length === 0 ? (
            <div className="text-center py-32 border border-foreground/10 rounded-2xl">
              <p className="font-display text-3xl text-foreground/30 mb-4">No listings at the moment.</p>
              <p className="text-foreground/40 text-sm mb-8">Check back soon, or be the first to list your vehicle.</p>
              <a href="/#consign" className="btn-vault inline-flex">List Your Car</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10 mb-24">
              {approved.map(listing => (
                <div key={listing.id}
                  className="group bg-background hover:bg-surface transition-colors duration-700 p-8 flex flex-col cursor-pointer"
                  onClick={() => { setSelected(listing.id); setPhotoIdx(0); }}>

                  {/* Photo */}
                  <div className="relative aspect-[16/10] mb-6 overflow-hidden bg-surface rounded-lg">
                    {listing.imageUrls.length > 0 ? (
                      <img src={listing.imageUrls[0]} alt={`${listing.make} ${listing.model}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-foreground/20 text-4xl">🚗</span>
                      </div>
                    )}
                    {listing.imageUrls.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded">
                        +{listing.imageUrls.length - 1} photos
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display text-2xl">{listing.year} {listing.make} {listing.model}</h3>
                  </div>
                  <span className="eyebrow text-foreground/40 mb-4">{listing.mileage} km</span>

                  <div className="hairline my-4" />

                  <p className="text-foreground/60 text-sm leading-relaxed line-clamp-2 mb-6">{listing.description}</p>

                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <span className="eyebrow text-foreground/40 block mb-1">Asking Price</span>
                      <span className="font-display text-2xl text-steel">KES {listing.askingPrice?.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.25em] font-medium border-b border-foreground/30 pb-1 group-hover:border-foreground transition-colors">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-3xl bg-background border border-foreground/10 rounded-2xl overflow-hidden shadow-2xl" style={{ maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>

            <button onClick={() => setSelected(null)} className="absolute top-5 right-5 z-10 text-foreground/40 hover:text-foreground text-2xl leading-none">×</button>

            {/* Photos */}
            {selectedListing.imageUrls.length > 0 && (
              <div>
                <div className="aspect-[16/9] bg-surface overflow-hidden">
                  <img src={selectedListing.imageUrls[photoIdx]} alt="" className="w-full h-full object-cover" />
                </div>
                {selectedListing.imageUrls.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {selectedListing.imageUrls.map((url, i) => (
                      <button key={i} onClick={() => setPhotoIdx(i)}
                        className={`w-16 h-10 flex-shrink-0 overflow-hidden rounded border-2 transition-all ${i === photoIdx ? "border-steel" : "border-transparent opacity-50"}`}>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="p-8">
              <h2 className="font-display text-3xl mb-1">{selectedListing.year} {selectedListing.make} {selectedListing.model}</h2>
              <p className="eyebrow text-foreground/40 mb-6">{selectedListing.mileage} km · Private Sale · Pakinda Limited Verified</p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div><p className="eyebrow text-foreground/40 mb-1">Asking Price</p><p className="font-display text-3xl text-steel">KES {selectedListing.askingPrice?.toLocaleString()}</p></div>
                <div><p className="eyebrow text-foreground/40 mb-1">Year</p><p className="font-display text-xl">{selectedListing.year}</p></div>
                <div><p className="eyebrow text-foreground/40 mb-1">Mileage</p><p className="text-sm">{selectedListing.mileage} km</p></div>
              </div>

              <div className="hairline mb-6" />
              <p className="text-foreground/70 leading-relaxed mb-8">{selectedListing.description}</p>

              <div className="bg-surface p-5 rounded-xl">
                <p className="eyebrow text-foreground/40 mb-4">Contact Seller via Pakinda Limited</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={`tel:${selectedListing.sellerPhone}`}
                    className="flex-1 py-3 text-center btn-vault text-sm">
                    📞 Call Seller
                  </a>
                  <a href={`https://wa.me/254706504698?text=Hi%2C%20I%20saw%20your%20${selectedListing.year}%20${selectedListing.make}%20${selectedListing.model}%20on%20Pakinda%20Limited`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-3 text-center btn-ghost-vault text-sm">
                    💬 WhatsApp
                  </a>
                </div>
                <p className="text-xs text-foreground/30 text-center mt-3">Pakinda Limited facilitates this sale for a 2% commission on completion.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CarMarket;
