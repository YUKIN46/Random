# School Management System

Multi-tenant school management platform. Each school ("organization") gets
its own subdomain (e.g. `greenwood.yourdomain.com`), its own admin, teachers,
students, and data — fully isolated from other schools on the platform.

## Stack

- **Next.js 16** (App Router, TypeScript) — deployed on Vercel
- **Vercel Postgres** + **Prisma ORM**
- **NextAuth (Auth.js v5)** — credentials login, org-scoped sessions
- **Tailwind CSS**

## Features (v1)

- Organization signup with super-admin approval workflow
- Subdomain-based multi-tenancy (`{slug}.yourdomain.com`)
- Role-based access: Super Admin, Org Admin, Teacher, Student, Parent, Accountant
- Students & Teachers management
- Attendance marking (per section, per day)
- Timetable (view)
- Exams & grades (view)
- Fees & billing — invoices + payment recording
- Notes & announcements

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables** — copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` / `DATABASE_URL_UNPOOLED` — from a Neon project (create
     one free at neon.tech, or via Vercel's Storage → Marketplace Database
     Providers → Neon), or any Postgres instance for local dev
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - `NEXT_PUBLIC_APP_DOMAIN` — `localhost:3000` for local dev
   - `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` — your platform admin login

3. **Push the schema and seed the super-admin**
   ```bash
   npm run db:push
   npm run seed
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   - Visit `http://localhost:3000` — apply as a school, or log in as the
     super-admin to approve applications at `/super-admin/pending`.
   - Local subdomains: add entries like `127.0.0.1 greenwood.localhost` to
     your hosts file, or use a tool like `lvh.me` which resolves any
     subdomain to localhost, to test the org-scoped subdomain flow.

## Deploying to Vercel

1. Push this repo to GitHub (already done) and import it into Vercel.
2. Add a Postgres database: Project → **Storage** tab → **Marketplace Database
   Providers** → **Neon** → Connect. This auto-populates `DATABASE_URL`
   (pooled) and `DATABASE_URL_UNPOOLED` (direct) for you. (Vercel's own
   native "Vercel Postgres" product has been retired in favor of these
   marketplace integrations — Neon is the standard Postgres choice here,
   though Supabase or Prisma Postgres from the same marketplace list would
   also work with this schema without changes, since they all expose a
   standard Postgres connection string.)
3. Set the remaining env vars from `.env.example` in Project Settings →
   Environment Variables (`AUTH_SECRET`, `NEXT_PUBLIC_APP_DOMAIN`,
   `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`).
4. **Domain setup**: in Project Settings → Domains, add your root domain
   (e.g. `yourdomain.com`) *and* a wildcard domain (`*.yourdomain.com`) so
   every school subdomain resolves to this same deployment.
5. After the first deploy, run the seed script once against production
   (e.g. via `vercel env pull` + `npm run seed` locally, or a one-off
   Vercel CLI exec) to create your super-admin login.
6. Log in at `https://yourdomain.com/login` as the super-admin, approve
   school applications at `/super-admin/pending`, and each approved school
   goes live at `https://{slug}.yourdomain.com`.

## Data model

See `prisma/schema.prisma` for the full schema — Organization, User,
Student, Teacher, SchoolClass, Section, Subject, AttendanceRecord, Exam,
ExamResult, TimetableSlot, FeeStructure, Invoice, Payment, Note,
Announcement.

## Notes / next steps

- Email sending (application confirmations, approval notices, invites) is
  stubbed with `TODO` comments in the relevant API routes — wire up
  Resend/SendGrid/etc. when ready.
- Student/teacher creation currently generates a temporary password;
  swap for an email invite link before going to production.
- Timetable/Exam creation UIs are view-only in v1; records can be created
  directly via Prisma Studio (`npm run db:studio`) or the next iteration
  of admin UI.
