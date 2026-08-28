import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Star, Clock, ChevronLeft, Plus } from "lucide-react";
import { useCart } from "@/lib/cart";
import { categoryImage } from "@/lib/category-images";
import { toast } from "sonner";

export const Route = createFileRoute("/services/$category")({
  head: ({ params }) => ({
    meta: [
      { title: `${titleize(params.category)} — All in One` },
      { name: "description", content: `Book ${titleize(params.category).toLowerCase()} services at home with verified professionals and upfront pricing.` },
      { property: "og:title", content: `${titleize(params.category)} — All in One` },
      { property: "og:description", content: `Book ${titleize(params.category).toLowerCase()} services at home.` },
    ],
  }),
  component: CategoryPage,
});

function titleize(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function CategoryPage() {
  const { category } = Route.useParams();
  const { add } = useCart();
  const [filters, setFilters] = useState<Filters>(defaultFilters);


  const q = useQuery({
    queryKey: ["category", category],
    queryFn: async () => {
      const { data: cat, error: e1 } = await supabase.from("categories").select("*").eq("slug", category).maybeSingle();
      if (e1) throw e1;
      if (!cat) throw notFound();
      const { data: services, error: e2 } = await supabase.from("services").select("*").eq("category_id", cat.id).order("price");
      if (e2) throw e2;
      return { cat, services };
    },
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/services" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> All services
        </Link>

        {q.isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading...</p>}
        {q.data && (
          <>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{q.data.cat.name}</h1>
                {q.data.cat.description && <p className="mt-1 text-sm text-muted-foreground">{q.data.cat.description}</p>}
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
            <ServiceFilters value={filters} onChange={setFilters} resultCount={filtered.length} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground">No services match your filters.</p>
              )}
              {filtered.map((s) => (
                <article key={s.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-[var(--shadow-hover)]">
                  <Link to="/service/$id" params={{ id: s.id }} className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={s.image_url || categoryImage(category)}
                      alt={s.name}
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = categoryImage(category); }}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    {s.tag && <span className="mb-2 w-fit rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">{s.tag}</span>}
                    <Link to="/service/$id" params={{ id: s.id }} className="text-base font-semibold hover:text-accent">{s.name}</Link>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-current text-accent" /> {Number(s.rating).toFixed(1)}</span>
                      <span>·</span>
                      <span>{s.reviews_count.toLocaleString()} reviews</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration_min}m</span>
                    </div>
                    <p className="mt-2 text-sm">{s.description}</p>
                    <div className="mt-auto flex items-end justify-between pt-4">
                      <div>
                        <span className="text-lg font-semibold">₹{s.price}</span>
                        {s.original_price && <span className="ml-2 text-xs text-muted-foreground line-through">₹{s.original_price}</span>}
                      </div>
                      <button
                        onClick={() => {
                          add({ id: s.id, name: s.name, price: s.price, image_url: s.image_url });
                          toast.success("Added to cart", { description: s.name });
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-accent bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-accent-foreground"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
