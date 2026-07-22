import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Star, Clock, ChevronLeft, ShieldCheck, BadgeCheck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/service/$id")({
  head: () => ({
    meta: [
      { title: "Service details — All in One" },
      { name: "description", content: "See service details, pricing and book with a verified professional." },
      { property: "og:title", content: "Service details — All in One" },
      { property: "og:description", content: "See service details, pricing and book with a verified professional." },
    ],
  }),
  component: ServicePage,
});

function ServicePage() {
  const { id } = Route.useParams();
  const { add } = useCart();
  const navigate = useNavigate();

  const q = useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*, categories(slug, name)").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/services" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>

        {q.isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading...</p>}
        {q.data && (
          <div className="mt-4 grid gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-muted">
              {q.data.image_url && <img src={q.data.image_url} alt={q.data.name} className="h-full w-full object-cover" />}
            </div>
            <div>
              {q.data.categories && (
                <Link to="/services/$category" params={{ category: q.data.categories.slug }} className="text-sm text-accent hover:underline">
                  {q.data.categories.name}
                </Link>
              )}
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{q.data.name}</h1>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-current text-accent" /> {Number(q.data.rating).toFixed(1)}</span>
                <span>· {q.data.reviews_count.toLocaleString()} reviews</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {q.data.duration_min} min</span>
              </div>
              <p className="mt-4 text-sm text-foreground/80">{q.data.description}</p>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-semibold">₹{q.data.price}</span>
                {q.data.original_price && <span className="text-sm text-muted-foreground line-through">₹{q.data.original_price}</span>}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    add({ id: q.data.id, name: q.data.name, price: q.data.price, image_url: q.data.image_url });
                    toast.success("Added to cart", { description: q.data.name });
                  }}
                  className="rounded-full border border-accent bg-accent/5 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  Add to cart
                </button>
                <button
                  onClick={() => {
                    add({ id: q.data.id, name: q.data.name, price: q.data.price, image_url: q.data.image_url });
                    navigate({ to: "/cart" });
                  }}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Book now
                </button>
              </div>

              <ul className="mt-8 space-y-3 text-sm">
                <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-accent" /> Verified & trained professional</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-accent" /> Sanitised tools & safe chemicals</li>
                <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 text-accent" /> On-time or your booking is on us</li>
              </ul>
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
