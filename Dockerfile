
FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
# Build the application
RUN npm run build

# Expose port
EXPOSE 80

# Start the application
CMD ["npm", "start"]
