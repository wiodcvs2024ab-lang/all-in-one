import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  MapPin,
  ShoppingCart,
  Star,
  ShieldCheck,
  Clock,
  BadgeCheck,
  Sparkles,
  ChevronRight,
  Smartphone,
} from "lucide-react";

import heroImg from "@/assets/hero-salon.jpg";
import catSalonWomen from "@/assets/cat-salon-women.jpg";
import catSalonMen from "@/assets/cat-salon-men.jpg";
import catMassage from "@/assets/cat-massage.jpg";
import catAc from "@/assets/cat-ac.jpg";
import catCleaning from "@/assets/cat-cleaning.jpg";
import catElectrician from "@/assets/cat-electrician.jpg";
import catPlumber from "@/assets/cat-plumber.jpg";
import catPainting from "@/assets/cat-painting.jpg";
import catPest from "@/assets/cat-pest.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "All in One Kolkata — Home Services at Your Doorstep" },
      {
        name: "description",
        content:
          "Book trusted salon, massage, cleaning, AC repair, plumbing and electrician services at home in Kolkata. Verified professionals, upfront prices, on-time service.",
      },
      { property: "og:title", content: "All in One Kolkata — Home Services at Your Doorstep" },
      {
        property: "og:description",
        content:
          "Salon at home, massage, cleaning, appliance repair and more. Trusted professionals across Kolkata.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const categories = [
  { name: "Women's Salon & Spa", img: catSalonWomen },
  { name: "Men's Salon & Massage", img: catSalonMen },
  { name: "Massage for Men", img: catMassage },
  { name: "AC & Appliance Repair", img: catAc },
  { name: "Cleaning & Pest Control", img: catCleaning },
  { name: "Electrician", img: catElectrician },
  { name: "Plumber", img: catPlumber },
  { name: "Painting & Waterproofing", img: catPainting },
];

const popularServices = [
  {
    name: "Classic Facial (Fruit)",
    price: 649,
    original: 899,
    rating: 4.82,
    reviews: "1.2M",
    duration: "60 mins",
    img: catSalonWomen,
    tag: "Bestseller",
  },
  {
    name: "Full Home Deep Cleaning",
    price: 2499,
    original: 3499,
    rating: 4.79,
    reviews: "480K",
    duration: "5 hrs",
    img: catCleaning,
    tag: "Most booked",
  },
  {
    name: "AC Service — Power Saver",
    price: 599,
    original: 799,
    rating: 4.85,
    reviews: "930K",
    duration: "60 mins",
    img: catAc,
    tag: "Summer offer",
  },
  {
    name: "Stress Relief Massage (Men)",
    price: 1299,
    original: 1699,
    rating: 4.88,
    reviews: "210K",
    duration: "90 mins",
    img: catMassage,
    tag: "New",
  },
];

const quickChips = [
  "Salon for women",
  "Massage for men",
  "AC service",
  "Bathroom cleaning",
  "Electrician",
];

const trust = [
  {
    icon: BadgeCheck,
    title: "Verified professionals",
    text: "Background-checked, trained experts in your area.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & hygienic",
    text: "Sanitised tools, disposable kits and safe chemicals.",
  },
  {
    icon: Clock,
    title: "On-time, every time",
    text: "Arrive on schedule or your booking is on us.",
  },
  {
    icon: Sparkles,
    title: "Upfront pricing",
    text: "See exact prices before you book. No surprises.",
  },
];

const testimonials = [
  {
    name: "Ananya D.",
    area: "Salt Lake, Kolkata",
    text: "Booked a facial on Sunday morning and the therapist reached in 45 minutes. Super professional and hygienic.",
  },
  {
    name: "Rohan M.",
    area: "New Town, Kolkata",
    text: "The AC service was thorough — even cleaned the outdoor unit. Cooling is like new.",
  },
  {
    name: "Priyanka S.",
    area: "Ballygunge, Kolkata",
    text: "Deep cleaning team was on time, polite and the house was spotless in a few hours.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <CategoryGrid />
      <PopularServices />
      <TrustStrip />
      <Testimonials />
      <AppCta />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">All in One</span>
        </a>

        <button className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-foreground/40 md:inline-flex">
          <MapPin className="h-4 w-4" />
          Kolkata
          <ChevronRight className="h-4 w-4 rotate-90" />
        </button>

        <div className="ml-auto hidden flex-1 max-w-md items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 md:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search for 'AC service'"
          />
        </div>

        <nav className="ml-auto flex items-center gap-2 md:ml-0">
          <button className="hidden text-sm font-medium text-foreground/80 hover:text-foreground sm:inline-flex">
            Login
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary">
            <ShoppingCart className="h-4 w-4" />
            Cart
          </button>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-foreground/70 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Now serving across Kolkata
          </p>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Home services,
            <br />
            <span className="text-accent">on your schedule.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-foreground/70 sm:text-lg">
            Book beauticians, massage therapists, cleaners and technicians — all verified, all
            trained, all at fair, upfront prices.
          </p>

          <div className="mt-8 flex items-center gap-2 rounded-2xl border border-border bg-background p-2 shadow-[var(--shadow-card)]">
            <div className="hidden items-center gap-2 border-r border-border pl-2 pr-3 text-sm text-foreground/80 sm:flex">
              <MapPin className="h-4 w-4 text-accent" />
              Kolkata
            </div>
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground sm:text-base"
                placeholder="What are you looking for?"
              />
            </div>
            <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90">
              Search
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {quickChips.map((c) => (
              <button
                key={c}
                className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:border-accent hover:text-accent"
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-6 text-sm text-foreground/70">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-accent">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
              <span className="font-medium text-foreground">4.8</span>
              <span>· 12M+ reviews</span>
            </div>
            <span className="hidden h-4 w-px bg-border sm:block" />
            <span className="hidden sm:inline">6M+ happy customers</span>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl shadow-[var(--shadow-hover)]">
            <img
              src={heroImg}
              alt="Beautician giving a facial at home"
              width={1400}
              height={1000}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden max-w-[220px] rounded-2xl border border-border bg-background p-4 shadow-[var(--shadow-card)] sm:block">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Verified & trained
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Every professional is background-checked and rated by real customers.
            </p>
          </div>
          <div className="absolute -right-4 top-8 hidden rounded-2xl border border-border bg-background px-4 py-3 shadow-[var(--shadow-card)] md:block">
            <p className="text-xs text-muted-foreground">Starting at</p>
            <p className="text-lg font-semibold">₹499</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            What are you looking for?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore top service categories in Kolkata.
          </p>
        </div>
        <a href="#" className="hidden text-sm font-medium text-accent hover:underline sm:inline">
          See all
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((c) => (
          <a
            key={c.name}
            href="#"
            className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
              <img
                src={c.img}
                alt={c.name}
                width={600}
                height={450}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm font-medium">{c.name}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function PopularServices() {
  return (
    <section className="bg-secondary/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Most booked this week
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Loved by thousands of customers across the city.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popularServices.map((s) => (
            <article
              key={s.name}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={s.img}
                  alt={s.name}
                  width={600}
                  height={450}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
                  {s.tag}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-semibold leading-snug">{s.name}</h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span className="font-medium text-foreground">{s.rating}</span>
                  <span>({s.reviews})</span>
                  <span>·</span>
                  <span>{s.duration}</span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-base font-semibold">₹{s.price}</p>
                    <p className="text-xs text-muted-foreground line-through">
                      ₹{s.original}
                    </p>
                  </div>
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-accent hover:text-accent">
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {trust.map((t) => (
          <div key={t.title} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-accent">
              <t.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold">{t.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-secondary/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            What Kolkata is saying
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Real reviews from real customers this month.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">"{t.text}"</p>
              <footer className="mt-4 text-xs">
                <span className="font-medium">{t.name}</span>
                <span className="text-muted-foreground"> · {t.area}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function AppCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl bg-primary px-8 py-12 text-primary-foreground sm:px-12 sm:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium">
              <Smartphone className="h-3.5 w-3.5" />
              Get the app
            </p>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Book faster. Track your professional in real time.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-primary-foreground/70">
              Manage bookings, chat with your expert, and pay securely — all from one app.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-4 py-2.5 text-sm font-medium text-primary hover:opacity-90"
              >
                App Store
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/30 px-4 py-2.5 text-sm font-medium hover:bg-primary-foreground/10"
              >
                Google Play
              </a>
            </div>
          </div>
          <div className="hidden justify-end lg:flex">
            <div className="grid grid-cols-2 gap-3">
              <img
                src={catPest}
                alt=""
                width={300}
                height={300}
                loading="lazy"
                className="h-40 w-40 rounded-2xl object-cover"
              />
              <img
                src={catPlumber}
                alt=""
                width={300}
                height={300}
                loading="lazy"
                className="mt-8 h-40 w-40 rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    {
      title: "Company",
      links: ["About us", "Careers", "Press", "Blog"],
    },
    {
      title: "For customers",
      links: ["Categories", "Reviews", "Help & Support", "Safety"],
    },
    {
      title: "For professionals",
      links: ["Register as a pro", "Partner login", "Training"],
    },
    {
      title: "Cities",
      links: ["Kolkata", "Delhi NCR", "Mumbai", "Bengaluru", "Hyderabad"],
    },
  ];
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">All in One</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Home services at your doorstep. Trusted professionals across India.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-foreground">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} All in One. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
