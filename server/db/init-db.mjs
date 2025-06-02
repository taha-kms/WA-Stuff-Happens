import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'stuffhappens.sqlite');

const init = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      bad_luck_index REAL NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      start_time TEXT NOT NULL,
      end_time TEXT,
      result TEXT CHECK(result IN ('win', 'lose')),
      mode TEXT NOT NULL CHECK(mode IN ('demo', 'registered')),
      abandoned INTEGER NOT NULL DEFAULT 0 CHECK(abandoned IN (0, 1)),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS game_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      card_id INTEGER NOT NULL,
      round INTEGER NOT NULL,
      correct INTEGER NOT NULL CHECK (correct IN (0, 1)),
      FOREIGN KEY (game_id) REFERENCES games(id),
      FOREIGN KEY (card_id) REFERENCES cards(id)
    );
  `);

  console.log('✅ Database initialized at', dbPath);
  await db.close();
};

init();
