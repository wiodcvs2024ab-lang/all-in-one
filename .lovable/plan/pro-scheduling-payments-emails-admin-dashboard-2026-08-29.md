# Pro scheduling, payments, emails, admin dashboard

Four features, built in this order so each one has what it needs.

## 1. Pro availability scheduling

New backend tables:
- `pros` — links a user account to a pro profile (name, city, skills, active flag), created when an admin approves a pro application.
- `pro_availability` — weekly recurring windows per pro (weekday, start time, end time).
- `pro_time_off` — one-off blocked ranges.

Checkout changes:
- After address + city, the user picks a pro from the pros serving that city and matching the booked service categories.
- The date picker then only offers real open slots: generated from the pro's weekly windows, minus time off, minus slots already booked (bookings get a `pro_id`).
- Slot length comes from the total duration of the cart items.
- Slot availability is computed by a server function, so a user cannot book a taken slot by editing the request.

Pro portal (`/pro`): approved pros sign in and manage their weekly availability, add time off, and see their assigned jobs with status updates.

## 2. Stripe payments at checkout

Lovable's built-in Stripe integration needs a paid workspace plan, which this workspace is not on yet. Two ways forward:
- Upgrade the plan and I wire up built-in Stripe (no API keys needed, test mode first).
- Or connect your own Stripe account with your secret key, and I build checkout sessions plus a webhook against it.

Either way, the flow is the same: pressing "Confirm booking" creates the booking as `pending_payment`, sends the user to Stripe Checkout, and only a verified webhook flips it to `confirmed`. Nothing is confirmed on a failed or abandoned payment. Tell me which route you want; until then checkout keeps confirming directly.

## 3. Email notifications

Using the default Lovable sender:
- Customer: booking confirmed, reminder before the slot, and status change (on the way / completed / cancelled).
- Pro: new job assigned, and cancellations.
- Reminders run on a scheduled job that looks ahead for upcoming slots and sends once per booking.

## 4. Admin dashboard (`/admin`)

Admin-only, gated by the existing role table (never by client state):
- Categories and services: create, edit, delete, reorder.
- Pro applications: approve (creates a pro account + profile) or reject.
- Bookings: filter by status, reassign pro, change status (which triggers the status email).
- Reviews: a new `reviews` table (customer rating + comment per completed booking, shown on service pages), with moderation/hide.

All admin writes go through security rules that require the admin role, so a non-admin calling the same endpoints gets rejected.

## Technical notes

- Schema changes ship as migrations with grants, RLS enabled, and role-scoped policies; slot math and all admin/pro writes live in server functions with role checks.
- Existing bookings get a nullable `pro_id`, so current data stays valid.
- Emails send from server functions; the reminder sweep is a low-frequency scheduled job (hourly), which I'll flag before creating.
