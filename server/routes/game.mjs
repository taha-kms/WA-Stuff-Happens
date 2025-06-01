import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const router = express.Router();

const dbPromise = open({
  filename: "./db/stuffhappens.sqlite",
  driver: sqlite3.Database,
});

// Utility to select 3 random cards
async function getRandomCards(db, count = 3) {
  return await db.all(`SELECT * FROM cards ORDER BY RANDOM() LIMIT ?`, count);
}

router.post("/game", async (req, res) => {
  const user = req.user;
  const isDemo = req.body?.mode === "demo";

  try {
    const db = await dbPromise;
    const startTime = new Date().toISOString();
    const status = isDemo ? "demo" : "ongoing";

    // Create the game
    const result = await db.run(
      `INSERT INTO games (user_id, start_time, status, wrong_guesses) VALUES (?, ?, ?, ?)`,
      [isDemo ? null : user?.id, startTime, status, 0]
    );
    const gameId = result.lastID;

    // Get 3 random starting cards
    const cards = await getRandomCards(db, 3);

    // Save those cards as starting hand
    for (let i = 0; i < cards.length; i++) {
      await db.run(
        `INSERT INTO game_cards (game_id, card_id, round_number, guessed_correctly)
         VALUES (?, ?, ?, ?)`,
        [gameId, cards[i].id, i + 1, 1] // starting hand is "guessed correctly"
      );
    }

    res.json({
      gameId,
      startingCards: cards,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start game" });
  }
});

// POST /api/game/next
router.post("/game/next", async (req, res) => {
  const db = await dbPromise;
  const { gameId } = req.body;

  if (!gameId) return res.status(400).json({ error: "Missing gameId" });

  try {
    // 1. Get all card_ids already used in this game
    const used = await db.all(
      `
      SELECT card_id FROM game_cards WHERE game_id = ?
    `,
      [gameId]
    );

    const usedIds = used.map((row) => row.card_id);

    // 2. Get a new unused card
    const placeholders = usedIds.map(() => "?").join(",") || "NULL"; // handle empty array
    const newCard = await db.get(
      `
      SELECT * FROM cards
      WHERE id NOT IN (${placeholders})
      ORDER BY RANDOM()
      LIMIT 1
    `,
      usedIds
    );

    if (!newCard) {
      return res.status(404).json({ error: "No more cards available" });
    }

    res.json({
      card: {
        id: newCard.id,
        title: newCard.title,
        image_url: newCard.image_url,
      },
    });
  } catch (err) {
    console.error("Error fetching next card:", err);
    res.status(500).json({ error: "Failed to fetch next card" });
  }
});

// POST /api/guess
router.post("/guess", async (req, res) => {
  const db = await dbPromise;
  const { gameId, cardId, position } = req.body;

  if (!gameId || !cardId || position === undefined) {
    return res
      .status(400)
      .json({ error: "Missing gameId, cardId, or position" });
  }

  try {
    // 1. Get player's current cards sorted by bad_luck_index
    const existing = await db.all(
      `
      SELECT c.*
      FROM game_cards gc
      JOIN cards c ON gc.card_id = c.id
      WHERE gc.game_id = ? AND gc.guessed_correctly = 1
      ORDER BY c.bad_luck_index ASC
    `,
      [gameId]
    );

    // 2. Get the card to be guessed (actual index hidden from frontend)
    const newCard = await db.get(`SELECT * FROM cards WHERE id = ?`, [cardId]);
    if (!newCard) return res.status(404).json({ error: "Card not found" });

    // 3. Determine actual insert position
    const allIndexes = existing.map((c) => c.bad_luck_index);
    let actualPos = allIndexes.findIndex((idx) => newCard.bad_luck_index < idx);
    if (actualPos === -1) actualPos = allIndexes.length;

    const correct = actualPos === position;

    // 4. Save into game_cards
    const round = existing.length + 1;
    await db.run(
      `
      INSERT INTO game_cards (game_id, card_id, round_number, guessed_correctly)
      VALUES (?, ?, ?, ?)
    `,
      [gameId, cardId, round, correct ? 1 : 0]
    );

    // 5. If incorrect, increment wrong guesses
    if (!correct) {
      await db.run(
        `
        UPDATE games SET wrong_guesses = wrong_guesses + 1 WHERE id = ?
      `,
        [gameId]
      );
    }

    // 6. Prepare updated card list
    const updated = [...existing, newCard].sort(
      (a, b) => a.bad_luck_index - b.bad_luck_index
    );

    res.json({
      correct,
      actualPosition: actualPos,
      card: {
        id: newCard.id,
        title: newCard.title,
        image_url: newCard.image_url,
        bad_luck_index: newCard.bad_luck_index,
      },
      updatedCards: updated,
    });
  } catch (err) {
    console.error("Error processing guess:", err);
    res.status(500).json({ error: "Failed to process guess" });
  }
});

// GET /api/game/:id
router.get("/game/:id", async (req, res) => {
  const db = await dbPromise;
  const gameId = req.params.id;

  try {
    // 1. Get game metadata
    const game = await db.get(`SELECT * FROM games WHERE id = ?`, [gameId]);
    if (!game) return res.status(404).json({ error: "Game not found" });

    // 2. Get all cards from game_cards
    const cards = await db.all(
      `
      SELECT c.id, c.title, c.image_url, c.bad_luck_index,
             gc.round_number, gc.guessed_correctly
      FROM game_cards gc
      JOIN cards c ON gc.card_id = c.id
      WHERE gc.game_id = ?
      ORDER BY gc.round_number ASC
    `,
      [gameId]
    );

    res.json({
      gameId: game.id,
      status: game.status,
      wrongGuesses: game.wrong_guesses,
      rounds: cards,
    });
  } catch (err) {
    console.error("Error fetching game:", err);
    res.status(500).json({ error: "Failed to fetch game state" });
  }
});

export default router;
