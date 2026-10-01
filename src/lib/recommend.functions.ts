import { createServerFn } from "@tanstack/react-start";

export const recommendServices = createServerFn({ method: "POST" })
  .inputValidator((data: { need: string }) => {
    const need = String(data?.need ?? "").trim().slice(0, 500);
    if (need.length < 3) throw new Error("Please describe what you need");
    return { need };
  })
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("@/lib/supabase-public.server");
    const { recommendFromCatalog } = await import("@/lib/recommend.server");
    const supabase = createPublicClient();
    const { data: rows, error } = await supabase
      .from("services")
      .select("id, name, price, description, rating, image_url, categories(name, slug)");
    if (error) throw new Error(error.message);
    const catalog = (rows ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      price: r.price,
      description: r.description,
      category: (r.categories as { name: string } | null)?.name ?? "",
    }));
    try {
      const picks = await recommendFromCatalog(data.need, catalog);
      return picks.map((p) => {
        const s = rows!.find((r) => r.id === p.id)!;
        return {
          id: s.id,
          name: s.name,
          price: s.price,
          rating: Number(s.rating),
          category: (s.categories as { name: string; slug: string } | null)?.name ?? "",
          reason: p.reason,
        };
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("429")) throw new Error("Too many requests right now. Please try again in a minute.");
      if (msg.includes("402")) throw new Error("AI recommendations are temporarily unavailable.");
      throw new Error("Couldn't get recommendations. Please try again.");
    }
  });
