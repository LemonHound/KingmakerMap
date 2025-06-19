FROM node:24-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Add curl for health checks
RUN apk add --no-cache curl

# Start the application
CMD ["npm", "run", "dev"]