import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'stuffhappens.sqlite');

const init = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      bad_luck_index REAL NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER ,
      start_time TEXT NOT NULL,
      end_time TEXT,
      status TEXT CHECK(status IN ('won', 'lost', 'demo')) NOT NULL,
      wrong_guesses INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS game_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      card_id INTEGER NOT NULL,
      round_number INTEGER NOT NULL,
      guessed_correctly INTEGER NOT NULL CHECK(guessed_correctly IN (0, 1)),
      FOREIGN KEY(game_id) REFERENCES games(id),
      FOREIGN KEY(card_id) REFERENCES cards(id)
    );
  `);

  console.log('Database initialized.');
  await db.close();
};

init();
