
-- Enums
CREATE TYPE public.order_status AS ENUM ('PENDING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table (must exist before has_role function)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function (must exist before policies that use it)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- User roles policies
CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY,
  club_id TEXT NOT NULL,
  club_name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'DISPENSE',
  category TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  units TEXT NOT NULL DEFAULT 'GRAMS',
  status TEXT NOT NULL DEFAULT 'IN_STOCK',
  tags TEXT NOT NULL DEFAULT '',
  stock_available INTEGER NOT NULL DEFAULT 0,
  stock_stashed INTEGER NOT NULL DEFAULT 0,
  cbd NUMERIC DEFAULT 0,
  thc NUMERIC DEFAULT 0,
  jar_weight NUMERIC DEFAULT 0,
  price_group TEXT NOT NULL DEFAULT '',
  purchase_price NUMERIC NOT NULL DEFAULT 0,
  prices JSONB NOT NULL DEFAULT '[]'::jsonb,
  non_discountable BOOLEAN NOT NULL DEFAULT false,
  allow_gift BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  webhook_created TEXT,
  webhook_updated TEXT
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable"
ON public.products FOR SELECT USING (true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL DEFAULT '',
  delivery_address TEXT NOT NULL,
  club_id TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status public.order_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read orders"
ON public.orders FOR SELECT USING (true);

CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
