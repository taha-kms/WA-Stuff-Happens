// imports
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

// ✅ Allow frontend origin & session credentials
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// 🛠️ Enable JSON parsing and sessions (you’ll expand this later)
app.use(express.json());

// Sample route to test
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
