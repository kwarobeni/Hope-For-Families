const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { crudRouter } = require('../utils/crudFactory');

const router = express.Router();

// Public: initiative with its nested programs (used by /programs/[slug] pages)
router.get('/:slug/full', async (req, res) => {
  const [initiatives] = await pool.query('SELECT * FROM initiatives WHERE slug = ?', [req.params.slug]);
  const initiative = initiatives[0];
  if (!initiative) return res.status(404).json({ error: 'Not found' });
  const [programs] = await pool.query(
    'SELECT * FROM programs WHERE initiative_id = ? ORDER BY sort_order ASC',
    [initiative.id]
  );
  res.json({ ...initiative, programs });
});

router.use(
  '/',
  crudRouter({
    table: 'initiatives',
    columns: ['title', 'slug', 'tagline', 'description', 'image', 'sort_order'],
    orderBy: 'sort_order ASC',
  })
);

module.exports = router;
