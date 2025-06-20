FROM node:24-alpine
WORKDIR /app

# Build argument to bust cache - place early
ARG CACHEBUST=1
RUN echo "Cache bust: $CACHEBUST"

# Add curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]