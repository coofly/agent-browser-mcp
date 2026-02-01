#!/bin/bash
set -e

# 如果未设置 CDP_ENDPOINT，则安装本地浏览器
if [ -z "$CDP_ENDPOINT" ]; then
  echo "[entrypoint] CDP_ENDPOINT not set, installing browser..."
  agent-browser install
  agent-browser install --with-deps
  echo "[entrypoint] Browser installed successfully"
else
  echo "[entrypoint] CDP_ENDPOINT set, skipping browser installation"
fi

# 启动应用
exec node dist/index.js
