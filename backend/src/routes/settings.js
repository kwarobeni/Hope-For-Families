const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT `key`, value FROM site_settings');
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  res.json(settings);
});

router.put('/', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const entries = Object.entries(req.body || {});
  for (const [key, value] of entries) {
    await pool.query(
      'INSERT INTO site_settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
      [key, value]
    );
  }
  const [rows] = await pool.query('SELECT `key`, value FROM site_settings');
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

module.exports = router;
