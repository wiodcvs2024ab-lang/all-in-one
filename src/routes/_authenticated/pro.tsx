import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { formatSlotLabel } from "@/lib/slots";
import { CalendarClock, MapPin, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/pro")({
  head: () => ({
    meta: [
      { title: "Pro portal — All in One" },
      { name: "description", content: "Manage your weekly availability, time off and assigned jobs." },
      { property: "og:title", content: "Pro portal — All in One" },
      { property: "og:description", content: "Manage your weekly availability, time off and assigned jobs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProPortal,
});

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STATUSES = ["confirmed", "on_the_way", "in_progress", "completed", "cancelled"];

function toMin(v: string) {
  const [h, m] = v.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
function toTime(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

function ProPortal() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const proQ = useQuery({
    queryKey: ["me-pro", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("pros").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const pro = proQ.data;

  const availQ = useQuery({
    queryKey: ["me-avail", pro?.id],
    enabled: !!pro,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pro_availability")
        .select("*")
        .eq("pro_id", pro!.id)
        .order("weekday")
        .order("start_min");
      if (error) throw error;
      return data;
    },
  });

  const offQ = useQuery({
    queryKey: ["me-timeoff", pro?.id],
    enabled: !!pro,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pro_time_off")
        .select("*")
        .eq("pro_id", pro!.id)
        .order("starts_at");
      if (error) throw error;
      return data;
    },
  });

  const jobsQ = useQuery({
    queryKey: ["me-jobs", pro?.id],
    enabled: !!pro,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, booking_items(*)")
        .eq("pro_id", pro!.id)
        .order("slot_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [weekday, setWeekday] = useState(1);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [offStart, setOffStart] = useState("");
  const [offEnd, setOffEnd] = useState("");
  const [reason, setReason] = useState("");

  async function addWindow() {
    if (toMin(end) <= toMin(start)) return toast.error("End time must be after start time");
    const { error } = await supabase
      .from("pro_availability")
      .insert({ pro_id: pro!.id, weekday, start_min: toMin(start), end_min: toMin(end) });
    if (error) return toast.error(error.message);
    toast.success("Availability added");
    qc.invalidateQueries({ queryKey: ["me-avail", pro!.id] });
  }

  async function removeWindow(id: string) {
    const { error } = await supabase.from("pro_availability").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["me-avail", pro!.id] });
  }

  async function addTimeOff() {
    if (!offStart || !offEnd) return toast.error("Pick both dates");
    const { error } = await supabase.from("pro_time_off").insert({
      pro_id: pro!.id,
      starts_at: new Date(offStart).toISOString(),
      ends_at: new Date(offEnd).toISOString(),
      reason: reason || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Time off added");
    setReason("");
    qc.invalidateQueries({ queryKey: ["me-timeoff", pro!.id] });
  }

  async function removeTimeOff(id: string) {
    const { error } = await supabase.from("pro_time_off").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["me-timeoff", pro!.id] });
  }

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Job updated");
    qc.invalidateQueries({ queryKey: ["me-jobs", pro!.id] });
  }

  if (proQ.isLoading) {
    return (
      <SiteLayout>
        <p className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">Loading your portal…</p>
      </SiteLayout>
    );
  }

  if (!pro) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Pro portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account isn't linked to a professional profile yet. Once your application is approved, your schedule and
            jobs appear here.
          </p>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome, {pro.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pro.city} · rating {pro.rating} · {pro.active ? "Active" : "Inactive"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Weekly availability</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Day</label>
              <select
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">From</label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To</label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={addWindow}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          <ul className="mt-5 divide-y divide-border">
            {availQ.data?.map((w) => (
              <li key={w.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {DAYS[w.weekday]} · {formatSlotLabel(w.start_min)} – {formatSlotLabel(w.end_min)}
                </span>
                <button type="button" onClick={() => removeWindow(w.id)} className="text-muted-foreground hover:text-foreground">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
            {availQ.data?.length === 0 && (
              <li className="py-2 text-sm text-muted-foreground">No availability set — customers can't book you yet.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Time off</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Starts</label>
              <input
                type="datetime-local"
                value={offStart}
                onChange={(e) => setOffStart(e.target.value)}
                className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Ends</label>
              <input
                type="datetime-local"
                value={offEnd}
                onChange={(e) => setOffEnd(e.target.value)}
                className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Reason</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional"
                className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={addTimeOff}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {offQ.data?.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {new Date(t.starts_at).toLocaleString()} → {new Date(t.ends_at).toLocaleString()}
                  {t.reason ? ` · ${t.reason}` : ""}
                </span>
                <button type="button" onClick={() => removeTimeOff(t.id)} className="text-muted-foreground hover:text-foreground">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
            {offQ.data?.length === 0 && <li className="py-2 text-sm text-muted-foreground">No time off scheduled.</li>}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Assigned jobs</p>
          <ul className="mt-4 space-y-4">
            {jobsQ.data?.map((b) => (
              <li key={b.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <CalendarClock className="h-4 w-4" /> {new Date(b.slot_at).toLocaleString()}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {b.address}, {b.city}
                    </p>
                  </div>
                  <select
                    value={b.status}
                    onChange={(e) => setStatus(b.id, e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs capitalize"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {b.booking_items?.map((i: { id: string; service_name: string; qty: number; price: number }) => (
                    <li key={i.id} className="flex justify-between">
                      <span>
                        {i.service_name} × {i.qty}
                      </span>
                      <span>₹{i.price * i.qty}</span>
                    </li>
                  ))}
                </ul>
                {b.notes && <p className="mt-2 text-xs text-muted-foreground">Notes: {b.notes}</p>}
              </li>
            ))}
            {jobsQ.data?.length === 0 && <li className="text-sm text-muted-foreground">No jobs assigned yet.</li>}
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
}
