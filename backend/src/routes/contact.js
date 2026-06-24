const express = require('express');
const { notifyCharity, sendEmail } = require('../utils/email');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  await notifyCharity('New contact form message', `<p>${name} (${email}) wrote:</p><p>${message}</p>`);
  await sendEmail({
    to: email,
    subject: 'We received your message — Hope For Families',
    html: `<p>Hi ${name},</p><p>Thank you for getting in touch with Hope For Families. Our team will respond as soon as possible.</p>`,
  });

  res.status(201).json({ message: 'Sent' });
});

module.exports = router;
