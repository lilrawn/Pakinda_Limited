import car1 from "@/assets/car-1.png";
import car2 from "@/assets/car-2.png";
import car3 from "@/assets/car-3.png";

export type Category = "Luxury" | "SUV" | "Sports" | "Executive";

export const categories: ("All" | Category)[] = ["All", "Luxury", "SUV", "Sports", "Executive"];

export interface Car {
  id: string;
  slug: string;
  name: string;
  series: string;
  category: Category;
  image: string;
  spec: { hp: string; top: string; zero: string };
  pricePerDay: number; // in KES
  price: string; // display string
  description: string;
  features: string[];
}

export const fleet: Car[] = [
  {
    id: "001",
    slug: "mercedes-s-class",
    name: "Mercedes-Benz S 580",
    series: "S-Class · W223",
    category: "Luxury",
    image: car1,
    spec: { hp: "496 hp", top: "250 km/h", zero: "4.4 s" },
    pricePerDay: 45000,
    price: "KES 45,000",
    description: "The pinnacle of German engineering. Glide through Nairobi in absolute silence, wrapped in Nappa leather and surrounded by the finest technology money can buy.",
    features: ["Chauffeur available", "Nairobi CBD delivery", "Full insurance included", "24/7 concierge"],
  },
  {
    id: "002",
    slug: "range-rover-autobiography",
    name: "Range Rover Autobiography",
    series: "L460 · Long Wheelbase",
    category: "SUV",
    image: car2,
    spec: { hp: "530 hp", top: "250 km/h", zero: "5.1 s" },
    pricePerDay: 55000,
    price: "KES 55,000",
    description: "Command the roads of Kenya — from Westlands to the Mara. The Autobiography is built for both the boardroom and the bush.",
    features: ["Safari-ready", "Nairobi & Mombasa delivery", "Full insurance", "Private driver option"],
  },
  {
    id: "003",
    slug: "porsche-cayenne-turbo",
    name: "Porsche Cayenne Turbo",
    series: "Cayenne · E3 Phase II",
    category: "Sports",
    image: car3,
    spec: { hp: "650 hp", top: "286 km/h", zero: "3.7 s" },
    pricePerDay: 60000,
    price: "KES 60,000",
    description: "Pure Porsche performance, tamed for everyday driving. Perfect for the executive who refuses to compromise between speed and practicality.",
    features: ["Sport Chrono package", "Nairobi delivery", "Full insurance", "GPS tracking"],
  },
  {
    id: "004",
    slug: "bentley-bentayga",
    name: "Bentley Bentayga",
    series: "Bentayga · Speed",
    category: "SUV",
    image: car1,
    spec: { hp: "626 hp", top: "306 km/h", zero: "3.9 s" },
    pricePerDay: 85000,
    price: "KES 85,000",
    description: "The world's finest SUV, now available on Kenyan roads. Handcrafted at Crewe, delivered to your doorstep in Nairobi.",
    features: ["Nairobi & Mombasa delivery", "Dedicated specialist", "Full insurance", "Chauffeur available"],
  },
  {
    id: "005",
    slug: "bmw-7-series",
    name: "BMW 760i xDrive",
    series: "7 Series · G70",
    category: "Executive",
    image: car2,
    spec: { hp: "544 hp", top: "250 km/h", zero: "4.0 s" },
    pricePerDay: 38000,
    price: "KES 38,000",
    description: "Executive transport redefined. The 7 Series sets the standard for business travel across Nairobi's elite corridors.",
    features: ["Executive rear seat", "Airport transfers", "Full insurance", "WiFi hotspot"],
  },
  {
    id: "006",
    slug: "lamborghini-urus",
    name: "Lamborghini Urus S",
    series: "Urus · Performante",
    category: "Sports",
    image: car3,
    spec: { hp: "666 hp", top: "306 km/h", zero: "3.5 s" },
    pricePerDay: 120000,
    price: "KES 120,000",
    description: "Kenya's most exclusive hire. The Urus S commands attention from Karen to Kilimani. Not for the faint-hearted.",
    features: ["Weekend specials available", "Nairobi only", "Full insurance", "Professional handover"],
  },
  {
    id: "007",
    slug: "mercedes-amg-g63",
    name: "Mercedes-AMG G 63",
    series: "G-Wagen · W464",
    category: "SUV",
    image: car1,
    spec: { hp: "585 hp", top: "220 km/h", zero: "4.5 s" },
    pricePerDay: 75000,
    price: "KES 75,000",
    description: "An icon on any terrain. Whether it's Muthaiga or the Maasai Mara, the G 63 is unmistakable and unstoppable.",
    features: ["Off-road capable", "Kenya-wide delivery", "Full insurance", "Satellite phone"],
  },
  {
    id: "008",
    slug: "rolls-royce-ghost",
    name: "Rolls-Royce Ghost",
    series: "Ghost · Series II",
    category: "Luxury",
    image: car2,
    spec: { hp: "563 hp", top: "250 km/h", zero: "4.8 s" },
    pricePerDay: 150000,
    price: "KES 150,000",
    description: "The ultimate statement of arrival. Perfect for weddings, corporate events, and occasions where only the finest will do.",
    features: ["Chauffeur mandatory", "White-glove delivery", "Full insurance", "Event packages"],
  },
  {
    id: "009",
    slug: "tesla-model-s",
    name: "Tesla Model S Plaid",
    series: "Model S · Plaid",
    category: "Executive",
    image: car3,
    spec: { hp: "1,020 hp", top: "322 km/h", zero: "2.1 s" },
    pricePerDay: 35000,
    price: "KES 35,000",
    description: "The future of Nairobi transport. Zero emissions, unlimited performance. Charged and ready for Kenya's green generation.",
    features: ["Supercharger access", "Nairobi delivery", "Full insurance", "Autopilot enabled"],
  },
];
