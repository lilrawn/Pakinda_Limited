-- ============================================================
-- PASS 1: Auth, Roles, RLS, MFA-enforced admin
-- ============================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'client');

CREATE TABLE public.user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.app_role NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.is_aal2()
RETURNS BOOLEAN LANGUAGE SQL STABLE
AS $$ SELECT COALESCE((auth.jwt() ->> 'aal') = 'aal2', false) $$;

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') AND public.is_aal2());
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin') AND public.is_aal2())
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND public.is_aal2());

CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  id_number     TEXT,
  license_number TEXT,
  id_image_url  TEXT,
  license_image_url TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') AND public.is_aal2());

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  IF lower(NEW.email) = 'pakindalimited@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.fleet_cars (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  series        TEXT,
  category      TEXT NOT NULL CHECK (category IN ('Luxury','SUV','Sports','Executive')),
  image_url     TEXT,
  spec_hp       TEXT,
  spec_top      TEXT,
  spec_zero     TEXT,
  price_per_day INTEGER NOT NULL CHECK (price_per_day >= 0),
  description   TEXT,
  features      TEXT[] NOT NULL DEFAULT '{}',
  available     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fleet_cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads fleet" ON public.fleet_cars FOR SELECT USING (true);
CREATE POLICY "Admins write fleet" ON public.fleet_cars
  FOR ALL USING (public.has_role(auth.uid(), 'admin') AND public.is_aal2())
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND public.is_aal2());
CREATE TRIGGER trg_fleet_cars_updated BEFORE UPDATE ON public.fleet_cars
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.service_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id            UUID NOT NULL UNIQUE REFERENCES public.fleet_cars(id) ON DELETE CASCADE,
  last_service_date DATE,
  next_service_date DATE,
  service_notes     TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage service" ON public.service_records
  FOR ALL USING (public.has_role(auth.uid(), 'admin') AND public.is_aal2())
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND public.is_aal2());

CREATE TABLE public.bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id              UUID REFERENCES public.fleet_cars(id) ON DELETE SET NULL,
  car_name            TEXT NOT NULL,
  car_slug            TEXT,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name           TEXT NOT NULL,
  user_email          TEXT NOT NULL,
  user_phone          TEXT,
  user_id_number      TEXT,
  user_license_number TEXT,
  user_id_image_url   TEXT,
  user_license_image_url TEXT,
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL CHECK (end_date >= start_date),
  num_days            INTEGER NOT NULL CHECK (num_days > 0),
  price_per_day       INTEGER NOT NULL CHECK (price_per_day >= 0),
  total_price         INTEGER NOT NULL CHECK (total_price >= 0),
  payment_method      TEXT CHECK (payment_method IN ('mpesa','bank_transfer','card')),
  payment_ref         TEXT,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','completed','cancelled')),
  pickup_location     TEXT,
  returned_at         TIMESTAMPTZ,
  return_condition    TEXT,
  return_notes        TEXT,
  admin_notes         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own pending bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full bookings" ON public.bookings
  FOR ALL USING (public.has_role(auth.uid(), 'admin') AND public.is_aal2())
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND public.is_aal2());
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_car ON public.bookings(car_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

CREATE TABLE public.market_listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_name   TEXT NOT NULL,
  seller_email  TEXT NOT NULL,
  seller_phone  TEXT NOT NULL,
  make          TEXT NOT NULL,
  model         TEXT NOT NULL,
  year          TEXT NOT NULL,
  mileage       TEXT,
  asking_price  INTEGER NOT NULL CHECK (asking_price >= 0),
  description   TEXT,
  image_urls    TEXT[] NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','sold')),
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads approved listings" ON public.market_listings
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Sellers read own listings" ON public.market_listings
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = seller_id);
CREATE POLICY "Authenticated create listing" ON public.market_listings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = seller_id);
CREATE POLICY "Admins full listings" ON public.market_listings
  FOR ALL USING (public.has_role(auth.uid(), 'admin') AND public.is_aal2())
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND public.is_aal2());
CREATE TRIGGER trg_market_updated BEFORE UPDATE ON public.market_listings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'system',
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users mark own notifications read" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);

CREATE TABLE public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action      TEXT NOT NULL,
  entity      TEXT,
  entity_id   TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit log" ON public.audit_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') AND public.is_aal2());
CREATE POLICY "Authenticated insert audit log" ON public.audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = actor_id);

INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('car-images', 'car-images', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('market-photos', 'market-photos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users read own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins read all documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin') AND public.is_aal2());

CREATE POLICY "Public read car images" ON storage.objects
  FOR SELECT USING (bucket_id = 'car-images');
CREATE POLICY "Admins manage car images" ON storage.objects
  FOR ALL USING (bucket_id = 'car-images' AND public.has_role(auth.uid(), 'admin') AND public.is_aal2())
  WITH CHECK (bucket_id = 'car-images' AND public.has_role(auth.uid(), 'admin') AND public.is_aal2());

CREATE POLICY "Public read market photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'market-photos');
CREATE POLICY "Sellers upload own market photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'market-photos' AND auth.uid()::text = (storage.foldername(name))[1]);