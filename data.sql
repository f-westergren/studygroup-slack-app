DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS problems;

CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  date DATE NOT NULL
);

create TABLE problems (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  description TEXT,
  added_by TEXT NOT NULL,
  date DATE NOT NULL
);
