-- PROS
CREATE TABLE public.pros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  city text NOT NULL,
  bio text,
  skills text,
  experience_years integer NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 4.8,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pros TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pros TO authenticated;
GRANT ALL ON public.pros TO service_role;
ALTER TABLE public.pros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active pros" ON public.pros FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "pro reads own profile" ON public.pros FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "pro updates own profile" ON public.pros FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins read pros" ON public.pros FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write pros" ON public.pros FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update pros" ON public.pros FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete pros" ON public.pros FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- PRO CATEGORIES
CREATE TABLE public.pro_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id uuid NOT NULL REFERENCES public.pros(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  UNIQUE (pro_id, category_id)
);
GRANT SELECT ON public.pro_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_categories TO authenticated;
GRANT ALL ON public.pro_categories TO service_role;
ALTER TABLE public.pro_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read pro categories" ON public.pro_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pro manages own categories" ON public.pro_categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pros p WHERE p.id = pro_categories.pro_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pros p WHERE p.id = pro_categories.pro_id AND p.user_id = auth.uid()));
CREATE POLICY "admins manage pro categories" ON public.pro_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- AVAILABILITY
CREATE TABLE public.pro_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id uuid NOT NULL REFERENCES public.pros(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_min integer NOT NULL CHECK (start_min BETWEEN 0 AND 1440),
  end_min integer NOT NULL CHECK (end_min BETWEEN 0 AND 1440),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_min > start_min)
);
GRANT SELECT ON public.pro_availability TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_availability TO authenticated;
GRANT ALL ON public.pro_availability TO service_role;
ALTER TABLE public.pro_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read availability" ON public.pro_availability FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pro manages own availability" ON public.pro_availability FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pros p WHERE p.id = pro_availability.pro_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pros p WHERE p.id = pro_availability.pro_id AND p.user_id = auth.uid()));
CREATE POLICY "admins manage availability" ON public.pro_availability FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.pro_time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id uuid NOT NULL REFERENCES public.pros(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pro_time_off TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_time_off TO authenticated;
GRANT ALL ON public.pro_time_off TO service_role;
ALTER TABLE public.pro_time_off ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read time off" ON public.pro_time_off FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pro manages own time off" ON public.pro_time_off FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pros p WHERE p.id = pro_time_off.pro_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pros p WHERE p.id = pro_time_off.pro_id AND p.user_id = auth.uid()));
CREATE POLICY "admins manage time off" ON public.pro_time_off FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.validate_time_off()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ends_at <= NEW.starts_at THEN
    RAISE EXCEPTION 'End time must be after start time';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER validate_pro_time_off BEFORE INSERT OR UPDATE ON public.pro_time_off
FOR EACH ROW EXECUTE FUNCTION public.validate_time_off();

-- BOOKINGS EXTENSIONS
ALTER TABLE public.bookings
  ADD COLUMN pro_id uuid REFERENCES public.pros(id) ON DELETE SET NULL,
  ADD COLUMN duration_min integer NOT NULL DEFAULT 60,
  ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN payment_ref text,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX bookings_pro_slot_idx ON public.bookings (pro_id, slot_at);

CREATE POLICY "admins read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "pro reads assigned bookings" ON public.bookings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pros p WHERE p.id = bookings.pro_id AND p.user_id = auth.uid()));
CREATE POLICY "pro updates assigned bookings" ON public.bookings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pros p WHERE p.id = bookings.pro_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pros p WHERE p.id = bookings.pro_id AND p.user_id = auth.uid()));

CREATE POLICY "admins read booking items" ON public.booking_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "pro reads assigned booking items" ON public.booking_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b JOIN public.pros p ON p.id = b.pro_id
                 WHERE b.id = booking_items.booking_id AND p.user_id = auth.uid()));

-- PRO APPLICATIONS STATUS
ALTER TABLE public.pro_applications ADD COLUMN status text NOT NULL DEFAULT 'pending';
CREATE POLICY "admins update applications" ON public.pro_applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete applications" ON public.pro_applications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- REVIEWS
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  pro_id uuid REFERENCES public.pros(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read visible reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (hidden = false);
CREATE POLICY "own reviews read" ON public.reviews FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own reviews insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own reviews update" ON public.reviews FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own reviews delete" ON public.reviews FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins read all reviews" ON public.reviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete reviews" ON public.reviews FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- EMAIL LOG (server only)
CREATE TABLE public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  kind text NOT NULL,
  recipient text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, kind, recipient)
);
GRANT ALL ON public.email_log TO service_role;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read email log" ON public.email_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- CATALOG ADMIN WRITES
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage services" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER update_pros_updated_at BEFORE UPDATE ON public.pros FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();