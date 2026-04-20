# Pakinda Limited 🇰🇪
### Kenya's Premier Luxury Car Hire & Private Sales Platform

Built with React + TypeScript + Vite + Tailwind CSS + Three.js

---

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```

---

## Features

### 🚗 Luxury Fleet (9 vehicles)
- Mercedes S 580 · Range Rover Autobiography · Porsche Cayenne Turbo · Bentley Bentayga · BMW 760i · Lamborghini Urus S · Mercedes-AMG G 63 · Rolls-Royce Ghost · Tesla Model S Plaid
- Filter by: Luxury · SUV · Sports · Executive
- All prices in **KES**

### 📅 Booking with Calendar & Live Pricing
- Click any car → "Book This Vehicle"
- Date-range picker: select start + end dates
- Total price updates live (days × KES daily rate)
- Enter name, WhatsApp, email → confirm
- No payment upfront — team confirms within 2 hours

### 🏷️ Sell Your Car — 2% Commission
- Full consignment form with validation
- WhatsApp shortcut to a specialist
- Stats: 2% flat fee · 14 avg. days · 800+ vetted buyers

### 🇰🇪 Kenyan Context
- M-Pesa, WhatsApp, card payments
- Delivery: Nairobi · Mombasa · Kisumu · Nakuru
- Kenyan phone format (+254), .co.ke email

---

## Customise

| What | Where |
|---|---|
| Car prices (KES) | `src/data/fleet.ts` → `pricePerDay` |
| Add a new car | `src/data/fleet.ts` → add to `fleet` array |
| Gold accent colour | `src/index.css` → `--steel` |
| WhatsApp number | Search `254706504698` in `Consign.tsx` |
| Contact email | `src/components/Footer.tsx` |

---

## Project Structure

```
src/
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── BookingModal.tsx      # ← Calendar + pricing + booking
│   ├── CarViewer.tsx         # ← Three.js 3D car (procedural)
│   ├── Consign.tsx           # ← Sell your car form
│   ├── Fleet.tsx             # ← Car grid + category filters
│   ├── Hero.tsx · Navbar.tsx · Process.tsx · Footer.tsx
│   └── IntroAnimation.tsx    # ← Cinematic session intro
├── data/fleet.ts             # 9 Kenyan-priced car records
├── pages/
│   ├── Index.tsx             # Homepage
│   ├── FleetDetail.tsx       # Car detail + Book button
│   └── NotFound.tsx
├── index.css                 # Tailwind + all design tokens
└── main.tsx
```

*Pakinda Limited · Nairobi, Kenya · Pakinda Limited — Let us pull together*
