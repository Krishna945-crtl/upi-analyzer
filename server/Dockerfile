# 🐳 API image — small Alpine Linux base, production deps only, runs as non-root user
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
ENV NODE_ENV=production PORT=8000
EXPOSE 8000
USER node
HEALTHCHECK --interval=15s --timeout=3s CMD wget -qO- http://localhost:8000/ || exit 1
CMD ["node", "src/server.js"]
