/**
 * 配置加载器
 * 从环境变量加载配置
 */

import { AppConfig, defaultConfig, TransportMode } from '../config.js';

/**
 * 从环境变量加载配置
 */
function loadEnvConfig(): AppConfig {
  const config: AppConfig = { ...defaultConfig };

  // CDP 配置
  if (process.env.CDP_ENDPOINT) {
    config.cdp = {
      enabled: true,
      endpoint: process.env.CDP_ENDPOINT,
    };
  }

  // 服务器配置
  if (process.env.MCP_PORT) {
    config.server.port = parseInt(process.env.MCP_PORT, 10);
  }

  if (process.env.MCP_HOST) {
    config.server.host = process.env.MCP_HOST;
  }

  // 传输模式配置
  if (process.env.MCP_MODE) {
    const mode = process.env.MCP_MODE.toLowerCase();
    if (mode === 'http' || mode === 'stdio' || mode === 'auto') {
      config.server.mode = mode as TransportMode;
    }
  }

  // 浏览器配置
  if (process.env.BROWSER_TIMEOUT) {
    config.browser.timeout = parseInt(process.env.BROWSER_TIMEOUT, 10);
  }

  return config;
}

/** 全局配置实例 */
let globalConfig: AppConfig | null = null;

/**
 * 获取全局配置（单例）
 */
export function getConfig(): AppConfig {
  if (!globalConfig) {
    globalConfig = loadEnvConfig();
  }
  return globalConfig;
}

/**
 * 重置配置（用于测试）
 */
export function resetConfig(): void {
  globalConfig = null;
}
