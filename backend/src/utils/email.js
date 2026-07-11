const nodemailer = require('nodemailer');

// --- SMTP transport (Hostinger email hosting) ---
// Set these env vars in Hostinger Node.js config:
//   SMTP_HOST=mail.hopeforfamiliescharity.org.uk
//   SMTP_PORT=465
//   SMTP_USER=noreply@hopeforfamiliescharity.org.uk
//   SMTP_PASS=<your email password>
//   EMAIL_FROM=noreply@hopeforfamiliescharity.org.uk
//   CHARITY_NOTIFICATION_EMAIL=kelechioliora@gmail.com
let smtpTransport = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  smtpTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// --- Resend fallback (if RESEND_API_KEY is set instead) ---
let resendClient = null;
if (process.env.RESEND_API_KEY) {
  try {
    const { Resend } = require('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
  } catch (_) { /* resend package not installed */ }
}

async function sendEmail({ to, subject, html }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@hopeforfamiliescharity.org.uk';

  if (smtpTransport) {
    await smtpTransport.sendMail({ from: `Hope For Families <${from}>`, to, subject, html });
    return;
  }

  if (resendClient) {
    await resendClient.emails.send({ from, to, subject, html });
    return;
  }

  console.warn(`[email] No email transport configured — skipping "${subject}" to ${to}`);
  console.warn('[email] Set SMTP_HOST, SMTP_USER, SMTP_PASS in Hostinger Node.js env vars to enable email.');
}

function notifyCharity(subject, html) {
  const to = process.env.CHARITY_NOTIFICATION_EMAIL;
  if (!to) return Promise.resolve();
  return sendEmail({ to, subject, html });
}

module.exports = { sendEmail, notifyCharity };
