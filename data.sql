DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS channels;

CREATE TABLE channels (
  id TEXT PRIMARY KEY
);

CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES channels,
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  date DATE NOT NULL
);

create TABLE exercises (
  id SERIAL PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES channels,
  url TEXT NOT NULL,
  date DATE NOT NULL
)