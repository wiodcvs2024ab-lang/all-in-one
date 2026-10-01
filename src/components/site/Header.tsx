import { Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Search, ShoppingCart, Sparkles, User as UserIcon, LogOut } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useRoles } from "@/lib/roles";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const cities = ["Kolkata", "Delhi NCR", "Mumbai", "Bengaluru", "Hyderabad", "Pune"];

export function Header() {
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const { isAdmin, isPro } = useRoles();
  const navigate = useNavigate();
  const [city, setCity] = useState("Kolkata");
  const [q, setQ] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate({ to: "/services", search: { q: query } as never });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">All in One</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            const next = cities[(cities.indexOf(city) + 1) % cities.length];
            setCity(next);
            toast.success(`Location set to ${next}`);
          }}
          className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-foreground/40 md:inline-flex"
        >
          <MapPin className="h-4 w-4" />
          {city}
        </button>

        <form
          onSubmit={onSearch}
          className="ml-auto hidden max-w-md flex-1 items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 md:flex"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search 'AC service', 'facial'..."
          />
        </form>

        <nav className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            to="/services"
            className="hidden text-sm font-medium text-foreground/80 hover:text-foreground md:inline"
          >
            Services
          </Link>
          <Link
            to="/pros"
            className="hidden text-sm font-medium text-foreground/80 hover:text-foreground md:inline"
          >
            Register as Pro
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary">
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/bookings">My bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/cart">Cart</Link>
                </DropdownMenuItem>
                {(isPro || isAdmin) && <DropdownMenuSeparator />}
                {isPro && (
                  <DropdownMenuItem asChild>
                    <Link to="/pro">Pro portal</Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    toast.success("Signed out");
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
              className="hidden text-sm font-medium text-foreground/80 hover:text-foreground sm:inline"
            >
              Login
            </Link>
          )}

          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
