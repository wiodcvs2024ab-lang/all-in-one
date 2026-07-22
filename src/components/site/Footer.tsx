import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">All in One</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Trusted home services at your doorstep across India.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Company</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About us</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/help" className="hover:text-foreground">Help & FAQ</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">For customers</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services" className="hover:text-foreground">All services</Link></li>
            <li><Link to="/cart" className="hover:text-foreground">Your cart</Link></li>
            <li><Link to="/bookings" className="hover:text-foreground">My bookings</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">For professionals</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/pros" className="hover:text-foreground">Register as a pro</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Partner support</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} All in One. All rights reserved.
      </div>
    </footer>
  );
}
