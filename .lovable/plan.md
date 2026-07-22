# All in One — Full Website Plan

Turn the current single-page landing into a proper multi-page marketplace with a real backend (logins, bookings, cart persistence).

## Pages (routes)

```
/                       Landing (existing, polished + real links)
/services               All categories index
/services/$category     Category page (e.g. /services/salon-women)
/services/$category/$service   Service detail (description, price, reviews, Add to cart)
/cart                   Cart page (edit qty, remove, subtotal)
/checkout               Address + date/time slot + confirm  (protected)
/bookings               "My bookings" history                 (protected)
/pros                   Register as a professional (public form)
/about                  About us
/contact                Contact form (writes to DB)
/help                   FAQ / help center
/auth                   Login + signup (email/password + Google)
```

Home stays public; `/checkout` and `/bookings` sit under the `_authenticated/` gate. Everything else is public with an inline "Sign in to book" CTA when needed.

## Backend (Lovable Cloud)

Enable Lovable Cloud, then create these tables via migration:

- `profiles` (id → auth.users, full_name, phone, avatar_url)
- `app_role` enum + `user_roles` (customer, pro, admin) with `has_role()` security-definer function
- `categories` (slug, name, description, image_url, sort)
- `services` (id, category_id, slug, name, description, price, original_price, duration_min, rating, reviews_count, image_url, tag)
- `cart_items` (user_id, service_id, qty, added_at) — RLS: owner only
- `bookings` (id, user_id, address, city, slot_at, status, subtotal, created_at)
- `booking_items` (booking_id, service_id, qty, price)
- `pro_applications` (name, email, phone, city, skills, experience_years, created_at) — public insert, admin read
- `contact_messages` (name, email, subject, message, created_at) — public insert, admin read

All tables get proper GRANTs + RLS policies. Categories and services get a narrow `TO anon` SELECT policy so unauthenticated visitors can browse.

Seed a starter catalog (8 categories × ~4 services each) inside the same migration.

## Auth

- Enable email/password + Google via `supabase--configure_social_auth`.
- `/auth` route with tabbed Sign in / Sign up + "Continue with Google".
- Trigger to auto-create `profiles` row on signup.
- Header shows Sign in when logged out, avatar menu (My bookings, Sign out) when logged in.

## Features & interactions

- **Search**: header + hero search filter services by name; submitting navigates to `/services?q=...`.
- **Category tiles**: link to `/services/$category`.
- **Add to cart**: signed-in → writes to `cart_items`; signed-out → local cart; on sign-in local cart merges into DB.
- **Cart badge**: live count from TanStack Query.
- **Checkout**: form (address, city, date, time slot) → inserts `bookings` + `booking_items`, clears cart, redirects to `/bookings` with a success toast.
- **My bookings**: list with status pill (Pending / Confirmed / Completed).
- **Pros signup** (`/pros`): validated form → `pro_applications`, success screen.
- **Contact** (`/contact`): validated form → `contact_messages`.
- **Help** (`/help`): static FAQ accordion.

## Technical shape

- Data access via `createServerFn` (public reads use publishable client + `TO anon` SELECT policies; owner reads/writes use `requireSupabaseAuth`).
- TanStack Query for all data (loader `ensureQueryData` + `useSuspenseQuery`), invalidations after mutations.
- Each route has its own `head()` (title, description, og tags). Route-level `errorComponent` + `notFoundComponent`.
- Zod validation on every form (client + server).
- Shared `AppShell` (header + footer) rendered in `__root.tsx` so nav is consistent across pages.
- Cart merge on sign-in via a `mergeGuestCart` server fn.

## Out of scope (for this pass)

- Real payments (checkout ends at "Booking confirmed"; can add Stripe later).
- Pro dashboard, admin dashboard, live chat, notifications, ratings write flow.
- SMS/email confirmations.

Shipping this end-to-end is a fairly big build. I'll enable Lovable Cloud, run the schema + seed migration, then build routes + server fns + UI in one sweep.
