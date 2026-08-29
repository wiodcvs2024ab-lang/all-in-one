import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateSlots, istDateTimeToUtc } from "@/lib/slots";

/** Pros in a city who cover every category needed by the cart. */
export const listPros = createServerFn({ method: "POST" })
  .inputValidator((data: { city: string; serviceIds: string[] }) => ({
    city: String(data.city),
    serviceIds: (data.serviceIds ?? []).map(String),
  }))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("@/lib/supabase-public.server");
    const supabase = createPublicClient();

    let categoryIds: string[] = [];
    if (data.serviceIds.length > 0) {
      const { data: services, error } = await supabase
        .from("services")
        .select("category_id")
        .in("id", data.serviceIds);
      if (error) throw new Error(error.message);
      categoryIds = [...new Set((services ?? []).map((s) => s.category_id))];
    }

    const { data: pros, error: e2 } = await supabase
      .from("pros")
      .select("id, name, city, bio, rating, experience_years, pro_categories(category_id)")
      .eq("active", true)
      .eq("city", data.city)
      .order("rating", { ascending: false });
    if (e2) throw new Error(e2.message);

    return (pros ?? [])
      .map((p) => {
        const covered = new Set((p.pro_categories ?? []).map((c) => c.category_id));
        const matches = categoryIds.filter((id) => covered.has(id)).length;
        return { ...p, matches, coversAll: categoryIds.every((id) => covered.has(id)) };
      })
      .filter((p) => categoryIds.length === 0 || p.matches > 0)
      .sort((a, b) => Number(b.coversAll) - Number(a.coversAll) || b.rating - a.rating);
  });

/** Open start times (minutes from midnight IST) for a pro on a given date. */
export const listSlots = createServerFn({ method: "POST" })
  .inputValidator((data: { proId: string; date: string; durationMin: number }) => ({
    proId: String(data.proId),
    date: String(data.date),
    durationMin: Math.max(30, Math.min(600, Number(data.durationMin) || 60)),
  }))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("@/lib/supabase-public.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const supabase = createPublicClient();

    const { data: windows, error } = await supabase
      .from("pro_availability")
      .select("weekday, start_min, end_min")
      .eq("pro_id", data.proId);
    if (error) throw new Error(error.message);

    const dayStart = istDateTimeToUtc(data.date, 0).getTime();
    const dayEnd = dayStart + 24 * 60 * 60_000;

    const { data: timeOff } = await supabase
      .from("pro_time_off")
      .select("starts_at, ends_at")
      .eq("pro_id", data.proId)
      .lt("starts_at", new Date(dayEnd).toISOString())
      .gt("ends_at", new Date(dayStart).toISOString());

    const { data: booked } = await supabaseAdmin
      .from("bookings")
      .select("slot_at, duration_min, status")
      .eq("pro_id", data.proId)
      .neq("status", "cancelled")
      .gte("slot_at", new Date(dayStart - 12 * 60 * 60_000).toISOString())
      .lt("slot_at", new Date(dayEnd).toISOString());

    const busy = [
      ...(timeOff ?? []).map((t) => ({
        start: new Date(t.starts_at).getTime(),
        end: new Date(t.ends_at).getTime(),
      })),
      ...(booked ?? []).map((b) => {
        const start = new Date(b.slot_at).getTime();
        return { start, end: start + (b.duration_min || 60) * 60_000 };
      }),
    ];

    return generateSlots({
      date: data.date,
      durationMin: data.durationMin,
      windows: windows ?? [],
      busy,
      nowMs: Date.now(),
    });
  });

/** Create a booking after re-validating price and slot availability server-side. */
export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      address: string;
      city: string;
      proId: string;
      date: string;
      startMin: number;
      notes?: string;
      items: { service_id: string; qty: number }[];
    }) => ({
      address: String(data.address).trim(),
      city: String(data.city),
      proId: String(data.proId),
      date: String(data.date),
      startMin: Number(data.startMin),
      notes: data.notes ? String(data.notes) : null,
      items: (data.items ?? []).map((i) => ({
        service_id: String(i.service_id),
        qty: Math.max(1, Math.min(10, Number(i.qty) || 1)),
      })),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!data.address) throw new Error("Address is required");
    if (data.items.length === 0) throw new Error("Your cart is empty");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: services, error: sErr } = await supabaseAdmin
      .from("services")
      .select("id, name, price, duration_min")
      .in(
        "id",
        data.items.map((i) => i.service_id),
      );
    if (sErr) throw new Error(sErr.message);
    if (!services || services.length !== new Set(data.items.map((i) => i.service_id)).size) {
      throw new Error("One or more services are no longer available");
    }

    const lines = data.items.map((i) => {
      const s = services.find((x) => x.id === i.service_id)!;
      return { service_id: s.id, service_name: s.name, price: s.price, qty: i.qty, duration_min: s.duration_min };
    });
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const durationMin = Math.min(600, lines.reduce((sum, l) => sum + l.duration_min * l.qty, 0));

    // Re-check that the requested slot is genuinely open for this pro.
    const { data: windows } = await supabaseAdmin
      .from("pro_availability")
      .select("weekday, start_min, end_min")
      .eq("pro_id", data.proId);

    const dayStart = istDateTimeToUtc(data.date, 0).getTime();
    const dayEnd = dayStart + 24 * 60 * 60_000;

    const { data: timeOff } = await supabaseAdmin
      .from("pro_time_off")
      .select("starts_at, ends_at")
      .eq("pro_id", data.proId);
    const { data: booked } = await supabaseAdmin
      .from("bookings")
      .select("slot_at, duration_min")
      .eq("pro_id", data.proId)
      .neq("status", "cancelled")
      .gte("slot_at", new Date(dayStart - 12 * 60 * 60_000).toISOString())
      .lt("slot_at", new Date(dayEnd).toISOString());

    const open = generateSlots({
      date: data.date,
      durationMin,
      windows: windows ?? [],
      busy: [
        ...(timeOff ?? []).map((t) => ({
          start: new Date(t.starts_at).getTime(),
          end: new Date(t.ends_at).getTime(),
        })),
        ...(booked ?? []).map((b) => {
          const start = new Date(b.slot_at).getTime();
          return { start, end: start + (b.duration_min || 60) * 60_000 };
        }),
      ],
      nowMs: Date.now(),
    });

    if (!open.includes(data.startMin)) {
      throw new Error("That slot was just taken. Please pick another time.");
    }

    const slotAt = istDateTimeToUtc(data.date, data.startMin).toISOString();

    // Insert as the signed-in user so RLS enforces ownership.
    const { data: booking, error: bErr } = await context.supabase
      .from("bookings")
      .insert({
        user_id: context.userId,
        pro_id: data.proId,
        address: data.address,
        city: data.city,
        slot_at: slotAt,
        subtotal,
        duration_min: durationMin,
        notes: data.notes,
        status: "confirmed",
        payment_status: "unpaid",
      })
      .select("id, slot_at")
      .single();
    if (bErr) throw new Error(bErr.message);

    const { error: iErr } = await context.supabase.from("booking_items").insert(
      lines.map((l) => ({
        booking_id: booking.id,
        service_id: l.service_id,
        service_name: l.service_name,
        price: l.price,
        qty: l.qty,
      })),
    );
    if (iErr) throw new Error(iErr.message);

    return { id: booking.id, slot_at: booking.slot_at, subtotal, durationMin };
  });
