const steps = [
  { n: "I", title: "Browse & Select", body: "Choose from our curated Kenyan fleet — SUVs, luxury saloons, sports cars — or tell us what you need and we will source it." },
  { n: "II", title: "Quick Verification", body: "A brief identity and licence check via WhatsApp. Takes under 10 minutes. No stacks of paperwork." },
  { n: "III", title: "Delivered to You", body: "Your vehicle arrives — driveway, hotel or JKIA  — fully and inspected." },
  { n: "IV", title: "Return & Done", body: "We collect at your convenience. Nothing to think about afterwards." },
];

const Process = () => {
  return (
    <section id="process" className="bg-surface py-32 md:py-48 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-20 md:mb-28">
          <span className="eyebrow block mb-6">Chapter II · How It Works</span>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] max-w-3xl mx-auto text-balance">
            Four steps. <span className="italic text-steel">No unnecessary friction.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {steps.map((s) => (
            <div key={s.n} className="flex flex-col">
              <span className="font-display text-5xl md:text-6xl text-steel/70 italic mb-6">{s.n}</span>
              <div className="hairline mb-6" />
              <h3 className="font-display text-2xl mb-3">{s.title}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {/* M-Pesa badge */}
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
          <div className="border border-foreground/10 px-8 py-4 text-sm text-foreground/60">
            <span className="eyebrow block mb-1">Payments Accepted</span>
            M-Pesa · Visa · Mastercard · Bank Transfer
          </div>
          <div className="border border-foreground/10 px-8 py-4 text-sm text-foreground/60">
            <span className="eyebrow block mb-1">Delivery Areas</span>
            Nairobi
          </div>
          <div className="border border-foreground/10 px-8 py-4 text-sm text-foreground/60">
            <span className="eyebrow block mb-1">Support</span>
            24 / 7 WhatsApp Concierge
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
