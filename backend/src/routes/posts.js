const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const COLUMNS = ['title', 'slug', 'excerpt', 'content', 'featured_image', 'status', 'author_id', 'published_at'];

// Public list only shows published posts; admin can pass ?all=1 when authenticated.
router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC"
  );
  res.json(rows);
});

router.get('/admin', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM blog_posts ORDER BY created_at DESC');
  res.json(rows);
});

router.get('/:slug', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM blog_posts WHERE slug = ?', [req.params.slug]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.post('/', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const fields = COLUMNS.filter((c) => req.body[c] !== undefined);
  const values = fields.map((c) => req.body[c]);
  const [result] = await pool.query(
    `INSERT INTO blog_posts (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
    values
  );
  const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

router.put('/:id', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const fields = COLUMNS.filter((c) => req.body[c] !== undefined);
  if (fields.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
  const values = fields.map((c) => req.body[c]);
  await pool.query(
    `UPDATE blog_posts SET ${fields.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
    [...values, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.delete('/:id', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  await pool.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

module.exports = router;
