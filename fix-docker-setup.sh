#!/bin/bash

# This script fixes the docker-compose.yml issue and sets up the proper environment

# Backup the current docker-compose.yml (which is actually an .env file)
echo "Backing up the current docker-compose.yml to .env..."
cp docker-compose.yml .env

# Create a proper docker-compose.yml file
echo "Creating a proper docker-compose.yml file..."
cat > docker-compose.yml << 'EOL'
version: '3'

services:
  marvin-dashboard:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      # Supabase environment variables
      - NEXT_PUBLIC_SUPABASE_URL=https://oeexwetwqsooikroobgm.supabase.co
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXh3ZXR3cXNvb2lrcm9vYmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMDM0MzAsImV4cCI6MjA1Nzc3OTQzMH0.9NIfu8uf2Oof3MU9xKc5uYm47Yey-cfY8wZHRo8RQHI
      - SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZXh3ZXR3cXNvb2lrcm9vYmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMDM0MzAsImV4cCI6MjA1Nzc3OTQzMH0.9NIfu8uf2Oof3MU9xKc5uYm47Yey-cfY8wZHRo8RQHI
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOL

echo "Docker compose file created successfully."

# Make sure the Dockerfile is using the environment variables
echo "Checking if Dockerfile exists..."
if [ -f "Dockerfile" ]; then
  echo "Dockerfile exists."
else
  echo "Dockerfile not found. Creating a basic Dockerfile..."
  cat > Dockerfile << 'EOL'
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application (skip linting to avoid ESLint errors)
RUN npm run build -- --no-lint

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
EOL
  echo "Basic Dockerfile created."
fi

echo "Setup complete. You can now run the following commands:"
echo "docker-compose build --no-cache"
echo "docker-compose up -d"
