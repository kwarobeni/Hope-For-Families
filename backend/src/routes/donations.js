const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { createOrder, captureOrder } = require('../utils/paypal');
const { notifyCharity, sendEmail } = require('../utils/email');

const router = express.Router();

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 10000;

// Step 1: client asks us to create a PayPal order. Amount is set/validated server-side.
router.post('/create-order', async (req, res) => {
  const { amount, currency = 'GBP' } = req.body;
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount < MIN_AMOUNT || numericAmount > MAX_AMOUNT) {
    return res.status(400).json({ error: `Amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT}` });
  }

  const order = await createOrder(numericAmount, currency);

  await pool.query(
    'INSERT INTO donations (paypal_order_id, amount, currency, status) VALUES (?, ?, ?, ?)',
    [order.id, numericAmount, currency, 'created']
  );

  res.status(201).json({ id: order.id });
});

// Step 2: client approved the order in the PayPal popup; we capture payment and store donor details.
router.post('/capture-order', async (req, res) => {
  const { orderId, donor_name, donor_email, gift_aid, gift_aid_address } = req.body;
  if (!orderId) return res.status(400).json({ error: 'orderId is required' });

  const capture = await captureOrder(orderId);
  const completed = capture.status === 'COMPLETED';

  await pool.query(
    `UPDATE donations
     SET status = ?, donor_name = ?, donor_email = ?, gift_aid = ?, gift_aid_address = ?
     WHERE paypal_order_id = ?`,
    [completed ? 'completed' : 'failed', donor_name || null, donor_email || null, gift_aid ? 1 : 0, gift_aid_address || null, orderId]
  );

  if (completed) {
    const [rows] = await pool.query('SELECT * FROM donations WHERE paypal_order_id = ?', [orderId]);
    const donation = rows[0];
    if (donor_email) {
      await sendEmail({
        to: donor_email,
        subject: 'Thank you for your donation to Hope For Families',
        html: `<p>Thank you${donor_name ? ` ${donor_name}` : ''} for your generous donation of ${donation.currency} ${donation.amount}. Your support makes a real difference.</p>`,
      });
    }
    await notifyCharity(
      'New donation received',
      `<p>${donor_name || 'Anonymous'} (${donor_email || 'no email'}) donated ${donation.currency} ${donation.amount}. Gift Aid: ${gift_aid ? 'Yes' : 'No'}.</p>`
    );
  }

  res.json({ status: capture.status });
});

router.get('/', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM donations ORDER BY created_at DESC');
  res.json(rows);
});

// Gift Aid export for HMRC claims
router.get('/gift-aid-export', requireAuth, requireRole('super_admin', 'editor'), async (req, res) => {
  const [rows] = await pool.query(
    "SELECT donor_name, donor_email, gift_aid_address, amount, currency, created_at FROM donations WHERE gift_aid = 1 AND status = 'completed' ORDER BY created_at ASC"
  );
  res.json(rows);
});

module.exports = router;
