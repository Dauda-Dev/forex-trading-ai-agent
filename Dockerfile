# ─── Stage 1: Build Backend ───────────────────────────────────────────
FROM node:18-alpine AS backend-builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=optional

COPY tsconfig.json ./
COPY src/ src/
RUN npx tsc

# ─── Stage 2: Build React Dashboard ──────────────────────────────────
FROM node:18-alpine AS ui-builder
WORKDIR /app

COPY src/dashboard/app/package.json src/dashboard/app/package-lock.json* ./src/dashboard/app/
RUN cd src/dashboard/app && npm ci --omit=optional

COPY src/dashboard/app/ src/dashboard/app/
RUN cd src/dashboard/app && npm run build

# ─── Stage 3: Runtime ────────────────────────────────────────────────
FROM node:18-alpine
WORKDIR /app

# Install Python + MT5 bridge dependencies (optional, for MT5 support)
RUN apk add --no-cache python3 py3-pip && \
    pip3 install --no-cache-dir metaTrader5 2>/dev/null || true

# Copy backend build
COPY --from=backend-builder /app/dist/ ./dist/
COPY --from=backend-builder /app/node_modules/ ./node_modules/
COPY package.json ./

# Copy React dashboard build
COPY --from=ui-builder /app/src/dashboard/app/dist/ ./dist/src/dashboard/dist/

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:18799/health || exit 1

EXPOSE 18799

ENV NODE_ENV=production

CMD ["node", "dist/src/cli/kit.js", "start", "--host", "0.0.0.0"]
