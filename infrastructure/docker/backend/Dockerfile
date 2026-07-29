FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm install --legacy-peer-deps

COPY backend/ .
COPY infrastructure/docker/backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
