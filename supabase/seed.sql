-- Insert test data into pizzerias table
INSERT INTO pizzerias (name, address, image, rating, phone, opening_hours, tags, status, description)
VALUES
  (
    'Pizza Napoli',
    '45 Avenue de l''Indépendance, Libreville',
    '/napoli.jpeg?height=80&width=80',
    4.7,
    '+241 01 23 45 67',
    '11:00-22:00',
    ARRAY['Italien', 'Traditionnel'],
    'active',
    'Pizzeria traditionnelle napolitaine'
  ),
  (
    'Pizzeria Roma',
    '12 Boulevard du Bord de Mer, Libreville',
    '/devant2.avif',
    4.5,
    '+241 01 23 45 68',
    '10:00-23:00',
    ARRAY['Italien', 'Moderne'],
    'active',
    'Pizzeria romaine moderne'
  ),
  (
    'Pizza Hut Glass',
    'Glass',
    '/pizza hut.jpg',
    4.3,
    '+241 01 23 45 69',
    '11:30-21:30',
    ARRAY['International', 'Fast-food'],
    'active',
    'Pizza Hut à Glass'
  ),
  (
    'Mamma Mia Akanda',
    '23 Avenue des Cocotiers, Akanda',
    '/mama_mia.jpeg?height=80&width=80',
    4.8,
    '+241 01 23 45 70',
    '12:00-22:30',
    ARRAY['Italien', 'Famille'],
    'active',
    'Pizzeria familiale à Akanda'
  ),
  (
    'La Sauce Creole',
    'Charbonnages',
    '/sauce creole.jpg',
    4.2,
    '+241 01 23 45 71',
    '11:00-21:00',
    ARRAY['Créole', 'Local'],
    'active',
    'Pizzeria créole'
  ),
  (
    'Tivoli',
    'Tivoli, Glass',
    '/tivoli.jpg',
    5.0,
    '+241 01 23 45 72',
    '12:00-23:30',
    ARRAY['Italien', 'Premium'],
    'active',
    'Pizzeria premium à Tivoli'
  ),
  (
    'Yeunil',
    'Charbonnages, ABC MALL',
    '/yeunil.png',
    5.0,
    '+241 01 23 45 73',
    '12:00-23:30',
    ARRAY['International', 'Mall'],
    'active',
    'Pizzeria au ABC MALL'
  );

-- Insert test data into pizzas table
INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'Margherita',
  'Sauce tomate, mozzarella, basilic frais',
  8000,
  '/Margaherita.webp',
  'Classiques',
  ARRAY['Sauce tomate', 'Mozzarella', 'Basilic frais'],
  '{"small": 8000, "medium": 10000, "large": 12000}',
  true,
  true,
  id
FROM pizzerias
WHERE name = 'Pizza Napoli'
LIMIT 1;

INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'Quatre Fromages',
  'Sauce tomate, mozzarella, gorgonzola, parmesan, chèvre',
  10000,
  '/pizza4.avif',
  'Classiques',
  ARRAY['Sauce tomate', 'Mozzarella', 'Gorgonzola', 'Parmesan', 'Chèvre'],
  '{"small": 10000, "medium": 12000, "large": 14000}',
  true,
  true,
  id
FROM pizzerias
WHERE name = 'Pizzeria Roma'
LIMIT 1;

INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'Reine',
  'Sauce tomate, mozzarella, jambon, champignons',
  9000,
  '/pizza2.avif',
  'Classiques',
  ARRAY['Sauce tomate', 'Mozzarella', 'Jambon', 'Champignons'],
  '{"small": 9000, "medium": 11000, "large": 13000}',
  true,
  false,
  id
FROM pizzerias
WHERE name = 'Pizza Hut Glass'
LIMIT 1;

INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'Calzone',
  'Sauce tomate, mozzarella, jambon, champignons, œuf',
  11000,
  '/pizza3.avif',
  'Spécialités',
  ARRAY['Sauce tomate', 'Mozzarella', 'Jambon', 'Champignons', 'Œuf'],
  '{"small": 11000, "medium": 13000, "large": 15000}',
  false,
  false,
  id
FROM pizzerias
WHERE name = 'Mamma Mia Akanda'
LIMIT 1;

INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'Végétarienne',
  'Sauce tomate, mozzarella, poivrons, oignons, champignons, olives',
  9500,
  '/pizza5.avif',
  'Végétariennes',
  ARRAY['Sauce tomate', 'Mozzarella', 'Poivrons', 'Oignons', 'Champignons', 'Olives'],
  '{"small": 9500, "medium": 11500, "large": 13500}',
  false,
  true,
  id
FROM pizzerias
WHERE name = 'La Sauce Creole'
LIMIT 1;

INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'Carnivore',
  'Sauce tomate, mozzarella, pepperoni, saucisse, bacon, bœuf haché',
  12000,
  '/pizza6.avif',
  'Carnivores',
  ARRAY['Sauce tomate', 'Mozzarella', 'Pepperoni', 'Saucisse', 'Bacon', 'Bœuf haché'],
  '{"small": 12000, "medium": 14000, "large": 16000}',
  true,
  false,
  id
FROM pizzerias
WHERE name = 'Tivoli'
LIMIT 1;

INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'Hawaïenne',
  'Sauce tomate, mozzarella, jambon, ananas',
  9500,
  '/pizza7.avif',
  'Classiques',
  ARRAY['Sauce tomate', 'Mozzarella', 'Jambon', 'Ananas'],
  '{"small": 9500, "medium": 11500, "large": 13500}',
  false,
  false,
  id
FROM pizzerias
WHERE name = 'Yeunil'
LIMIT 1;

-- Ajouter des pizzas supplémentaires pour chaque pizzeria
INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'Regina',
  'Sauce tomate, mozzarella, jambon, champignons, olives',
  9500,
  '/pizza8.avif',
  'Classiques',
  ARRAY['Sauce tomate', 'Mozzarella', 'Jambon', 'Champignons', 'Olives'],
  '{"small": 9500, "medium": 11500, "large": 13500}',
  false,
  false,
  id
FROM pizzerias
WHERE name = 'Pizza Napoli'
LIMIT 1;

INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'Napolitaine',
  'Sauce tomate, mozzarella, anchois, olives, câpres',
  10000,
  '/pizza9.avif',
  'Classiques',
  ARRAY['Sauce tomate', 'Mozzarella', 'Anchois', 'Olives', 'Câpres'],
  '{"small": 10000, "medium": 12000, "large": 14000}',
  false,
  false,
  id
FROM pizzerias
WHERE name = 'Pizzeria Roma'
LIMIT 1;

INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'Supreme',
  'Sauce tomate, mozzarella, pepperoni, saucisse, poivrons, oignons, champignons',
  11000,
  '/pizza10.avif',
  'Carnivores',
  ARRAY['Sauce tomate', 'Mozzarella', 'Pepperoni', 'Saucisse', 'Poivrons', 'Oignons', 'Champignons'],
  '{"small": 11000, "medium": 13000, "large": 15000}',
  true,
  false,
  id
FROM pizzerias
WHERE name = 'Pizza Hut Glass'
LIMIT 1;

INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'Fruits de Mer',
  'Sauce tomate, mozzarella, crevettes, moules, calamars',
  13000,
  '/pizza11.avif',
  'Spécialités',
  ARRAY['Sauce tomate', 'Mozzarella', 'Crevettes', 'Moules', 'Calamars'],
  '{"small": 13000, "medium": 15000, "large": 17000}',
  false,
  false,
  id
FROM pizzerias
WHERE name = 'Mamma Mia Akanda'
LIMIT 1;

INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'Méditerranéenne',
  'Sauce tomate, mozzarella, thon, oignons, olives, poivrons',
  10500,
  '/pizza13.avif',
  'Spécialités',
  ARRAY['Sauce tomate', 'Mozzarella', 'Thon', 'Oignons', 'Olives', 'Poivrons'],
  '{"small": 10500, "medium": 12500, "large": 14500}',
  false,
  false,
  id
FROM pizzerias
WHERE name = 'La Sauce Creole'
LIMIT 1;

INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'BBQ Chicken',
  'Sauce BBQ, mozzarella, poulet grillé, oignons, poivrons',
  11500,
  '/pizza14.avif',
  'Spécialités',
  ARRAY['Sauce BBQ', 'Mozzarella', 'Poulet grillé', 'Oignons', 'Poivrons'],
  '{"small": 11500, "medium": 13500, "large": 15500}',
  true,
  false,
  id
FROM pizzerias
WHERE name = 'Tivoli'
LIMIT 1;

INSERT INTO pizzas (name, description, price, image, category, ingredients, sizes, is_popular, is_vegetarian, pizzeria_id)
SELECT
  'Buffalo Chicken',
  'Sauce Buffalo, mozzarella, poulet, oignons, poivrons',
  11000,
  '/pizza15.avif',
  'Spécialités',
  ARRAY['Sauce Buffalo', 'Mozzarella', 'Poulet', 'Oignons', 'Poivrons'],
  '{"small": 11000, "medium": 13000, "large": 15000}',
  false,
  false,
  id
FROM pizzerias
WHERE name = 'Yeunil'
LIMIT 1;

-- Insert test data into orders table
INSERT INTO orders (customer_id, pizzeria_id, total, status, order_date, order_time, delivery_fee, payment_method)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  id,
  15000,
  'confirmed',
  CURRENT_DATE - INTERVAL '1 day',
  '14:30:00',
  2000,
  'card'
FROM pizzerias
WHERE name = 'Pizza Napoli'
LIMIT 1;

INSERT INTO orders (customer_id, pizzeria_id, total, status, order_date, order_time, delivery_fee, payment_method)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  id,
  20000,
  'preparing',
  CURRENT_DATE,
  '19:15:00',
  2000,
  'cash'
FROM pizzerias
WHERE name = 'Pizzeria Roma'
LIMIT 1;

-- Insert test data into order_items table
INSERT INTO order_items (order_id, name, quantity, price)
SELECT
  o.id,
  'Margherita',
  2,
  6500
FROM orders o
JOIN pizzerias p ON o.pizzeria_id = p.id
WHERE p.name = 'Pizza Napoli'
LIMIT 1;

INSERT INTO order_items (order_id, name, quantity, price)
SELECT
  o.id,
  'Quatre Fromages',
  1,
  10000
FROM orders o
JOIN pizzerias p ON o.pizzeria_id = p.id
WHERE p.name = 'Pizzeria Roma'
LIMIT 1;

INSERT INTO order_items (order_id, name, quantity, price)
SELECT
  o.id,
  'Reine',
  1,
  8000
FROM orders o
JOIN pizzerias p ON o.pizzeria_id = p.id
WHERE p.name = 'Pizzeria Roma'
LIMIT 1; 