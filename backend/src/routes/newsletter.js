const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    await pool.query('INSERT INTO newsletter_subscribers (email) VALUES (?)', [email]);
    res.status(201).json({ message: 'Subscribed' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(200).json({ message: 'Already subscribed' });
    }
    throw err;
  }
});

router.get('/', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC');
  res.json(rows);
});

router.delete('/:id', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  await pool.query('DELETE FROM newsletter_subscribers WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

module.exports = router;
