# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests for layer caching
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/

RUN npm ci

# Copy source
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server

# Build shared first, then server
RUN npm -w @blindtest/shared run build
RUN npm -w @blindtest/server run build

# Production stage
FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/

RUN npm ci --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist

EXPOSE 3950
CMD ["node", "packages/server/dist/index.js"]
