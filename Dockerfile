# Multi-stage Dockerfile for a Vite + React app
# 1) Build static assets with Node
# 2) Serve with Nginx (SPA-friendly)

# ---------- Builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (better layer caching)
# Use npm ci when lockfile exists; fallback to npm install otherwise
COPY package.json package-lock.json* .npmrc* ./
RUN sh -c "if [ -f package-lock.json ]; then npm ci; else npm install; fi"

# Copy source and build
COPY . .
RUN npm run build

# ---------- Runner ----------
FROM nginx:1.27-alpine AS runner

# Copy custom nginx config to enable SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Healthcheck (lightweight): ensure build output exists and Nginx pid is running
HEALTHCHECK --interval=30s --timeout=3s CMD sh -c 'test -f /usr/share/nginx/html/index.html && pgrep nginx > /dev/null'

EXPOSE 80

# Use default nginx entrypoint/cmd
