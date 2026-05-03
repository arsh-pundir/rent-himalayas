CREATE DATABASE IF NOT EXISTS rent_himalayas;
USE rent_himalayas;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  location VARCHAR(120) NOT NULL,
  price INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO properties (name, location, price)
SELECT * FROM (
  SELECT 'Cedar Ridge Cabin', 'Manali', 2800
  UNION ALL SELECT 'Apple Orchard Loft', 'Shimla', 2300
  UNION ALL SELECT 'Riverstone Retreat', 'Tirthan Valley', 1950
) seed
WHERE NOT EXISTS (SELECT 1 FROM properties);
