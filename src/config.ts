/**
 * 配置接口定义
 */

/**
 * CDP 配置
 */
export interface CdpConfig {
  /** 是否启用 CDP 远程连接 */
  enabled: boolean;
  /** CDP 远程端点地址，如 http://10.0.0.20:9222 */
  endpoint: string;
}

/**
 * 服务器配置
 */
export interface ServerConfig {
  /** HTTP 模式下的端口号 */
  port: number;
  /** HTTP 模式下的监听地址 */
  host: string;
}

/**
 * 浏览器配置
 */
export interface BrowserConfig {
  /** 命令执行超时时间（毫秒） */
  timeout: number;
}

/**
 * 完整配置接口
 */
export interface AppConfig {
  cdp: CdpConfig;
  server: ServerConfig;
  browser: BrowserConfig;
}

/**
 * 默认配置
 */
export const defaultConfig: AppConfig = {
  cdp: {
    enabled: false,
    endpoint: '',
  },
  server: {
    port: 9223,
    host: '0.0.0.0',
  },
  browser: {
    timeout: 30000,
  },
};
