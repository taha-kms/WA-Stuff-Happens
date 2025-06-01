import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'stuffhappens.sqlite');

const hashPassword = async (plain) => {
  const saltRounds = 10;
  return await bcrypt.hash(plain, saltRounds);
};

const seed = async () => {
  const db = await open({ filename: dbPath, driver: sqlite3.Database });

  console.log("🔄 Seeding users...");
  await db.run(`DELETE FROM users`);
  const password1 = await hashPassword('test123');
  const password2 = await hashPassword('guest123');
  const user1 = await db.run(
    `INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)`,
    ['alice@example.com', password1, 'Alice']
  );
  const user2 = await db.run(
    `INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)`,
    ['bob@example.com', password2, 'Bob']
  );

  console.log("🎓 Seeding student life cards...");
  await db.run(`DELETE FROM cards`);
  const studentCards = [
    "You study all night… for the wrong exam",
    "Your laptop crashes right before submission",
    "You call the professor 'mom'",
    "You forget your presentation day and show up late",
    "You oversleep and miss the final exam",
    "You show up to class in pajamas by mistake",
    "You realize the group project is due today",
    "Your alarm doesn’t go off on exam day",
    "You lose your USB with all your coursework",
    "You answer the exam question — from last year",
    "You get locked out of your dorm with wet hair",
    "You walk into the wrong classroom and stay too long",
    "You accidentally submit a meme instead of your essay",
    "You sneeze on your professor during office hours",
    "You spill coffee on your only printed copy",
    "You join a Zoom class — with your mic on and no pants",
    "You sit in your professor’s seat on the first day",
    "You ask a question… and they just answered it",
    "You skip class — and get called out in the email summary",
    "You lose your student ID right before an exam",
    "You forget to hit 'Submit' on the online portal",
    "Your Wi-Fi cuts out during an online quiz",
    "You confuse two assignments and submit both wrong",
    "Your laptop updates itself during the test",
    "You show up on a holiday thinking there’s class",
    "You plagiarize by accident using your own notes",
    "You bring the wrong notes to the final exam",
    "You accidentally call your prof by their first name",
    "You sleep through a group presentation",
    "You realize you wrote the essay in the wrong language",
    "You cry during the test — and the prof notices",
    "You submit your resume with a typo in your name",
    "You ask a prof for help... and they’re not your prof",
    "You mix up the Zoom links and join a stranger’s class",
    "You drop your lunch in the library",
    "You turn in an assignment late due to a timezone mix-up",
    "You’re called to present... and you didn’t prepare",
    "Your computer fan is louder than your professor’s voice",
    "You show up drunk to a morning lecture (accidentally)",
    "You register for a course that was canceled months ago",
    "You prepare for a midterm… that already happened",
    "Your project file gets corrupted before submission",
    "You text a meme to your prof instead of your group chat",
    "You join the wrong breakout room and stay for 10 mins",
    "You mispronounce every keyword during your defense",
    "You upload the wrong file — 3 minutes before deadline",
    "You forget your login and miss registration",
    "You misread the assignment and do double the work",
    "Your mouse dies during a timed quiz",
    "You realize you’re in the wrong major — in your final year"
  ];

  let index = 1.0;
  for (let i = 0; i < studentCards.length; i++) {
    await db.run(
      `INSERT INTO cards (title, image_url, bad_luck_index) VALUES (?, ?, ?)`,
      [
        studentCards[i],
        `https://via.placeholder.com/150?text=Card+${i + 1}`,
        index.toFixed(1)
      ]
    );
    index += 1.9;
  }

  console.log("🎮 Creating a finished game...");
  await db.run(`DELETE FROM games`);
  await db.run(`DELETE FROM game_cards`);
  const start = new Date().toISOString();
  const end = new Date(Date.now() + 300000).toISOString(); // +5 min

  const game = await db.run(
    `INSERT INTO games (user_id, start_time, end_time, status, wrong_guesses) VALUES (?, ?, ?, ?, ?)`,
    [user1.lastID, start, end, 'won', 1]
  );

  for (let round = 1; round <= 6; round++) {
    await db.run(
      `INSERT INTO game_cards (game_id, card_id, round_number, guessed_correctly) VALUES (?, ?, ?, ?)`,
      [game.lastID, round, round, round !== 3 ? 1 : 0]
    );
  }

  console.log("✅ Seeding completed.");
  await db.close();
};

seed();
