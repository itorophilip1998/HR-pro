FROM node:20-alpine

WORKDIR /app

# Install Prisma CLI globally for migrations
RUN npm install -g prisma

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh && \
    ls -la docker-entrypoint.sh

# Expose port
EXPOSE 8001

# Start the application
ENTRYPOINT ["sh", "docker-entrypoint.sh"]

