# 1. Base image
FROM node:20-slim

# 2. Install Redis
RUN apt-get update && apt-get install -y redis-server && rm -rf /var/lib/apt/lists/*

# 3. Set working dir
WORKDIR /app

# 4. Copy package files and install deps
COPY package*.json ./
RUN npm install --production

# 5. Copy app files
COPY . .

# 6. Expose app port
EXPOSE 5000

# 7. Start both Redis and your app
CMD redis-server --daemonize yes && node src/server.js
