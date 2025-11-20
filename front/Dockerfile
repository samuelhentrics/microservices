# Development Dockerfile for front
# This image runs `npm run start` (ng serve) and exposes port 4200.
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Install dependencies (including dev deps needed by ng serve)
RUN npm install
COPY . .
EXPOSE 4200
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200"]
