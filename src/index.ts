#!/usr/bin/env node
import { startServer } from './server.js';
import { getConfig } from './utils/configLoader.js';

// 加载配置并显示启动信息
const config = getConfig();
console.error('[agent-browser-mcp] 启动中...');
console.error(`[配置] 传输模式: ${config.server.transport}`);
if (config.cdp.enabled) {
  console.error(`[配置] CDP 端点: ${config.cdp.endpoint}`);
}

startServer().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});
