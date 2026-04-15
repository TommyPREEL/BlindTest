# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests for layer caching
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/

RUN npm ci

# Copy source
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY packages/client ./packages/client

RUN npm -w @blindtest/client run build

# Production stage
FROM nginx:alpine
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html
EXPOSE 80
