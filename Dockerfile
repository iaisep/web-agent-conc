# Use Node.js official image as base
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies first to ensure lock file sync
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

#COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000
CMD ["npm", "start"]
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
