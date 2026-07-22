import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Sparkles, Users, Shield, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us — All in One" },
      { name: "description", content: "All in One is on a mission to make home services trustworthy, convenient and delightful." },
      { property: "og:title", content: "About us — All in One" },
      { property: "og:description", content: "Our story, mission and values." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight">About All in One</h1>
        <p className="mt-4 text-base text-foreground/80">
          All in One is India's trusted home services marketplace. From a quick haircut to a full-home deep clean, we connect you with verified, trained professionals who care about doing the job right.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {[
            { icon: Sparkles, title: "Our mission", text: "Make quality home services accessible, convenient and affordable for every household." },
            { icon: Users, title: "6M+ customers", text: "Served across India with an average rating of 4.8 out of 5." },
            { icon: Shield, title: "Trust & safety", text: "Every pro is background-checked and trained on hygiene and etiquette." },
            { icon: Award, title: "Fair for pros", text: "We help thousands of pros earn a steady income with transparent payouts." },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
              <c.icon className="h-6 w-6 text-accent" />
              <p className="mt-3 font-semibold">{c.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  ),
});
