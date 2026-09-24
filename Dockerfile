# Production Dockerfile for Viral Sarees on Google Cloud Run / Cloud Console
FROM node:22-slim AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies (including dev for building Vite frontend and esbuild server)
RUN npm ci || npm install

# Copy source files
COPY . .

# Build Vite frontend and Express server bundle to /app/dist
RUN npm run build

# -------------------------------------------------------------
# Runner Stage
# -------------------------------------------------------------
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy package descriptors and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json

# Expose standard Cloud Run port
EXPOSE 8080

# Start compiled Express server
CMD ["node", "dist/server.cjs"]
