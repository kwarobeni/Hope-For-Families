# Hope For Families — Website

Charity: Hope For Families (SC053715), Dundee, Scotland.

Monorepo with three apps:

- `frontend/` — Astro + React islands + Tailwind. Public site, statically generated for SEO.
- `admin/` — React (Vite) SPA, served at `/admin` on the same domain as the frontend. Total content control for staff.
- `backend/` — Express API + MySQL. Powers both the public site and the admin panel; handles PayPal donations and transactional email.

## Local development

You need Node 20+ and a MySQL server (local install, or remote access to the Hostinger MySQL instance — see `backend/HOSTINGER_DEPLOY.md`).

```bash
# 1. Backend
cd backend
cp .env.example .env   # fill in DB + PayPal + Resend credentials
npm install
npm run migrate
npm run seed            # creates the first super_admin user + real site content
npm run dev              # http://localhost:4000

# 2. Frontend (public site)
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:4321

# 3. Admin panel
cd admin
cp .env.example .env
npm install
npm run dev                # http://localhost:5173/admin/
```

Log in to the admin panel with the email/password set in `backend/.env` as `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`.

## Deployment

See `backend/HOSTINGER_DEPLOY.md` for the full Hostinger deployment checklist (Node.js app, MySQL, env vars, building & uploading the frontend/admin static output).

## Content source

`content/site-content.txt` has the original copy brief used to seed initiatives/programs and write page copy.
