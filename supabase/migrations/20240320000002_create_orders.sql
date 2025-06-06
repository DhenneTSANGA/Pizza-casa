-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pizzeria_id UUID NOT NULL REFERENCES pizzerias(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  order_time TIME NOT NULL DEFAULT CURRENT_TIME,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'card',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index on order_date for faster filtering
CREATE INDEX IF NOT EXISTS orders_order_date_idx ON orders(order_date);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

-- Create trigger to update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_orders_updated_at'
  ) THEN
    CREATE TRIGGER update_orders_updated_at
      BEFORE UPDATE ON orders
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_order_items_updated_at'
  ) THEN
    CREATE TRIGGER update_order_items_updated_at
      BEFORE UPDATE ON order_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create view for orders with user and pizzeria information
CREATE OR REPLACE VIEW orders_with_details AS
SELECT 
  o.*,
  u.email as customer_email,
  u.raw_user_meta_data->>'name' as customer_name,
  u.raw_user_meta_data->>'avatar_url' as customer_avatar,
  p.name as pizzeria_name
FROM orders o
LEFT JOIN auth.users u ON o.customer_id = u.id
LEFT JOIN pizzerias p ON o.pizzeria_id = p.id; 