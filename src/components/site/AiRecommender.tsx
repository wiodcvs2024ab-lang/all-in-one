import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { recommendServices } from "@/lib/recommend.functions";

type Pick = Awaited<ReturnType<typeof recommendServices>>[number];

export function AiRecommender() {
  const run = useServerFn(recommendServices);
  const [need, setNeed] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picks, setPicks] = useState<Pick[] | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setPicks(await run({ data: { need } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-accent" /> Not sure what to book?
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Describe the problem and we'll suggest the right services.</p>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            aria-label="Describe what you need"
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            placeholder="e.g. My AC is making noise and not cooling"
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button
            disabled={busy || need.trim().length < 3}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Finding matches…" : "Suggest services"}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        {picks && picks.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">No close match in our catalog. Try describing it differently.</p>
        )}
        {picks && picks.length > 0 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {picks.map((p) => (
              <Link
                key={p.id}
                to="/service/$id"
                params={{ id: p.id }}
                className="rounded-xl border border-border p-4 hover:border-foreground/30"
              >
                <p className="text-xs text-muted-foreground">{p.category}</p>
                <p className="mt-1 text-sm font-semibold">{p.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-current" /> {p.rating} · ₹{p.price}
                </p>
                {p.reason && <p className="mt-2 text-xs">{p.reason}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
