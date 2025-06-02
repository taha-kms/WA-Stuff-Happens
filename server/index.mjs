// Top of file
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'db/stuffhappens.sqlite');

const app = express();
const port = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: 'exam-session-secret',
  resave: false,
  saveUninitialized: false
}));


// Existing route
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Server start
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
