import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CalendarClock, MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({
    meta: [
      { title: "My bookings — All in One" },
      { name: "description", content: "See your upcoming and past service bookings." },
      { property: "og:title", content: "My bookings — All in One" },
      { property: "og:description", content: "See your upcoming and past service bookings." },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, booking_items(*)")
        .order("slot_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">My bookings</h1>

        {q.isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading...</p>}
        {q.data && q.data.length === 0 && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-lg font-medium">No bookings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Book a service to see it here.</p>
            <Link to="/services" className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Browse services
            </Link>
          </div>
        )}

        <ul className="mt-6 space-y-4">
          {q.data?.map((b) => (
            <li key={b.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold flex items-center gap-2"><CalendarClock className="h-4 w-4" /> {new Date(b.slot_at).toLocaleString()}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {b.address}, {b.city}</p>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent capitalize">{b.status}</span>
              </div>
              <ul className="mt-4 space-y-1 text-sm">
                {b.booking_items?.map((i: any) => (
                  <li key={i.id} className="flex justify-between text-muted-foreground">
                    <span>{i.service_name} × {i.qty}</span>
                    <span>₹{i.price * i.qty}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold">
                <span>Total</span><span>₹{b.subtotal}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </SiteLayout>
  );
}
