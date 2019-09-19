DROP DATABASE IF EXISTS city;

CREATE DATABASE city;

\c city;

DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  city_name VARCHAR(255),
  city_address VARCHAR(255),
  latitude FLOAT,
  longitude FLOAT
);

INSERT INTO locations (city_name, city_address, latitude, longitude) VALUES (
  'seattle',
  'Seattle, WA, USA',
  47.6062095,
  -122.3320708
);
