import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { categoryImage } from "@/lib/category-images";

export const Route = createFileRoute("/services/")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All services — All in One" },
      { name: "description", content: "Browse all home service categories: salon, cleaning, AC repair, plumbing, electrician and more." },
      { property: "og:title", content: "All services — All in One" },
      { property: "og:description", content: "Browse trusted home service categories in one place." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { q: initialQ } = useSearch({ from: "/services/" });
  const [q, setQ] = useState(initialQ ?? "");

  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort");
      if (error) throw error;
      return data;
    },
  });

  const searchResults = useQuery({
    queryKey: ["service-search", q],
    enabled: q.trim().length > 0,
    queryFn: async () => {
      const term = q.trim();
      const { data, error } = await supabase
        .from("services")
        .select("*, categories(slug, name)")
        .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
        .limit(60);
      if (error) throw error;
      return data;
    },
  });

  const showSearch = q.trim().length > 0;
  const filtered = useMemo(
    () => applyFilters(searchResults.data ?? [], filters),
    [searchResults.data, filters],
  );

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">All services</h1>
          <p className="text-sm text-muted-foreground">Choose a category or search for a specific service.</p>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 shadow-sm">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search services..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {showSearch ? (
          <div className="mt-10">
            <h2 className="text-lg font-semibold">Results for "{q}"</h2>
            {searchResults.isLoading && <p className="mt-4 text-sm text-muted-foreground">Searching...</p>}
            {searchResults.data && searchResults.data.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">No services matched. Try a different search.</p>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.data?.map((s) => (
                <ServiceMiniCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {cats.isLoading && Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
            ))}
            {cats.data?.map((c) => (
              <Link
                key={c.id}
                to="/services/$category"
                params={{ category: c.slug }}
                className="group overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img
                    src={categoryImage(c.slug, c.image_url)}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm font-medium">{c.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function ServiceMiniCard({ service }: { service: any }) {
  return (
    <Link
      to="/service/$id"
      params={{ id: service.id }}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-[var(--shadow-hover)]"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {service.image_url && <img src={service.image_url} alt={service.name} className="h-full w-full object-cover" />}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground">{service.categories?.name}</p>
        <p className="mt-1 text-sm font-semibold">{service.name}</p>
        <p className="mt-2 text-sm">₹{service.price} <span className="text-xs text-muted-foreground line-through ml-1">₹{service.original_price}</span></p>
      </div>
    </Link>
  );
}
