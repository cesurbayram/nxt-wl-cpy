# Base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies for bcrypt and other native modules
RUN apk add --no-cache python3 make g++ libc6-compat

# DEPENDENCIES
FROM base AS deps
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# BUILD
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
ENV NODE_ENV production
RUN npm run build

# PRODUCTION
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set correct permissions
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start command
CMD ["node", "server.js"] 