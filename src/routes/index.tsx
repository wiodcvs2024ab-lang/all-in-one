import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  BadgeCheck,
  Sparkles,
  ChevronRight,
  Smartphone,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";

import heroImg from "@/assets/hero-salon.jpg";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AiRecommender } from "@/components/site/AiRecommender";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "All in One — Home Services at Your Doorstep" },
      {
        name: "description",
        content:
          "Book trusted salon, massage, cleaning, AC repair, plumbing and electrician services at home. Verified professionals, upfront prices, on-time service.",
      },
      { property: "og:title", content: "All in One — Home Services at Your Doorstep" },
      {
        property: "og:description",
        content:
          "Book trusted salon, massage, cleaning, AC repair, plumbing and electrician services at home. Verified professionals, upfront prices, on-time service.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const quickChips = ["Salon for women", "Massage for men", "AC service", "Bathroom cleaning", "Electrician"];

const trust = [
  { icon: BadgeCheck, title: "Verified professionals", text: "Background-checked, trained experts in your area." },
  { icon: ShieldCheck, title: "Safe & hygienic", text: "Sanitised tools, disposable kits and safe chemicals." },
  { icon: Clock, title: "On-time, every time", text: "Arrive on schedule or your booking is on us." },
  { icon: Sparkles, title: "Upfront pricing", text: "See exact prices before you book. No surprises." },
];

const testimonials = [
  { name: "Ananya D.", area: "Salt Lake, Kolkata", text: "Booked a facial on Sunday morning and the therapist reached in 45 minutes. Super professional and hygienic." },
  { name: "Rohan M.", area: "New Town, Kolkata", text: "The AC service was thorough — even cleaned the outdoor unit. Cooling is like new." },
  { name: "Priyanka S.", area: "Ballygunge, Kolkata", text: "Deep cleaning team was on time, polite and the house was spotless in a few hours." },
];

function Index() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function onSearch(e?: FormEvent) {
    e?.preventDefault();
    navigate({ to: "/services", search: { q: q.trim() } as never });
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-foreground/70 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Now serving across major cities
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Home services,
              <br />
              <span className="text-accent">on your schedule.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-foreground/70 sm:text-lg">
              Book beauticians, massage therapists, cleaners and technicians — all verified, all trained, at fair upfront prices.
            </p>

            <form
              onSubmit={onSearch}
              className="mt-8 flex items-center gap-2 rounded-2xl border border-border bg-background p-2 shadow-[var(--shadow-card)]"
            >
              <div className="hidden items-center gap-2 border-r border-border pl-2 pr-3 text-sm text-foreground/80 sm:flex">
                <MapPin className="h-4 w-4 text-accent" />
                Kolkata
              </div>
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground sm:text-base"
                  placeholder="What are you looking for?"
                />
              </div>
              <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90">
                Search
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {quickChips.map((c) => (
                <Link
                  key={c}
                  to="/services"
                  search={{ q: c } as never}
                  className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:border-accent hover:text-accent"
                >
                  {c}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-foreground/70">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
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
              <img src={heroImg} alt="Beautician giving a facial at home" width={1400} height={1000} className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden max-w-[220px] rounded-2xl border border-border bg-background p-4 shadow-[var(--shadow-card)] sm:block">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Verified & trained
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Every professional is background-checked and rated by real customers.</p>
            </div>
            <div className="absolute -right-4 top-8 hidden rounded-2xl border border-border bg-background px-4 py-3 shadow-[var(--shadow-card)] md:block">
              <p className="text-xs text-muted-foreground">Starting at</p>
              <p className="text-lg font-semibold">₹499</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA to services page */}
      <AiRecommender />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">What are you looking for?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Explore all our service categories.</p>
          </div>
          <Link to="/services" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            Browse all services <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-secondary/50 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {trust.map((t) => (
            <div key={t.title} className="rounded-2xl border border-border bg-card p-6">
              <t.icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 text-base font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Loved by customers</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-3 text-sm text-foreground/80">"{t.text}"</blockquote>
              <figcaption className="mt-4 text-sm font-medium">
                {t.name} <span className="font-normal text-muted-foreground">· {t.area}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Pro CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Are you a service professional?</h2>
            <p className="mt-2 max-w-xl text-sm opacity-80">
              Join thousands of vetted pros earning steady income with All in One.
            </p>
          </div>
          <Link
            to="/pros"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
          >
            <Smartphone className="h-4 w-4" /> Register as a Pro
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
