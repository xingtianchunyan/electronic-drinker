# 构建阶段
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server/ ./server/
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "server/proxy.js"]
