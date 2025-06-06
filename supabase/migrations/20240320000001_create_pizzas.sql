-- Create pizzas table
CREATE TABLE IF NOT EXISTS pizzas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  sizes JSONB,
  is_popular BOOLEAN DEFAULT false,
  is_vegetarian BOOLEAN DEFAULT false,
  pizzeria_id UUID NOT NULL REFERENCES pizzerias(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index on name and description for search
CREATE INDEX IF NOT EXISTS pizzas_name_description_idx ON pizzas USING gin (to_tsvector('french', name || ' ' || COALESCE(description, '')));

-- Create trigger to update updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_pizzas_updated_at'
  ) THEN
    CREATE TRIGGER update_pizzas_updated_at
      BEFORE UPDATE ON pizzas
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$; 