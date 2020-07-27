DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS problems;
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

create TABLE problems (
  id SERIAL PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES channels,
  url TEXT NOT NULL,
  description TEXT,
  added_by TEXT NOT NULL,
  date DATE NOT NULL
);

INSERT INTO channels (id) VALUES ('G014WNBMW1X');