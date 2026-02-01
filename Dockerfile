# 构建阶段
FROM node:20-slim AS builder

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
FROM node:20-slim

WORKDIR /app

# 安装 sudo，让 agent-browser install --with-deps 能正常工作
RUN apt-get update && apt-get install -y --no-install-recommends sudo \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件并安装生产依赖
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 安装 agent-browser CLI（浏览器在启动时按需安装）
RUN npm install -g agent-browser

# 从构建阶段复制编译产物
COPY --from=builder /app/dist ./dist

# 复制启动脚本
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# 环境变量
ENV NODE_ENV=production

# 暴露 SSE 端口
EXPOSE 9223

# 启动命令
ENTRYPOINT ["./entrypoint.sh"]
