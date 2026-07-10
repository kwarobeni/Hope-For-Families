require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const initiativeRoutes = require('./routes/initiatives');
const programRoutes = require('./routes/programs');
const postRoutes = require('./routes/posts');
const eventRoutes = require('./routes/events');
const testimonialRoutes = require('./routes/testimonials');
const volunteerRoutes = require('./routes/volunteers');
const newsletterRoutes = require('./routes/newsletter');
const donationRoutes = require('./routes/donations');
const impactStatsRoutes = require('./routes/impactStats');
const resourceRoutes = require('./routes/resources');
const settingsRoutes = require('./routes/settings');
const webhookRoutes = require('./routes/webhooks');
const uploadRoutes = require('./routes/uploads');
const contactRoutes = require('./routes/contact');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : '*' }));
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/initiatives', initiativeRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/impact-stats', impactStatsRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/contact', contactRoutes);

// Serve the admin Vite SPA at /admin/
// On Hostinger the Vite build lands at nodejs/dist/ (two levels up from this file)
const adminDist = process.env.ADMIN_DIST || path.join(__dirname, '..', '..', 'dist');
if (fs.existsSync(adminDist)) {
  app.use('/admin', express.static(adminDist));
  app.get('/admin/*', (req, res) => res.sendFile(path.join(adminDist, 'index.html')));
}

// Serve the Astro static frontend
// Falls back to ../../../public_html/frontend relative to nodejs/backend/src/
const frontendDist = process.env.FRONTEND_DIST ||
  path.join(__dirname, '..', '..', '..', 'public_html', 'frontend');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    const html = path.join(frontendDist, '404.html');
    res.status(404).sendFile(fs.existsSync(html) ? html : path.join(frontendDist, 'index.html'));
  });
} else {
  app.use((req, res) => res.status(404).json({ error: 'Not found', frontendDist }));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Hope For Families API listening on port ${port}`));
