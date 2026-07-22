import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { BadgeCheck, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/pros")({
  head: () => ({
    meta: [
      { title: "Register as a Pro — All in One" },
      { name: "description", content: "Join thousands of service professionals earning steady income on All in One." },
      { property: "og:title", content: "Register as a Pro — All in One" },
      { property: "og:description", content: "Apply to become a verified service professional on All in One." },
    ],
  }),
  component: ProsPage,
});

function ProsPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "Kolkata", skills: "", experience_years: 0 });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from("pro_applications").insert(form);
      if (error) throw error;
      setDone(true);
      toast.success("Application received!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-tight">Grow your services business</h1>
          <p className="mt-3 max-w-2xl text-sm opacity-80">Join All in One and get consistent, high-quality bookings from customers in your area.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Users, title: "6M+ customers", text: "Access a large, active customer base." },
              { icon: TrendingUp, title: "Higher earnings", text: "Fair pricing and transparent payouts." },
              { icon: BadgeCheck, title: "Free training", text: "Get certified and grow your skills." },
            ].map((t) => (
              <div key={t.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <t.icon className="h-6 w-6 text-accent" />
                <p className="mt-3 font-semibold">{t.title}</p>
                <p className="mt-1 text-xs opacity-80">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">Apply now</h2>
        {done ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center">
            <BadgeCheck className="mx-auto h-10 w-10 text-accent" />
            <p className="mt-3 text-lg font-semibold">Thanks! We received your application.</p>
            <p className="mt-1 text-sm text-muted-foreground">Our team will reach out within 2 business days.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
            {[
              { key: "name", label: "Full name", type: "text" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Phone", type: "tel" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm font-medium">{f.label}</label>
                <input
                  required
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">City</label>
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                >
                  {["Kolkata", "Delhi NCR", "Mumbai", "Bengaluru", "Hyderabad", "Pune"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Years of experience</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={form.experience_years}
                  onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Skills / services you offer</label>
              <textarea
                required
                rows={3}
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="e.g. AC repair, split & window units, gas refill"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Submitting..." : "Submit application"}
            </button>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}
