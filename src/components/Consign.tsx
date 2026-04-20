import { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";

const Consign = () => {
  const { submitMarketListing, currentUser } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [make, setMake] = useState(""); const [model, setModel] = useState("");
  const [year, setYear] = useState(""); const [mileage, setMileage] = useState("");
  const [price, setPrice] = useState(""); const [description, setDescription] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const photoRef = useRef<HTMLInputElement>(null);

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 8);
    setPhotoFiles(files);
    Promise.all(files.map(f => new Promise<string>(res => { const r = new FileReader(); r.onload = ev => res(ev.target?.result as string); r.readAsDataURL(f); }))).then(setPhotoPreviews);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name required";
    if (!phone.trim()) e.phone = "Phone required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Valid email required";
    if (!make.trim()) e.make = "Make required"; if (!model.trim()) e.model = "Model required";
    if (!year.trim() || !/^\d{4}$/.test(year)) e.year = "4-digit year"; if (!mileage.trim()) e.mileage = "Required";
    if (!price.trim()) e.price = "Required"; if (photoFiles.length === 0) e.photos = "At least one photo required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({}); setSubmitting(true);
    try {
      await submitMarketListing({ sellerName: name, sellerEmail: email, sellerPhone: phone, make, model, year, mileage, askingPrice: parseInt(price.replace(/,/g, "")) || 0, description, imageUrls: [] }, photoFiles);
      setSubmitted(true);
    } catch { setErrors({ submit: "Submission failed. Please try again." }); }
    finally { setSubmitting(false); }
  };

  return (
    <section id="consign" className="relative bg-[#0c0b0a] py-32 md:py-48 px-6 md:px-12 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#c8a84b 1px, transparent 1px), linear-gradient(90deg, #c8a84b 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="max-w-[1400px] mx-auto relative">
        <div className="text-center mb-16 md:mb-24">
          <span className="eyebrow block mb-6" style={{ color: "rgba(200,168,75,0.6)" }}>Chapter III · Sell Your Vehicle</span>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] max-w-3xl mx-auto text-balance text-white">
            List with us. <br /><span className="italic" style={{ color: "#c8a84b" }}>Keep 98% of the sale.</span>
          </h2>
          <p className="mt-6 text-white/50 max-w-lg mx-auto leading-relaxed">
            Submit your vehicle with photos. Pakinda Limited reviews and posts it to the{" "}
            <a href="/market" className="underline" style={{ color: "#c8a84b" }}>Car Market</a> where vetted buyers find it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5">
            <dl className="grid grid-cols-3 gap-4 mb-12">
              {[["Commission","2%"],["Avg. Days","14"],["Buyers","800+"]].map(([l,v])=>(
                <div key={l} className="text-center border border-white/10 rounded-xl p-5">
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-2">{l}</dt>
                  <dd className="font-display text-3xl" style={{ color: "#c8a84b" }}>{v}</dd>
                </div>
              ))}
            </dl>
            {[
              { n:"01", t:"Submit with photos", b:"Upload up to 8 photos. Listings with clear photos sell in under 14 days on average." },
              { n:"02", t:"Admin review & approval", b:"We verify your listing within 24 hours and publish it to the Car Market page." },
              { n:"03", t:"Buyer contacts you directly", b:"Vetted buyers reach you via WhatsApp or call. We handle escrow. You receive 98%." },
            ].map(s=>(
              <div key={s.n} className="flex gap-6 mb-8">
                <span className="font-display text-3xl italic flex-shrink-0 w-10" style={{ color: "rgba(200,168,75,0.4)" }}>{s.n}</span>
                <div><h4 className="text-white text-sm font-medium mb-1">{s.t}</h4><p className="text-white/40 text-sm leading-relaxed">{s.b}</p></div>
              </div>
            ))}
            <div className="mt-4 p-5 rounded-xl" style={{ border: "1px solid rgba(200,168,75,0.2)", background: "rgba(200,168,75,0.05)" }}>
              <p className="text-white/50 text-sm mb-3">Prefer to talk first?</p>
              <a href="https://wa.me/254706504698?text=Hello%20Pakinda%20Limited%2C%20I%20want%20to%20sell%20my%20vehicle" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: "#c8a84b" }}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp a specialist
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-20 border border-white/10 rounded-2xl">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(200,168,75,0.2)" }}>
                  <span className="text-2xl" style={{ color: "#c8a84b" }}>✓</span>
                </div>
                <h3 className="font-display text-2xl text-white mb-3">Listing Submitted!</h3>
                <p className="text-white/40 text-sm max-w-sm leading-relaxed mb-2">We'll review your {make} {model} and publish it to the Car Market within 24 hours.</p>
                <a href="/market" className="mt-4 text-[10px] uppercase tracking-[0.25em] hover:text-white transition-colors" style={{ color: "#c8a84b" }}>View Car Market →</a>
                <button onClick={() => { setSubmitted(false); setMake(""); setModel(""); setYear(""); setMileage(""); setPrice(""); setDescription(""); setPhotoFiles([]); setPhotoPreviews([]); }}
                  className="mt-3 text-[10px] uppercase tracking-[0.25em] text-white/30 hover:text-white/50 transition-colors">Submit another vehicle</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-white/10 rounded-2xl p-8 md:p-12" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex justify-between items-end mb-8">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">Vehicle Listing Brief</span>
                  <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "rgba(200,168,75,0.4)" }}>Ref. KE / 2025</span>
                </div>

                {/* Photos — first and prominent */}
                <div className="mb-8">
                  <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 block mb-3">
                    Vehicle Photos <span className="text-red-400">*</span> <span className="text-white/20 normal-case tracking-normal">(up to 8 images)</span>
                  </label>
                  <input ref={photoRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
                  <button type="button" onClick={() => photoRef.current?.click()}
                    className={`w-full border-2 border-dashed py-8 text-center transition-all rounded-xl ${photoPreviews.length > 0 ? "border-[#c8a84b]/40 bg-[#c8a84b]/5" : errors.photos ? "border-red-500/40" : "border-white/10 hover:border-white/25"}`}>
                    {photoPreviews.length === 0 ? (
                      <div><div className="text-4xl mb-2">📸</div><p className="text-white/40 text-sm">Click to upload vehicle photos</p><p className="text-white/20 text-xs mt-1">JPG or PNG · Up to 8 photos · Min. 1 required</p></div>
                    ) : (
                      <div className="flex gap-2 flex-wrap justify-center px-4 py-2">
                        {photoPreviews.map((src,i) => <img key={i} src={src} alt="" className="w-16 h-12 object-cover rounded" />)}
                        <div className="w-16 h-12 border border-dashed border-white/20 rounded flex items-center justify-center text-white/30 text-xs cursor-pointer">+Add</div>
                      </div>
                    )}
                  </button>
                  {errors.photos && <p className="text-red-400 text-[10px] mt-1">{errors.photos}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <CF label="Your Full Name" value={name} onChange={setName} placeholder="e.g. Grace Wanjiku" error={errors.name} required />
                  <CF label="WhatsApp / Phone" value={phone} onChange={setPhone} placeholder="+254 7XX XXX XXX" error={errors.phone} required />
                  <CF label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={errors.email} required />
                  <CF label="Vehicle Make" value={make} onChange={setMake} placeholder="e.g. Toyota, BMW, Mercedes" error={errors.make} required />
                  <CF label="Model" value={model} onChange={setModel} placeholder="e.g. Land Cruiser, X5, GLE" error={errors.model} required />
                  <CF label="Year" value={year} onChange={setYear} placeholder="e.g. 2021" error={errors.year} required />
                  <CF label="Mileage (km)" value={mileage} onChange={setMileage} placeholder="e.g. 45,000" error={errors.mileage} required />
                  <CF label="Asking Price (KES)" value={price} onChange={setPrice} placeholder="e.g. 8,500,000" error={errors.price} required />
                </div>

                <div className="mb-8">
                  <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 block mb-3">Description & Condition</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                    placeholder="Service history, condition, features, reason for sale…"
                    className="w-full bg-transparent border-b border-white/15 focus:border-[#c8a84b] outline-none py-3 text-white text-sm placeholder:text-white/20 resize-none transition-colors" />
                </div>

                {errors.submit && <p className="text-red-400 text-xs mb-4">{errors.submit}</p>}
                <label className="flex items-start gap-3 mb-8 cursor-pointer">
                  <input type="checkbox" required className="mt-1" style={{ accentColor: "#c8a84b" }} />
                  <span className="text-xs text-white/30 leading-relaxed">I agree to a confidential review. No listing will be published without my consent. Commission is 2% of the final agreed sale price.</span>
                </label>

                <div className="flex items-center justify-between gap-6">
                  <p className="text-xs text-white/20 max-w-[180px] leading-relaxed">Reviewed within 24 hours · Nairobi valuations available</p>
                  <button type="submit" disabled={submitting} className="px-10 py-4 text-black text-[11px] uppercase tracking-[0.25em] font-semibold disabled:opacity-50" style={{ background: "#c8a84b" }}>
                    {submitting ? "Uploading…" : "Submit My Listing →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const CF = ({ label, value, onChange, placeholder, error, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string; type?: string; required?: boolean }) => (
  <div>
    <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 block mb-3">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-transparent border-b outline-none py-3 text-white text-sm placeholder:text-white/20 transition-colors"
      style={{ borderBottomColor: error ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.15)" }} />
    {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
  </div>
);

export default Consign;
