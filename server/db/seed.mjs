import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'stuffhappens.sqlite');
const saltRounds = 10;

const hashPassword = async (plain) => await bcrypt.hash(plain, saltRounds);

const cardTitles = [
  "Missed the final exam by oversleeping",
  "Laptop crashes the night before thesis submission",
  "Group project member ghosts you",
  "Fire alarm goes off during oral presentation",
  "Cafeteria runs out of food before your turn",
  "Accidentally email your professor 'Love you'",
  "Get caught cheating — wrongly",
  "Wi-Fi drops during online exam",
  "Roommate throws a party the night before your exam",
  "You walk into the wrong class and sit for 30 minutes",
  "You submit the wrong assignment file",
  "Internship interview happens during your only exam",
  "Lose your student ID before an important exam",
  "You lock yourself out of the dorm in a towel",
  "All-night study, sleep through the exam anyway",
  "Final exam has topics never covered in class",
  "Laptop gets stolen from the library",
  "You realize you’ve been going to the wrong class all semester",
  "You call your professor 'Dad' by mistake",
  "Alarm fails to ring — daylight saving time",
  "Your thesis file gets corrupted",
  "You accidentally plagiarize and get flagged",
  "You trip onstage during your presentation",
  "Spill coffee all over your only copy of notes",
  "You miss a pass/fail deadline by one minute",
  "Class gets moved and you never notice",
  "You get food poisoning on the day of a big exam",
  "Dorm neighbor practices violin at 3am",
  "You say 'I don’t care' out loud during a recorded lecture",
  "You write the wrong subject in the answer sheet",
  "You answer all questions on the back side of the paper",
  "You fail a class by 0.1%",
  "Campus printer breaks during thesis printing",
  "You accidentally unsubmit an assignment and miss deadline",
  "Your glasses break mid-exam",
  "Lose access to your email account for a week",
  "You throw up during an oral exam",
  "You pay double rent by accident",
  "You get locked in the library after hours",
  "A raccoon steals your lunch in front of others",
  "You enter a professor’s office while they’re changing",
  "You get caught sleep-talking in a silent study room",
  "You trip on your gown at graduation",
  "You accidentally send a meme to your professor",
  "Your professor misplaces your exam",
  "Your flatmate eats your last pre-exam snack",
  "Class gets cancelled after you commute 2 hours",
  "You realize your exam was yesterday",
  "You get wrongly accused of stealing books",
  "You cry during a test and your professor comforts the wrong person"
];

const seed = async () => {
  const db = await open({ filename: dbPath, driver: sqlite3.Database });

  console.log("🧹 Clearing old data...");
  await db.exec(`DELETE FROM game_cards; DELETE FROM games; DELETE FROM cards; DELETE FROM users;`);

  console.log("🔐 Seeding users...");
  const password1 = await hashPassword('test123');
  const password2 = await hashPassword('guest123');

  const user1 = await db.run(
    `INSERT INTO users (email, password_hash) VALUES (?, ?)`,
    ['player1@example.com', password1]
  );

  await db.run(
    `INSERT INTO users (email, password_hash) VALUES (?, ?)`,
    ['guest@example.com', password2]
  );

  const userId = user1.lastID;

  console.log("🃏 Inserting 50 horrible university life cards...");
  for (let i = 0; i < cardTitles.length; i++) {
    const title = cardTitles[i];
    const imageUrl = `https://via.placeholder.com/300x200.png?text=Card+${i + 1}`;
    const badLuckIndex = (i + 1) * 1.5; // 1.5, 3.0, ..., 75.0

    await db.run(
      `INSERT INTO cards (title, image_url, bad_luck_index) VALUES (?, ?, ?)`,
      [title, imageUrl, badLuckIndex.toFixed(1)]
    );
  }

  console.log("🎮 Creating one 'win' game for player1...");
  const now = new Date();
  const start = now.toISOString();
  const end = new Date(now.getTime() + 1000 * 60 * 5).toISOString(); // +5 minutes

  const game = await db.run(
    `INSERT INTO games (user_id, start_time, end_time, result, mode, abandoned)
     VALUES (?, ?, ?, 'win', 'registered', 0)`,
    [userId, start, end]
  );
  const gameId = game.lastID;

  for (let i = 0; i < 6; i++) {
    await db.run(
      `INSERT INTO game_cards (game_id, card_id, round, correct)
       VALUES (?, ?, ?, 1)`,
      [gameId, i + 1, i + 1]
    );
  }

  console.log("✅ Seeding complete.");
  await db.close();
};

seed();
