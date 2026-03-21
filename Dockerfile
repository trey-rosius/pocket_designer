FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN npm install

COPY . .
RUN npm run build
EXPOSE 8080

CMD ["node", "dist/services/temporal/worker.js"]
