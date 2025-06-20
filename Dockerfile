FROM node:24-alpine
WORKDIR /app

# Build argument to bust cache every time
ARG CACHEBUST=1

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Add curl for health checks
RUN apk add --no-cache curl

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]