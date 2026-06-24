const express = require('express');
const pool = require('../config/db');
const { verifyWebhookSignature } = require('../utils/paypal');

const router = express.Router();

// Backstop in case the client-driven capture-order call never completes (e.g. tab closed mid-flow).
router.post('/paypal', async (req, res) => {
  const verified = await verifyWebhookSignature(req.headers, req.body);
  if (!verified) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const event = req.body;
  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
    if (orderId) {
      await pool.query("UPDATE donations SET status = 'completed' WHERE paypal_order_id = ? AND status != 'completed'", [orderId]);
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;
