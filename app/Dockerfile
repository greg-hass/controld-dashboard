# Control D Home - Dockerfile
# Multi-stage build for production

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build production bundle
RUN npm run build

# Production stage - Node server for static app, API proxy, and scheduler
FROM node:20-alpine

WORKDIR /app

LABEL org.opencontainers.image.source="https://github.com/greg-hass/controld-dashboard"
LABEL org.opencontainers.image.description="Self-hosted Control D dashboard"

ENV NODE_ENV=production
ENV PORT=80
ENV SCHEDULER_DATA_DIR=/data

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

EXPOSE 80

VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1/healthz').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server/control-d-server.mjs"]
