import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/lib/cart";
import { useState, useMemo, type FormEvent } from "react";
import { toast } from "sonner";
import { CalendarClock, Star, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPros, listSlots, createBooking } from "@/lib/scheduling.functions";
import { formatSlotLabel } from "@/lib/slots";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — All in One" },
      { name: "description", content: "Pick your professional and an available time slot to book your services." },
      { property: "og:title", content: "Checkout — All in One" },
      {
        property: "og:description",
        content: "Pick your professional and an available time slot to book your services.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutPage,
});

const CITIES = ["Kolkata", "Delhi NCR", "Mumbai", "Bengaluru", "Hyderabad", "Pune"];

function nextDays(n: number) {
  const out: { value: string; label: string }[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.now() + i * 86400000);
    const value = d.toISOString().slice(0, 10);
    out.push({
      value,
      label: i === 0 ? "Today" : d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }),
    });
  }
  return out;
}

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const fetchPros = useServerFn(listPros);
  const fetchSlots = useServerFn(listSlots);
  const submitBooking = useServerFn(createBooking);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Kolkata");
  const [proId, setProId] = useState("");
  const days = useMemo(() => nextDays(14), []);
  const [date, setDate] = useState(days[0]!.value);
  const [startMin, setStartMin] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const serviceIds = items.map((i) => i.id);
  const durationMin = Math.min(600, Math.max(60, items.reduce((s, i) => s + 60 * i.qty, 0)));

  const prosQ = useQuery({
    queryKey: ["pros", city, serviceIds.join(",")],
    enabled: items.length > 0,
    queryFn: () => fetchPros({ data: { city, serviceIds } }),
  });

  const slotsQ = useQuery({
    queryKey: ["slots", proId, date, durationMin],
    enabled: !!proId,
    queryFn: () => fetchSlots({ data: { proId, date, durationMin } }),
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your cart is empty");
    if (!proId) return toast.error("Please choose a professional");
    if (startMin === null) return toast.error("Please choose a time slot");
    setBusy(true);
    try {
      await submitBooking({
        data: {
          address,
          city,
          proId,
          date,
          startMin,
          notes: notes || undefined,
          items: items.map((i) => ({ service_id: i.id, qty: i.qty })),
        },
      });
      clear();
      toast.success("Booking confirmed!", { description: "Your professional is scheduled." });
      navigate({ to: "/bookings" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm your address, pick a professional, then choose an open time slot.
        </p>

        <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
              <div>
                <label className="text-sm font-medium">Address</label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  placeholder="Flat / Building / Street / Landmark"
                />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setProId("");
                    setStartMin(null);
                  }}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                >
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Choose a professional</p>
              {prosQ.isLoading && <p className="mt-3 text-sm text-muted-foreground">Finding pros near you…</p>}
              {prosQ.data && prosQ.data.length === 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  No professionals available in {city} for these services yet. Try another city.
                </p>
              )}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {prosQ.data?.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProId(p.id);
                      setStartMin(null);
                    }}
                    className={`rounded-xl border p-4 text-left transition ${
                      proId === p.id ? "border-accent bg-accent/5" : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{p.name}</span>
                      {proId === p.id && <CheckCircle2 className="h-4 w-4 text-accent" />}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-current" /> {p.rating} · {p.experience_years} yrs exp
                    </p>
                    {p.bio && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.bio}</p>}
                    {!p.coversAll && (
                      <p className="mt-2 text-[11px] font-medium text-muted-foreground">Covers some of your services</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <CalendarClock className="h-4 w-4" /> Pick a slot
              </p>
              {!proId ? (
                <p className="mt-3 text-sm text-muted-foreground">Choose a professional to see open times.</p>
              ) : (
                <>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                    {days.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => {
                          setDate(d.value);
                          setStartMin(null);
                        }}
                        className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium ${
                          date === d.value ? "border-accent bg-accent/10 text-accent" : "border-border"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  {slotsQ.isLoading && <p className="mt-3 text-sm text-muted-foreground">Checking availability…</p>}
                  {slotsQ.data && slotsQ.data.length === 0 && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      No open slots on this day. Try another date.
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {slotsQ.data?.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setStartMin(m)}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                          startMin === m ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-foreground/30"
                        }`}
                      >
                        {formatSlotLabel(m)}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Estimated duration: {durationMin} min</p>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="Anything the pro should know"
              />
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
            <p className="text-sm font-semibold">Order summary</p>
            <ul className="mt-3 space-y-2 text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span>
                    {i.name} × {i.qty}
                  </span>
                  <span>₹{i.price * i.qty}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm font-semibold">
              <span>Total</span>
              <span>₹{subtotal}</span>
            </div>
            {startMin !== null && (
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })} at{" "}
                {formatSlotLabel(startMin)}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || items.length === 0 || !proId || startMin === null}
              className="mt-5 w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Confirming..." : "Confirm booking"}
            </button>
          </aside>
        </form>
      </section>
    </SiteLayout>
  );
}
