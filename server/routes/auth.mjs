import express from 'express';
import passport from 'passport';

const router = express.Router();

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Login successful', user: req.user });
});

router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: 'Logout error' });
    res.json({ message: 'Logged out' });
  });
});

router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.json(null);
  }
});

export default router;
