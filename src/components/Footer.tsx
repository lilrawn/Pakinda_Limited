const Footer = () => {
  return (
    <footer id="footer" className="bg-foreground text-background px-6 md:px-12 pt-24 pb-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-20 md:mb-28">
          <span className="uppercase tracking-[0.3em] text-[10px] text-background/50 block mb-6">Pakinda Limited</span>
          <h2 className="font-display text-4xl md:text-7xl leading-[1.05] max-w-4xl mx-auto text-balance">
            Kenya's roads deserve <span className="italic text-steel">extraordinary machines.</span>
          </h2>
          <a href="#fleet" className="inline-flex items-center justify-center bg-background text-foreground px-12 py-5 mt-12 uppercase tracking-[0.25em] text-[10px] font-medium hover:bg-background/85 transition-all duration-500">
            Book a Vehicle
          </a>
        </div>

        <div className="h-px w-full bg-background/15 mb-10" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-20">
          <div>
            <h4 className="font-display text-2xl mb-2">Pakinda Limited</h4>
            <p className="text-background/50 text-sm leading-relaxed">Kenya's premier luxury vehicle hire and private sale platform. Nairobi-based, Kenya-wide.</p>
          </div>
          <div>
            <span className="uppercase tracking-[0.25em] text-[10px] text-background/50 block mb-4">Locations</span>
            <ul className="space-y-2 text-sm">
              <li>Nairobi CBD</li><li>Westlands</li><li>Karen</li><li>Runda</li><li>Upperhill</li>
            </ul>
          </div>
          <div>
            <span className="uppercase tracking-[0.25em] text-[10px] text-background/50 block mb-4">Services</span>
            <ul className="space-y-2 text-sm">
              <li>Luxury Hire</li><li>Private Sales · 2%</li><li>Airport Transfers</li><li>Corporate Fleet</li>
            </ul>
          </div>
          <div>
            <span className="uppercase tracking-[0.25em] text-[10px] text-background/50 block mb-4">Contact</span>
            <ul className="space-y-2 text-sm">
              <li>pakindalimited@gmail.com</li><li>+254 706 504 698</li><li>WhatsApp preferred</li><li>By appointment</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-background/40">
          <span>© {new Date().getFullYear()} Pakinda Limited · Upperhill, Kiambere Road, Nairobi</span>
          <span>Pakinda Limited — Let us pull together</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
