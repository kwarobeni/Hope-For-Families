const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { notifyCharity, sendEmail } = require('../utils/email');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, phone, area_of_interest, message } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

  const [result] = await pool.query(
    'INSERT INTO volunteer_applications (name, email, phone, area_of_interest, message) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone || null, area_of_interest || null, message || null]
  );

  await notifyCharity(
    'New Volunteer Application',
    `<p>${name} (${email}) applied to volunteer.</p><p>Area of interest: ${area_of_interest || 'N/A'}</p><p>${message || ''}</p>`
  );
  await sendEmail({
    to: email,
    subject: 'Thank you for volunteering with Hope For Families',
    html: `<p>Hi ${name},</p><p>Thank you for your interest in volunteering with Hope For Families. Our team will be in touch soon.</p>`,
  });

  res.status(201).json({ id: result.insertId });
});

router.get('/', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM volunteer_applications ORDER BY created_at DESC');
  res.json(rows);
});

router.put('/:id', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const { status } = req.body;
  if (!['new', 'contacted', 'onboarded', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  await pool.query('UPDATE volunteer_applications SET status = ? WHERE id = ?', [status, req.params.id]);
  const [rows] = await pool.query('SELECT * FROM volunteer_applications WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

module.exports = router;
