# School Management System

Multi-tenant school management platform. Each school ("organization") gets
its own subdomain (e.g. `greenwood.yourdomain.com`), its own admin, teachers,
students, and data — fully isolated from other schools on the platform.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Postgres** (Neon, or any Postgres 14+) + **Prisma ORM** (pinned to v6)
- **NextAuth (Auth.js v5)** — credentials login, org-scoped sessions
- **Tailwind CSS v4**

Deployable on **Vercel** (easiest) or self-hosted anywhere with **Docker**
(see below) — the app makes no assumptions specific to either platform.

## Features

- Organization signup with super-admin approval workflow
- Subdomain-based multi-tenancy (`{slug}.yourdomain.com`), with every
  mutation-capable API route verifying both the acting user *and* every
  referenced record belong to that same organization
- Role-based access: Super Admin, Org Admin, Teacher, Student, Parent
  (with real parent↔child linking via Guardian records), Accountant
- Super admin can view/manage any school directly (no subdomain needed)
  and edit the public homepage's content live from `/super-admin/site-content`
- Full CRUD (not just create) for students, teachers, classes, sections,
  subjects, exams, invoices, and notes — with confirm-before-delete on
  every destructive action
- Attendance marking (per section, per day)
- Timetable — weekly grid, admin slot creation, guided empty states
- Exams & grades — creation, results entry, auto-computed letter grades
- Fees & billing — invoices, payments, cancel/reopen
- Notes & announcements
- Bulk CSV student import
- `/api/health` endpoint for uptime monitors / container health checks

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables** — copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` / `DATABASE_URL_UNPOOLED` — from a Neon project (create
     one free at neon.tech), or any Postgres instance for local dev
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - `NEXT_PUBLIC_APP_DOMAIN` — `localhost:3000` for local dev
   - `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` — your platform admin login

3. **Push the schema and seed the super-admin**
   ```bash
   npm run db:push
   npm run seed
   ```
   To reset an existing super-admin's password: `npm run seed -- --reset-password`

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   - Visit `http://localhost:3000` — apply as a school, or log in as the
     super-admin to approve applications at `/super-admin/pending`.
   - Local subdomains: add entries like `127.0.0.1 greenwood.localhost` to
     your hosts file, or use a tool like `lvh.me` which resolves any
     subdomain to localhost, to test the org-scoped subdomain flow.
   - **Or skip subdomains entirely for local testing**: any org's pages are
     also reachable directly at `/org/{slug}/...` on the root domain — no
     DNS/hosts-file setup needed, just requires being logged in as that
     org's member (or as super admin, who can view any org this way).

---

## Deploying

### Option A — Vercel (easiest)

1. Push this repo to GitHub and import it into Vercel.
2. Add a Postgres database: Project → **Storage** tab → **Marketplace
   Database Providers** → **Neon** → Connect. This auto-populates
   `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) for you.
3. Set the remaining env vars from `.env.example` in Project Settings →
   Environment Variables (`AUTH_SECRET`, `NEXT_PUBLIC_APP_DOMAIN`,
   `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`).
4. **Domain setup**: in Project Settings → Domains, add your root domain
   (e.g. `yourdomain.com`) *and* a wildcard domain (`*.yourdomain.com`) so
   every school subdomain resolves to this same deployment.
5. After the first deploy, run the seed script once against production
   (`vercel env pull .env.local --environment=production` + `npm run seed`
   locally) to create your super-admin login.
6. Log in at `https://yourdomain.com/login` as the super-admin, approve
   school applications at `/super-admin/pending`, and each approved school
   goes live at `https://{slug}.yourdomain.com`.

### Option B — Docker (self-hosted, any Linux server)

The app ships with a production `Dockerfile` and `docker-compose.yml`.
This is the recommended way to self-host — it bundles Node, the build, and
Prisma's native engine correctly, and updates are just `git pull` + rebuild.

1. On your server, install Docker + Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker $USER   # log out/in after this
   ```
2. Clone the repo and set up `.env` (same variables as local setup above,
   but `DATABASE_URL`/`DATABASE_URL_UNPOOLED` point at your real Postgres —
   Neon works fine here too, no need to self-host the database — and
   `NEXT_PUBLIC_APP_DOMAIN` is your real domain, not `localhost`):
   ```bash
   git clone https://github.com/YUKIN46/Random.git schoolms
   cd schoolms
   cp .env.example .env
   nano .env
   ```
3. Build and start:
   ```bash
   docker compose up -d --build
   ```
4. Push the schema and seed the super-admin **once**, run from the host
   (needs `DATABASE_URL_UNPOOLED` reachable from your machine, not just
   the container — Neon URLs work fine here since they're reachable over
   the internet):
   ```bash
   npx --yes prisma db push
   npm run seed   # or: docker compose exec app node -e "..." if you'd rather run it in-container
   ```
5. Put this behind a reverse proxy for HTTPS + your domain. Two good
   options:
   - **Nginx + Let's Encrypt** — see the wildcard-cert notes below; point
     Nginx's `proxy_pass` at `http://localhost:3000` (the port Compose
     exposes) and forward the `Host` header (`proxy_set_header Host $host;`
     — this is required, the app's subdomain routing reads it directly).
   - **Cloudflare Tunnel** — no port-forwarding, no public IP required,
     works behind CGNAT, automatic HTTPS, supports wildcard subdomains.
     Genuinely the easier option if you're running this from a machine
     without a static public IP (e.g. a home server or laptop):
     ```bash
     curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
     sudo dpkg -i cloudflared.deb
     cloudflared tunnel login
     cloudflared tunnel create schoolms
     # then create ~/.cloudflared/config.yml routing yourdomain.com and
     # *.yourdomain.com to http://localhost:3000, and:
     cloudflared tunnel route dns schoolms yourdomain.com
     cloudflared tunnel route dns schoolms "*.yourdomain.com"
     sudo cloudflared service install && sudo systemctl enable --now cloudflared
     ```
6. Updates: `git pull && docker compose up -d --build` — Compose rebuilds
   only what changed and restarts with zero manual steps.

**DNS**: regardless of which proxy option you pick, you need both an `A`
record for `@` (root) and a wildcard `A` record for `*`, both pointing at
your server — or, if using Cloudflare Tunnel, the `route dns` commands
above create the right records automatically.

## Data model

See `prisma/schema.prisma` for the full schema — PlatformSettings (editable
homepage content), Organization, User, Student, Teacher, Guardian
(parent↔child links), SchoolClass, Section, Subject, AttendanceRecord, Exam,
ExamResult, TimetableSlot, FeeStructure, Invoice, Payment, Note,
Announcement.

## Notes / roadmap

- **Email sending** is the main remaining gap — application confirmations,
  approval notices, and new-account credentials are currently shown
  once in the UI for an admin to share manually (see `CredentialReveal`),
  not emailed. Wiring up Resend/SendGrid/etc. is the natural next step.
- No pagination yet on students/teachers/notes lists — fine at small
  scale, worth adding before any single school gets into the hundreds
  of students.
- No rate limiting on login yet.
