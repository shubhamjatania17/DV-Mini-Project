# Multi-stage Dockerfile for Node.js + Python ML on Render
FROM node:20-slim

# Install Python 3, pip, and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy python requirements and install ML libraries
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy package files for caching
COPY package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install Node dependencies
RUN npm install --prefix server
RUN npm install --prefix client

# Copy all source files
COPY . .

# Build Vite frontend bundle
RUN npm --prefix client run build

# Expose Render PORT
ENV PORT=5000
ENV NODE_ENV=production
ENV PYTHON_PATH=python3

EXPOSE 5000

# Start unified Express server
CMD ["node", "server/server.js"]
