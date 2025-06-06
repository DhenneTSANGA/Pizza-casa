-- Create pizzerias table
CREATE TABLE IF NOT EXISTS pizzerias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  rating DECIMAL(3,1) DEFAULT 0,
  address TEXT NOT NULL,
  phone TEXT,
  opening_hours TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  orders_count INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index on name and address for search
CREATE INDEX IF NOT EXISTS pizzerias_name_address_idx ON pizzerias USING gin (to_tsvector('french', name || ' ' || COALESCE(address, '')));

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pizzerias_updated_at
  BEFORE UPDATE ON pizzerias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 