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