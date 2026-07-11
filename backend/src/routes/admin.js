const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/admin/rebuild
// Triggers the deploy-frontend GitHub Actions workflow via workflow_dispatch.
// Requires GITHUB_PAT env var (a GitHub Personal Access Token with `workflow` scope).
// Also requires GITHUB_OWNER and GITHUB_REPO env vars (defaulting to kwarobeni / Hope-For-Families).
router.post('/rebuild', requireAuth, requireRole('super_admin'), async (req, res) => {
  const token = process.env.GITHUB_PAT;
  if (!token) {
    return res.status(503).json({
      error: 'Rebuild not configured. Set GITHUB_PAT in Hostinger environment variables.',
    });
  }

  const owner = process.env.GITHUB_OWNER || 'kwarobeni';
  const repo = process.env.GITHUB_REPO || 'Hope-For-Families';
  const workflow = 'deploy-frontend.yml';

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ ref: 'main' }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error('GitHub dispatch failed:', response.status, text);
    return res.status(500).json({ error: 'Failed to trigger rebuild. Check GITHUB_PAT permissions.' });
  }

  res.json({ message: 'Rebuild triggered. The live site will update in 2–3 minutes.' });
});

module.exports = router;
