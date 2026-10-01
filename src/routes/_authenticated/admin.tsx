import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/lib/roles";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, EyeOff, Eye } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — All in One" },
      { name: "description", content: "Manage categories, services, bookings, reviews and pro applications." },
      { property: "og:title", content: "Admin dashboard — All in One" },
      {
        property: "og:description",
        content: "Manage categories, services, bookings, reviews and pro applications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const TABS = ["Bookings", "Applications", "Services", "Categories", "Reviews"] as const;
const STATUSES = ["pending", "confirmed", "on_the_way", "in_progress", "completed", "cancelled"];

function AdminPage() {
  const { isAdmin, loading } = useRoles();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Bookings");

  if (loading) {
    return (
      <SiteLayout>
        <p className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">Checking access…</p>
      </SiteLayout>
    );
  }
  if (!isAdmin) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">This account doesn't have admin access.</p>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">Admin dashboard</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                tab === t ? "border-accent bg-accent/10 text-accent" : "border-border"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-8">
          {tab === "Bookings" && <BookingsTab />}
          {tab === "Applications" && <ApplicationsTab />}
          {tab === "Services" && <ServicesTab />}
          {tab === "Categories" && <CategoriesTab />}
          {tab === "Reviews" && <ReviewsTab />}
        </div>
      </section>
    </SiteLayout>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-5">{children}</div>;
}

function BookingsTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const bookingsQ = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, booking_items(*)")
        .order("slot_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const prosQ = useQuery({
    queryKey: ["admin-pros"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pros").select("id, name, city").order("name");
      if (error) throw error;
      return data;
    },
  });

  async function update(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from("bookings").update(patch as never).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Booking updated");
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  }

  const rows = (bookingsQ.data ?? []).filter((b) => filter === "all" || b.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs capitalize ${
              filter === s ? "border-accent text-accent" : "border-border text-muted-foreground"
            }`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>
      {rows.map((b) => (
        <Card key={b.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{new Date(b.slot_at).toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {b.address}, {b.city} · ₹{b.subtotal} · {b.duration_min} min · payment {b.payment_status}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={b.pro_id ?? ""}
                onChange={(e) => update(b.id, { pro_id: e.target.value || null })}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
              >
                <option value="">Unassigned</option>
                {prosQ.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
              <select
                value={b.status}
                onChange={(e) => update(b.id, { status: e.target.value })}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs capitalize"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {b.booking_items?.map((i: { id: string; service_name: string; qty: number; price: number }) => (
              <li key={i.id}>
                {i.service_name} × {i.qty} — ₹{i.price * i.qty}
              </li>
            ))}
          </ul>
        </Card>
      ))}
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No bookings for this filter.</p>}
    </div>
  );
}

function ApplicationsTab() {
  const qc = useQueryClient();
  const appsQ = useQuery({
    queryKey: ["admin-apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pro_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function approve(a: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    skills: string;
    experience_years: number;
  }) {
    const { error: pErr } = await supabase.from("pros").insert({
      name: a.name,
      email: a.email,
      phone: a.phone,
      city: a.city,
      skills: a.skills,
      experience_years: a.experience_years,
      active: true,
    });
    if (pErr) return toast.error(pErr.message);
    const { error } = await supabase.from("pro_applications").update({ status: "approved" }).eq("id", a.id);
    if (error) return toast.error(error.message);
    toast.success(`${a.name} approved as a pro`);
    qc.invalidateQueries({ queryKey: ["admin-apps"] });
    qc.invalidateQueries({ queryKey: ["admin-pros"] });
  }

  async function reject(id: string) {
    const { error } = await supabase.from("pro_applications").update({ status: "rejected" }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-apps"] });
  }

  return (
    <div className="space-y-4">
      {appsQ.data?.map((a) => (
        <Card key={a.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                {a.name} <span className="ml-2 text-xs capitalize text-muted-foreground">{a.status}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {a.email} · {a.phone} · {a.city} · {a.experience_years} yrs
              </p>
              <p className="mt-2 text-sm">{a.skills}</p>
            </div>
            {a.status === "pending" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => approve(a)}
                  className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => reject(a.id)}
                  className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </Card>
      ))}
      {appsQ.data?.length === 0 && <p className="text-sm text-muted-foreground">No applications yet.</p>}
    </div>
  );
}

function CategoriesTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", slug: "", description: "", sort: 0 });
  const catsQ = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort");
      if (error) throw error;
      return data;
    },
  });

  async function create() {
    if (!form.name || !form.slug) return toast.error("Name and slug are required");
    const { error } = await supabase.from("categories").insert({
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      sort: Number(form.sort) || 0,
    });
    if (error) return toast.error(error.message);
    toast.success("Category added");
    setForm({ name: "", slug: "", description: "", sort: 0 });
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  }

  async function save(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from("categories").update(patch as never).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Category deleted");
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-semibold">Add category</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="slug"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={create}
            className="inline-flex items-center justify-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </Card>
      {catsQ.data?.map((c) => (
        <Card key={c.id}>
          <div className="flex flex-wrap items-center gap-3">
            <input
              defaultValue={c.name}
              onBlur={(e) => e.target.value !== c.name && save(c.id, { name: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              defaultValue={c.sort}
              onBlur={(e) => save(c.id, { sort: Number(e.target.value) })}
              className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <span className="text-xs text-muted-foreground">{c.slug}</span>
            <button type="button" onClick={() => remove(c.id)} className="ml-auto text-muted-foreground hover:text-foreground">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ServicesTab() {
  const qc = useQueryClient();
  const catsQ = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort");
      if (error) throw error;
      return data;
    },
  });
  const svcQ = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
  const [form, setForm] = useState({ name: "", slug: "", price: 499, duration_min: 60, category_id: "" });

  async function create() {
    if (!form.name || !form.slug || !form.category_id) return toast.error("Name, slug and category are required");
    const { error } = await supabase.from("services").insert({
      name: form.name,
      slug: form.slug,
      price: Number(form.price),
      duration_min: Number(form.duration_min),
      category_id: form.category_id,
    });
    if (error) return toast.error(error.message);
    toast.success("Service added");
    setForm({ name: "", slug: "", price: 499, duration_min: 60, category_id: "" });
    qc.invalidateQueries({ queryKey: ["admin-services"] });
  }

  async function save(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from("services").update(patch as never).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-services"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Service deleted");
    qc.invalidateQueries({ queryKey: ["admin-services"] });
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-semibold">Add service</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-6">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="slug"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            placeholder="Price"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Category…</option>
            {catsQ.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={create}
            className="inline-flex items-center justify-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </Card>
      {svcQ.data?.map((s) => (
        <Card key={s.id}>
          <div className="flex flex-wrap items-center gap-3">
            <input
              defaultValue={s.name}
              onBlur={(e) => e.target.value !== s.name && save(s.id, { name: e.target.value })}
              className="min-w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              defaultValue={s.price}
              onBlur={(e) => Number(e.target.value) !== s.price && save(s.id, { price: Number(e.target.value) })}
              className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              defaultValue={s.duration_min}
              onBlur={(e) =>
                Number(e.target.value) !== s.duration_min && save(s.id, { duration_min: Number(e.target.value) })
              }
              className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <span className="text-xs text-muted-foreground">{s.slug}</span>
            <button type="button" onClick={() => remove(s.id)} className="ml-auto text-muted-foreground hover:text-foreground">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ReviewsTab() {
  const qc = useQueryClient();
  const revQ = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function toggle(id: string, hidden: boolean) {
    const { error } = await supabase.from("reviews").update({ hidden }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Review deleted");
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  }

  return (
    <div className="space-y-4">
      {revQ.data?.map((r) => (
        <Card key={r.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                {r.author_name ?? "Customer"} · {r.rating}★{r.hidden ? " · hidden" : ""}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggle(r.id, !r.hidden)}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
              >
                {r.hidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {r.hidden ? "Show" : "Hide"}
              </button>
              <button type="button" onClick={() => remove(r.id)} className="text-muted-foreground hover:text-foreground">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      ))}
      {revQ.data?.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
    </div>
  );
}
