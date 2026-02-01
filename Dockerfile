# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY tsconfig.json ./
COPY src/ ./src/

# 编译 TypeScript
RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

# 复制依赖文件并安装生产依赖
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 从构建阶段复制编译产物
COPY --from=builder /app/dist ./dist

# 环境变量
ENV NODE_ENV=production

# 暴露 SSE 端口
EXPOSE 9223

# 启动命令
CMD ["node", "dist/index.js"]
