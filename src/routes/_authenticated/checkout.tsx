import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — All in One" },
      { name: "description", content: "Confirm address and time slot to book your services." },
      { property: "og:title", content: "Checkout — All in One" },
      { property: "og:description", content: "Confirm address and time slot to book your services." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Kolkata");
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setBusy(true);
    try {
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          address,
          city,
          slot_at: new Date(slot).toISOString(),
          subtotal,
          notes: notes || null,
          status: "confirmed",
        })
        .select()
        .single();
      if (error) throw error;

      const { error: itemsErr } = await supabase.from("booking_items").insert(
        items.map((i) => ({
          booking_id: booking.id,
          service_id: i.id,
          service_name: i.name,
          price: i.price,
          qty: i.qty,
        })),
      );
      if (itemsErr) throw itemsErr;

      clear();
      toast.success("Booking confirmed!", { description: "A pro will be at your doorstep shortly." });
      navigate({ to: "/bookings" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  const minSlot = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">Confirm your address and preferred time slot.</p>

        <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
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
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {["Kolkata", "Delhi NCR", "Mumbai", "Bengaluru", "Hyderabad", "Pune"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2"><CalendarClock className="h-4 w-4" /> Preferred slot</label>
              <input
                required
                type="datetime-local"
                min={minSlot}
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
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

          <aside className="h-fit rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Order summary</p>
            <ul className="mt-3 space-y-2 text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span>{i.name} × {i.qty}</span>
                  <span>₹{i.price * i.qty}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm font-semibold">
              <span>Total</span><span>₹{subtotal}</span>
            </div>
            <button
              type="submit"
              disabled={busy || items.length === 0}
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
