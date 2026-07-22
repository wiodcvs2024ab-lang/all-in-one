import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — All in One" },
      { name: "description", content: "Review your selected services and proceed to book." },
      { property: "og:title", content: "Your cart — All in One" },
      { property: "og:description", content: "Review your selected services and proceed to book." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Browse services and add what you need.</p>
            <Link to="/services" className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Browse services
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {i.image_url && <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-semibold">{i.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">₹{i.price}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full border border-border px-2 py-1">
                        <button onClick={() => setQty(i.id, i.qty - 1)} className="p-1 hover:text-accent"><Minus className="h-3 w-3" /></button>
                        <span className="min-w-[20px] text-center text-sm">{i.qty}</span>
                        <button onClick={() => setQty(i.id, i.qty + 1)} className="p-1 hover:text-accent"><Plus className="h-3 w-3" /></button>
                      </div>
                      <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="text-right text-sm font-semibold">₹{i.price * i.qty}</div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Order summary</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>₹{subtotal}</dd></div>
                <div className="flex justify-between text-muted-foreground"><dt>Visit fee</dt><dd>Free</dd></div>
                <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold"><dt>Total</dt><dd>₹{subtotal}</dd></div>
              </dl>
              <button
                onClick={() => {
                  if (!user) navigate({ to: "/auth", search: { redirect: "/checkout" } as never });
                  else navigate({ to: "/checkout" });
                }}
                className="mt-5 w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                {user ? "Proceed to checkout" : "Sign in to checkout"}
              </button>
            </aside>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
