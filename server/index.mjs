import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { initialize } from './auth/passport-config.mjs';
import authRoutes from './routes/auth.mjs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
  secret: 'keyboard-cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());





// DB functions

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'db', 'stuffhappens.sqlite');

const db = await open({ filename: dbPath, driver: sqlite3.Database });

const getUserByEmail = async (email) => {
  return await db.get('SELECT * FROM users WHERE email = ?', email);
};
const getUserById = async (id) => {
  return await db.get('SELECT * FROM users WHERE id = ?', id);
};

// Initialize Passport
initialize(passport, getUserByEmail, getUserById);

// Routes
app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Server running' });
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
