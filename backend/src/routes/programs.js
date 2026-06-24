const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const COLUMNS = ['initiative_id', 'title', 'slug', 'description', 'image', 'sort_order'];

router.get('/', async (req, res) => {
  const { initiative_id } = req.query;
  const [rows] = initiative_id
    ? await pool.query('SELECT * FROM programs WHERE initiative_id = ? ORDER BY sort_order ASC', [initiative_id])
    : await pool.query('SELECT * FROM programs ORDER BY sort_order ASC');
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM programs WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.post('/', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const fields = COLUMNS.filter((c) => req.body[c] !== undefined);
  if (fields.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
  const values = fields.map((c) => req.body[c]);
  const [result] = await pool.query(
    `INSERT INTO programs (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
    values
  );
  const [rows] = await pool.query('SELECT * FROM programs WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

router.put('/:id', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const fields = COLUMNS.filter((c) => req.body[c] !== undefined);
  if (fields.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
  const values = fields.map((c) => req.body[c]);
  await pool.query(
    `UPDATE programs SET ${fields.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
    [...values, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM programs WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.delete('/:id', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  await pool.query('DELETE FROM programs WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

module.exports = router;
