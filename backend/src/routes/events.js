const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { notifyCharity, sendEmail } = require('../utils/email');

const router = express.Router();
const COLUMNS = ['title', 'slug', 'description', 'start_at', 'end_at', 'location', 'capacity', 'image', 'registration_open'];

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM events ORDER BY start_at ASC');
  res.json(rows);
});

router.get('/:slug', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM events WHERE slug = ?', [req.params.slug]);
  const event = rows[0];
  if (!event) return res.status(404).json({ error: 'Not found' });
  const [photos] = await pool.query('SELECT * FROM event_photos WHERE event_id = ? ORDER BY sort_order ASC', [event.id]);
  const [[{ count }]] = await pool.query(
    'SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ?',
    [event.id]
  );
  res.json({ ...event, photos, registration_count: count });
});

router.post('/', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const fields = COLUMNS.filter((c) => req.body[c] !== undefined);
  const values = fields.map((c) => req.body[c]);
  const [result] = await pool.query(
    `INSERT INTO events (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
    values
  );
  const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

router.put('/:id', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const fields = COLUMNS.filter((c) => req.body[c] !== undefined);
  if (fields.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
  const values = fields.map((c) => req.body[c]);
  await pool.query(
    `UPDATE events SET ${fields.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
    [...values, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.delete('/:id', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

// --- Registrations ---

router.post('/:id/registrations', async (req, res) => {
  const { name, email, phone, notes } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

  const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
  const event = eventRows[0];
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (!event.registration_open) return res.status(400).json({ error: 'Registration is closed for this event' });

  if (event.capacity) {
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ?',
      [event.id]
    );
    if (count >= event.capacity) {
      return res.status(400).json({ error: 'This event is fully booked' });
    }
  }

  const [result] = await pool.query(
    'INSERT INTO event_registrations (event_id, name, email, phone, notes) VALUES (?, ?, ?, ?, ?)',
    [event.id, name, email, phone || null, notes || null]
  );

  await sendEmail({
    to: email,
    subject: `You're registered: ${event.title}`,
    html: `<p>Hi ${name},</p><p>You're confirmed for <strong>${event.title}</strong>${event.location ? ` at ${event.location}` : ''}.</p>`,
  });
  await notifyCharity(`New registration: ${event.title}`, `<p>${name} (${email}) registered for ${event.title}.</p>`);

  res.status(201).json({ id: result.insertId });
});

router.get('/:id/registrations', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM event_registrations WHERE event_id = ? ORDER BY created_at DESC',
    [req.params.id]
  );
  res.json(rows);
});

// --- Photos ---

router.post('/:id/photos', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const { image, caption, sort_order } = req.body;
  if (!image) return res.status(400).json({ error: 'image is required' });
  const [result] = await pool.query(
    'INSERT INTO event_photos (event_id, image, caption, sort_order) VALUES (?, ?, ?, ?)',
    [req.params.id, image, caption || null, sort_order || 0]
  );
  res.status(201).json({ id: result.insertId });
});

router.delete('/:id/photos/:photoId', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  await pool.query('DELETE FROM event_photos WHERE id = ? AND event_id = ?', [req.params.photoId, req.params.id]);
  res.status(204).end();
});

module.exports = router;
