import { SlidersHorizontal, X } from "lucide-react";

export type Filters = {
  minPrice: number;
  maxPrice: number;
  minRating: number;
  maxDuration: number;
  sort: "popular" | "price-asc" | "price-desc" | "rating";
};

export const defaultFilters: Filters = {
  minPrice: 0,
  maxPrice: 10000,
  minRating: 0,
  maxDuration: 480,
  sort: "popular",
};

export type FilterableService = {
  price: number;
  rating: number | string;
  duration_min: number;
  reviews_count: number;
};

export function applyFilters<T extends FilterableService>(items: T[], f: Filters): T[] {
  const out = items.filter(
    (s) =>
      s.price >= f.minPrice &&
      s.price <= f.maxPrice &&
      Number(s.rating) >= f.minRating &&
      s.duration_min <= f.maxDuration,
  );
  const sorted = [...out];
  if (f.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (f.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (f.sort === "rating") sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
  else sorted.sort((a, b) => b.reviews_count - a.reviews_count);
  return sorted;
}

const ratingOptions = [0, 4, 4.5, 4.8];
const durationOptions = [
  { label: "Any duration", value: 480 },
  { label: "Under 45 min", value: 45 },
  { label: "Under 1.5 hrs", value: 90 },
  { label: "Under 3 hrs", value: 180 },
];

export function ServiceFilters({
  value,
  onChange,
  resultCount,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });
  const dirty = JSON.stringify(value) !== JSON.stringify(defaultFilters);

  return (
    <aside className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-accent" /> Filters
        </h2>
        {dirty && (
          <button
            onClick={() => onChange(defaultFilters)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{resultCount} services</p>

      {/* Sort */}
      <div className="mt-5">
        <label className="text-xs font-medium text-foreground/70">Sort by</label>
        <select
          value={value.sort}
          onChange={(e) => set({ sort: e.target.value as Filters["sort"] })}
          className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="popular">Most popular</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Highest rated</option>
        </select>
      </div>

      {/* Price */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-foreground/70">Price range</label>
          <span className="text-xs text-muted-foreground">
            ₹{value.minPrice} – ₹{value.maxPrice}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={10000}
          step={100}
          value={value.maxPrice}
          onChange={(e) => set({ maxPrice: Number(e.target.value) })}
          className="mt-3 w-full accent-[hsl(var(--accent))]"
          aria-label="Maximum price"
        />
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={value.minPrice}
            onChange={(e) => set({ minPrice: Math.max(0, Number(e.target.value) || 0) })}
            className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
            aria-label="Minimum price"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="number"
            min={0}
            value={value.maxPrice}
            onChange={(e) => set({ maxPrice: Math.max(0, Number(e.target.value) || 0) })}
            className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
            aria-label="Maximum price value"
          />
        </div>
      </div>

      {/* Rating */}
      <div className="mt-6">
        <label className="text-xs font-medium text-foreground/70">Customer rating</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {ratingOptions.map((r) => (
            <button
              key={r}
              onClick={() => set({ minRating: r })}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                value.minRating === r
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-foreground/70 hover:border-accent hover:text-accent"
              }`}
            >
              {r === 0 ? "Any" : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Duration / availability */}
      <div className="mt-6">
        <label className="text-xs font-medium text-foreground/70">Availability window</label>
        <div className="mt-2 space-y-2">
          {durationOptions.map((d) => (
            <label key={d.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="duration"
                checked={value.maxDuration === d.value}
                onChange={() => set({ maxDuration: d.value })}
                className="accent-[hsl(var(--accent))]"
              />
              {d.label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
