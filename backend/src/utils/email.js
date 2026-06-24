const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.warn(`RESEND_API_KEY not set — skipping email "${subject}" to ${to}`);
    return;
  }
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}

function notifyCharity(subject, html) {
  const to = process.env.CHARITY_NOTIFICATION_EMAIL;
  if (!to) return Promise.resolve();
  return sendEmail({ to, subject, html });
}

module.exports = { sendEmail, notifyCharity };
