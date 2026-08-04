# syntax=docker/dockerfile:1

# ── Base ─────────────────────────────────────────────────────────────
# Debian-based (not alpine) to avoid musl/OpenSSL binary-target headaches
# with Prisma's native query engine.
FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
# npm ci triggers postinstall (`prisma generate`), which needs *a*
# syntactically valid DATABASE_URL to exist even though it never
# connects to it — set here so every downstream stage inherits it.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/placeholder"

# ── Dependencies ─────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ── Build ────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time env vars: NEXT_PUBLIC_* values get baked into the client
# bundle, so they must be present at build time, not just at runtime.
ARG NEXT_PUBLIC_APP_DOMAIN
ENV NEXT_PUBLIC_APP_DOMAIN=${NEXT_PUBLIC_APP_DOMAIN}
RUN npm run build

# ── Runtime ──────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Next.js's standalone output tracing doesn't reliably pick up Prisma's
# native query engine binaries — copy the generated client explicitly so
# the app can actually connect to the database at runtime.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
