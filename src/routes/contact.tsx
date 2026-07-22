import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — All in One" },
      { name: "description", content: "Get in touch with the All in One team — we'd love to hear from you." },
      { property: "og:title", content: "Contact us — All in One" },
      { property: "og:description", content: "Reach the All in One team by email, phone or the contact form." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from("contact_messages").insert(form);
      if (error) throw error;
      toast.success("Message sent!", { description: "We'll get back to you shortly." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight">Contact us</h1>
        <p className="mt-2 text-sm text-muted-foreground">We usually respond within a business day.</p>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_2fr]">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-accent" /><div><p className="font-semibold">Email</p><p className="text-muted-foreground">hello@allinone.example</p></div></div>
            <div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 text-accent" /><div><p className="font-semibold">Phone</p><p className="text-muted-foreground">+91 90000 00000</p></div></div>
            <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-accent" /><div><p className="font-semibold">Office</p><p className="text-muted-foreground">Salt Lake, Kolkata, India</p></div></div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
            </div>
            <button type="submit" disabled={busy} className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {busy ? "Sending..." : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
