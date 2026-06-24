const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

// Builds a basic REST CRUD router for a single MySQL table.
// Public GET endpoints; mutations require an authenticated admin/editor.
function crudRouter({ table, columns, orderBy = 'id ASC', publicRead = true }) {
  const router = express.Router();

  const listHandler = async (req, res) => {
    const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
    res.json(rows);
  };
  const getHandler = async (req, res) => {
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  };

  if (publicRead) {
    router.get('/', listHandler);
    router.get('/:id', getHandler);
  } else {
    router.get('/', requireAuth, listHandler);
    router.get('/:id', requireAuth, getHandler);
  }

  router.post('/', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
    const fields = columns.filter((c) => req.body[c] !== undefined);
    if (fields.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
    const values = fields.map((c) => req.body[c]);
    const placeholders = fields.map(() => '?').join(', ');
    const [result] = await pool.query(
      `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  });

  router.put('/:id', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
    const fields = columns.filter((c) => req.body[c] !== undefined);
    if (fields.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
    const assignments = fields.map((c) => `${c} = ?`).join(', ');
    const values = fields.map((c) => req.body[c]);
    await pool.query(`UPDATE ${table} SET ${assignments} WHERE id = ?`, [...values, req.params.id]);
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  });

  router.delete('/:id', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
    await pool.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
    res.status(204).end();
  });

  return router;
}

module.exports = { crudRouter };
