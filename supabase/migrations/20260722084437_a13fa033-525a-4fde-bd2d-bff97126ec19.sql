
-- Enum & roles
CREATE TYPE public.app_role AS ENUM ('customer','pro','admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INT NOT NULL,
  original_price INT,
  duration_min INT NOT NULL DEFAULT 60,
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.7,
  reviews_count INT NOT NULL DEFAULT 0,
  image_url TEXT,
  tag TEXT,
  UNIQUE (category_id, slug)
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read services" ON public.services FOR SELECT TO anon, authenticated USING (true);

-- Cart items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  qty INT NOT NULL DEFAULT 1 CHECK (qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, service_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cart" ON public.cart_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  slot_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bookings" ON public.bookings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  service_name TEXT NOT NULL,
  price INT NOT NULL,
  qty INT NOT NULL
);
GRANT SELECT, INSERT ON public.booking_items TO authenticated;
GRANT ALL ON public.booking_items TO service_role;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own booking items read" ON public.booking_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid()));
CREATE POLICY "own booking items insert" ON public.booking_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid()));

-- Pro applications
CREATE TABLE public.pro_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  skills TEXT NOT NULL,
  experience_years INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.pro_applications TO anon, authenticated;
GRANT SELECT ON public.pro_applications TO authenticated;
GRANT ALL ON public.pro_applications TO service_role;
ALTER TABLE public.pro_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can apply" ON public.pro_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read applications" ON public.pro_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Contact messages
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Seed categories
INSERT INTO public.categories (slug, name, description, image_url, sort) VALUES
  ('salon-women','Salon for women','Haircuts, facials, waxing at home','https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',1),
  ('salon-men','Men''s salon & massage','Grooming and massage for men','https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',2),
  ('ac-repair','AC & appliance repair','Fast, reliable technicians','https://images.unsplash.com/photo-1631545308456-8ea4b1b5f2b5?w=800',3),
  ('cleaning','Home cleaning','Bathroom, kitchen & full home','https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',4),
  ('electrician','Electrician','Switches, wiring, fittings','https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',5),
  ('plumber','Plumber','Leaks, taps, blockages','https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800',6),
  ('painting','Painting','Interior & exterior painting','https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800',7),
  ('pest-control','Pest control','Cockroaches, mosquitoes, termites','https://images.unsplash.com/photo-1632935190508-bce4ed3ed80a?w=800',8);

-- Seed services (32 total)
WITH c AS (SELECT id, slug FROM public.categories)
INSERT INTO public.services (category_id, slug, name, description, price, original_price, duration_min, rating, reviews_count, image_url, tag)
SELECT c.id, s.slug, s.name, s.description, s.price, s.original_price, s.duration_min, s.rating, s.reviews_count, s.image_url, s.tag
FROM c JOIN (VALUES
  ('salon-women','haircut','Haircut & styling','Cut, wash and blow-dry at home',799,999,60,4.8,1240,'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800','Bestseller'),
  ('salon-women','facial','Glow facial','60-min brightening facial',1499,1899,60,4.7,980,'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800',NULL),
  ('salon-women','waxing','Full arms + legs waxing','Roll-on wax, gentle on skin',799,999,45,4.6,760,'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800',NULL),
  ('salon-women','pedicure','Classic pedicure','Includes scrub & massage',649,899,50,4.7,540,'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800',NULL),
  ('salon-men','mens-haircut','Men''s haircut','Trim, wash & style',349,499,45,4.7,2100,'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800','Popular'),
  ('salon-men','beard-shave','Beard shave & styling','Hot towel + beard shape',249,349,30,4.8,1500,'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800',NULL),
  ('salon-men','massage-60','60-min stress relief massage','Full-body deep tissue',1299,1699,60,4.8,890,'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',NULL),
  ('salon-men','hair-color','Hair colour (men)','Ammonia-free colour',799,999,60,4.6,420,'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800',NULL),
  ('ac-repair','ac-service','AC service (split)','Deep clean + gas check',499,699,60,4.7,3200,'https://images.unsplash.com/photo-1631545308456-8ea4b1b5f2b5?w=800','Bestseller'),
  ('ac-repair','ac-gas','AC gas refill','R32/R410a refill',2499,2999,90,4.6,780,'https://images.unsplash.com/photo-1621905252189-08b45f10c0e6?w=800',NULL),
  ('ac-repair','washing-machine','Washing machine repair','Diagnosis included',299,399,60,4.7,650,'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800',NULL),
  ('ac-repair','fridge','Refrigerator repair','Single/double door',299,399,60,4.6,520,'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800',NULL),
  ('cleaning','bathroom','Bathroom cleaning','Scrub, disinfect, polish',499,699,90,4.7,1800,'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800','Bestseller'),
  ('cleaning','kitchen','Kitchen deep cleaning','Chimney, hob, cabinets',1299,1699,180,4.8,1100,'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',NULL),
  ('cleaning','full-home','Full home cleaning','1BHK, 2BHK, 3BHK',2499,2999,240,4.7,860,'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',NULL),
  ('cleaning','sofa','Sofa cleaning','Per seat, foam clean',249,349,30,4.6,420,'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800',NULL),
  ('electrician','fan-install','Fan installation','Ceiling/wall fan',199,299,30,4.7,940,'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',NULL),
  ('electrician','switch-repair','Switch/socket repair','Per point',129,199,20,4.6,620,'https://images.unsplash.com/photo-1621905252472-943afaa14a26?w=800',NULL),
  ('electrician','mcb-fuse','MCB / fuse repair','Diagnose & fix',249,349,45,4.7,410,'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=800',NULL),
  ('electrician','light-install','Light fixture installation','Per fitting',149,249,20,4.7,530,'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800',NULL),
  ('plumber','tap-repair','Tap repair / replacement','Per tap',149,249,30,4.7,880,'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800',NULL),
  ('plumber','blockage','Blockage removal','Sink or drain',299,499,45,4.6,540,'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800',NULL),
  ('plumber','flush-tank','Flush tank repair','Fix leaks & flush',249,349,30,4.7,320,'https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=800',NULL),
  ('plumber','geyser','Geyser installation','Wall-mount & connect',399,599,60,4.7,410,'https://images.unsplash.com/photo-1585421514284-efb74320c46a?w=800',NULL),
  ('painting','interior-1bhk','Interior painting 1 BHK','Premium emulsion',12999,15999,1440,4.7,220,'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800',NULL),
  ('painting','interior-2bhk','Interior painting 2 BHK','Premium emulsion',19999,24999,1440,4.7,180,'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',NULL),
  ('painting','wall-touchup','Wall touch-up','Per room',999,1499,90,4.6,320,'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=800',NULL),
  ('painting','waterproofing','Waterproofing','Damp treatment',3499,4499,240,4.6,140,'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=800',NULL),
  ('pest-control','cockroach','Cockroach control','Gel-based, odourless',799,999,60,4.7,880,'https://images.unsplash.com/photo-1632935190508-bce4ed3ed80a?w=800',NULL),
  ('pest-control','mosquito','Mosquito treatment','Fogging + spray',999,1299,90,4.7,540,'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800',NULL),
  ('pest-control','termite','Termite treatment','5-year warranty',3499,4499,180,4.7,220,'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800',NULL),
  ('pest-control','general','General pest control','Full home',1499,1999,120,4.7,410,'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?w=800',NULL)
) AS s(cat_slug, slug, name, description, price, original_price, duration_min, rating, reviews_count, image_url, tag)
ON c.slug = s.cat_slug;
