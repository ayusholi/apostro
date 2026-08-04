# syntax=docker/dockerfile:1
#
# Multi-stage build: deps -> build -> runtime. One image serves both the API
# and the worker role — they differ only by the command each container runs
# (see docker-compose.yml), guaranteeing the worker runs the exact bytes CI
# tested against (ARCHITECTURE.md §15, INFRASTRUCTURE-DESIGN.md §15).

## ── deps ─────────────────────────────────────────────────────────────────
# Installs full (incl. dev) dependencies once. Cached by lockfile hash, so
# this layer only reruns when dependencies actually change, not on every
# source edit.
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

## ── build ────────────────────────────────────────────────────────────────
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
RUN npm run build
# Dev-only dependencies (typescript, prisma CLI, …) have done their job by
# this point; prune them so runtime only copies what it actually needs.
RUN npm prune --omit=dev

## ── runtime ──────────────────────────────────────────────────────────────
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY prisma ./prisma

# The official node images ship a non-root `node` user; run as it rather
# than root (INFRASTRUCTURE-DESIGN.md §15).
USER node

EXPOSE 4000

# The default role is API; docker-compose.yml overrides `command:` for the
# worker service to `node dist/worker.js` — same image, different process.
CMD ["node", "dist/server.js"]
