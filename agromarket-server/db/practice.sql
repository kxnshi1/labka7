SELECT * FROM products;
SELECT name,price FROM products WHERE price<1000 ORDER BY price DESC;
SELECT name FROM products WHERE name ILIKE '%мол%';
SELECT category,COUNT(*) AS cnt,ROUND(AVG(price)) AS avg_price FROM products GROUP BY category;
SELECT * FROM products ORDER BY price DESC LIMIT 1;
INSERT INTO products(name,price) VALUES('Тестовый товар',100) RETURNING *;
UPDATE products SET price=150 WHERE name='Тестовый товар' RETURNING *;
DELETE FROM products WHERE name='Тестовый товар';
-- Ошибки для отдельного эксперимента:
-- INSERT INTO products(name,price) VALUES('Брак',-5);
-- INSERT INTO products(price) VALUES(100);
-- INSERT INTO orders(product_id,name,email,quantity) VALUES(9999,'Тест','t@t.kz',20);
