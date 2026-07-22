import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & FAQ — All in One" },
      { name: "description", content: "Frequently asked questions about bookings, payments, safety and cancellations." },
      { property: "og:title", content: "Help & FAQ — All in One" },
      { property: "og:description", content: "Answers to common questions about All in One." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight">Help & FAQ</h1>
        <p className="mt-2 text-sm text-muted-foreground">Everything you need to know about using All in One.</p>

        <Accordion type="single" collapsible className="mt-8">
          {[
            { q: "How do I book a service?", a: "Browse services, add what you need to the cart, then pick an address and time slot to confirm your booking." },
            { q: "Are the professionals verified?", a: "Yes. Every pro is background-checked, trained and rated by real customers." },
            { q: "What is your cancellation policy?", a: "You can cancel a booking free of charge up to 2 hours before the slot." },
            { q: "How are prices calculated?", a: "All prices are upfront. You see the exact cost before you book — no hidden charges." },
            { q: "How do I pay?", a: "You can pay by cash after service or online at checkout — whichever works for you." },
            { q: "What if I'm not happy with the service?", a: "Reach out via Contact within 24 hours and our team will make it right." },
          ].map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  ),
});
