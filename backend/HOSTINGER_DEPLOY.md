# Deploying to Hostinger

Everything runs on Hostinger Business hosting: static frontend + admin in `public_html`, the Express API as a Node.js
app (one of your 5 available slots), and MySQL from your existing hosting plan.

## Do you need to connect GitHub to Hostinger?

**No** — Hostinger's own hPanel Git feature only runs `git pull`; it can't run `npm install`/`npm run build`, which
the Astro frontend and Vite admin both need to produce the `dist/` folder that actually gets served. So plain
GitHub↔Hostinger Git integration would leave you serving raw source files, not a working site.

Two real options, both already set up in this repo:

1. **Manual** — build locally, upload via File Manager/SFTP. See sections 2–4 below. No GitHub required at all.
2. **Automated via GitHub Actions** — push to `main` on GitHub, and `.github/workflows/deploy-*.yml` build each app
   and push the output to Hostinger over FTPS. This *does* use GitHub, just not Hostinger's native Git integration.
   To enable it:
   - In hPanel → Files → FTP Accounts, create (or note) an FTP account scoped to your hosting plan.
   - In your GitHub repo → Settings → Secrets and variables → Actions, add:
     - `HOSTINGER_FTP_SERVER` — usually your domain or the IP shown in hPanel's FTP details
     - `HOSTINGER_FTP_USERNAME`, `HOSTINGER_FTP_PASSWORD`
     - `PUBLIC_API_URL` — e.g. `https://www.hopeforfamilies.org.uk/api` (or your API subdomain)
     - `PUBLIC_PAYPAL_CLIENT_ID`
   - Push to `main`. Each workflow only runs when its app's folder changes (`frontend/**`, `admin/**`, `backend/**`).
   - The backend workflow uploads source over FTP but **cannot** run `npm install` or restart the Node app remotely
     on shared hosting without SSH — after it finishes, click "Run NPM Install" then "Restart" on the Node.js app in
     hPanel. If your plan includes SSH, this can be fully automated; ask and we'll wire it up.

## 1. Create the MySQL database

In hPanel → Databases → MySQL Databases:

1. Create a database (e.g. `u123456789_hope`) and a database user with a strong password.
2. Note the host (usually `localhost` from the Node app's perspective, since they run on the same server).
3. If you want to run migrations/seed from your local machine instead of SSH, enable **Remote MySQL** in hPanel and
   add your home/office IP to the allow-list.

## 2. Deploy the backend (Node.js app)

In hPanel → Advanced → Node.js:

1. Create a new Node.js application.
   - Application root: the folder you upload `backend/` into (e.g. `backend`).
   - Application URL: a subdomain or path you'll proxy `/api` to (e.g. `api.hopeforfamilies.org.uk`, or configure
     your main domain to reverse-proxy `/api/*` to this app — check Hostinger's current Node.js app docs for the
     exact routing options on your plan).
   - Application startup file: `src/server.js`.
   - Node version: 20.x or later.
2. Upload the `backend/` folder (excluding `node_modules`) via File Manager or `git clone` if you have SSH/Git
   access on your plan, then run `npm install` from the Node.js app's "Run NPM Install" button or its terminal.
3. Set environment variables in the Node.js app's environment variable panel (copy from `backend/.env.example`):
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET` — generate a long random string, never reuse the example.
   - `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE` (`sandbox` until you've tested, then `live`)
   - `PAYPAL_WEBHOOK_ID` (see step 5)
   - `RESEND_API_KEY`, `EMAIL_FROM`, `CHARITY_NOTIFICATION_EMAIL`
   - `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD` (used once by `npm run seed`, then you can rotate the password from
     the admin panel)
   - `CORS_ORIGIN` — your real domain(s), e.g. `https://www.hopeforfamilies.org.uk`
4. Run migrations and seed once, from the app's terminal (or via SSH):
   ```bash
   npm run migrate
   npm run seed
   ```
5. Restart the Node.js app from hPanel.
6. Confirm `https://<your-api-host>/api/health` returns `{"ok":true}`.

## 3. Build and upload the frontend (public site)

From your local machine or CI:

```bash
cd frontend
echo "PUBLIC_API_URL=https://<your-api-host>/api" > .env
echo "PUBLIC_PAYPAL_CLIENT_ID=<live-or-sandbox-client-id>" >> .env
npm install
npm run build
```

Upload the contents of `frontend/dist/` to `public_html` (the root of your domain) via File Manager or FTP/SFTP.

## 4. Build and upload the admin panel

```bash
cd admin
echo "VITE_API_URL=https://<your-api-host>/api" > .env
npm install
npm run build
```

Upload the contents of `admin/dist/` into `public_html/admin/` (the admin SPA is configured with `base: '/admin/'`
in `vite.config.ts`, matching this path). Visiting `https://www.hopeforfamilies.org.uk/admin/` should show the
login screen.

> Because the admin SPA uses client-side routing, add a rewrite rule so any path under `/admin/*` that isn't a real
> file falls back to `/admin/index.html` (an `.htaccess` rule works on Hostinger's Apache-based hosting):
>
> ```apache
> # public_html/admin/.htaccess
> <IfModule mod_rewrite.c>
>   RewriteEngine On
>   RewriteBase /admin/
>   RewriteRule ^index\.html$ - [L]
>   RewriteCond %{REQUEST_FILENAME} !-f
>   RewriteCond %{REQUEST_FILENAME} !-d
>   RewriteRule . /admin/index.html [L]
> </IfModule>
> ```

## 5. PayPal webhook

In the PayPal Developer Dashboard (sandbox first, then live app):

1. Add a webhook pointed at `https://<your-api-host>/api/webhooks/paypal`.
2. Subscribe to at least `PAYMENT.CAPTURE.COMPLETED`.
3. Copy the generated Webhook ID into `PAYPAL_WEBHOOK_ID` on the backend and restart the Node app.
4. Run a sandbox donation end-to-end (create order → approve → capture) and confirm the donation row shows
   `status = completed` in the `donations` table, and confirmation emails arrive.

## 6. SSL and final checks

- Confirm SSL is active on the domain (Hostinger issues free SSL automatically for most plans — check hPanel →
  SSL).
- Re-test the donation flow against the **live** PayPal app once sandbox testing passes, then flip `PAYPAL_MODE`
  to `live` and update `PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET` to the live app's credentials.
- Test all admin CRUD flows (blog, events, testimonials, volunteers, newsletter export, donations/Gift Aid export,
  resources, settings) against the production database.
- Re-run `frontend` build any time content that's baked in at build time changes meaningfully (the site is
  statically generated) — or wire up a simple "Rebuild site" button/cron later if frequent content changes become
  a pain point.
