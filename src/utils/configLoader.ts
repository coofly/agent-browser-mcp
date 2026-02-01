/**
 * 配置加载器
 * 支持从文件、环境变量、命令行参数加载配置
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { parse as parseYaml } from 'yaml';
import { AppConfig, defaultConfig } from '../config.js';

/**
 * 命令行参数解析结果
 */
interface CliArgs {
  sse?: boolean;
  port?: number;
  host?: string;
  cdp?: string;
  config?: string;
}

/**
 * 解析命令行参数
 */
function parseCliArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--sse') {
      result.sse = true;
    } else if (arg === '--port' && args[i + 1]) {
      result.port = parseInt(args[++i], 10);
    } else if (arg === '--host' && args[i + 1]) {
      result.host = args[++i];
    } else if (arg === '--cdp' && args[i + 1]) {
      result.cdp = args[++i];
    } else if (arg === '--config' && args[i + 1]) {
      result.config = args[++i];
    }
  }

  return result;
}

/**
 * 从文件加载配置（仅支持 YAML 格式）
 */
function loadConfigFile(configPath?: string): Partial<AppConfig> {
  const paths = configPath
    ? [configPath]
    : [
        resolve(process.cwd(), 'config.yaml'),
        resolve(process.cwd(), 'config.yml'),
      ];

  for (const path of paths) {
    if (existsSync(path)) {
      try {
        const content = readFileSync(path, 'utf-8');
        console.error(`[配置] 从文件加载: ${path}`);
        return parseYaml(content) as Partial<AppConfig>;
      } catch (err) {
        console.error(`[配置] 解析配置文件失败: ${path}`, err);
      }
    }
  }

  return {};
}

/**
 * 从环境变量加载配置
 */
function loadEnvConfig(): Partial<AppConfig> {
  const config: Partial<AppConfig> = {};

  // CDP 配置
  if (process.env.CDP_ENDPOINT) {
    config.cdp = {
      enabled: true,
      endpoint: process.env.CDP_ENDPOINT,
    };
  }

  // 服务器配置
  if (process.env.MCP_TRANSPORT === 'sse' || process.env.MCP_TRANSPORT === 'stdio') {
    config.server = {
      ...defaultConfig.server,
      transport: process.env.MCP_TRANSPORT,
    };
  }

  if (process.env.MCP_PORT) {
    config.server = {
      ...defaultConfig.server,
      ...config.server,
      port: parseInt(process.env.MCP_PORT, 10),
    };
  }

  if (process.env.MCP_HOST) {
    config.server = {
      ...defaultConfig.server,
      ...config.server,
      host: process.env.MCP_HOST,
    };
  }

  // 浏览器配置
  if (process.env.BROWSER_TIMEOUT) {
    config.browser = {
      timeout: parseInt(process.env.BROWSER_TIMEOUT, 10),
    };
  }

  return config;
}

/**
 * 深度合并配置对象
 */
function deepMerge(target: AppConfig, source: Partial<AppConfig>): AppConfig {
  const result = { ...target };

  if (source.cdp) {
    result.cdp = { ...result.cdp, ...source.cdp };
  }
  if (source.server) {
    result.server = { ...result.server, ...source.server };
  }
  if (source.browser) {
    result.browser = { ...result.browser, ...source.browser };
  }

  return result;
}

/**
 * 加载完整配置
 * 优先级: 命令行参数 > 环境变量 > 配置文件 > 默认值
 */
export function loadConfig(): AppConfig {
  const cliArgs = parseCliArgs();

  // 1. 从默认配置开始
  let config: AppConfig = { ...defaultConfig };

  // 2. 合并配置文件
  const fileConfig = loadConfigFile(cliArgs.config);
  config = deepMerge(config, fileConfig);

  // 3. 合并环境变量
  const envConfig = loadEnvConfig();
  config = deepMerge(config, envConfig);

  // 4. 合并命令行参数（最高优先级）
  if (cliArgs.sse) {
    config.server.transport = 'sse';
  }
  if (cliArgs.port !== undefined) {
    config.server.port = cliArgs.port;
  }
  if (cliArgs.host) {
    config.server.host = cliArgs.host;
  }
  if (cliArgs.cdp) {
    config.cdp.enabled = true;
    config.cdp.endpoint = cliArgs.cdp;
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
    globalConfig = loadConfig();
  }
  return globalConfig;
}

/**
 * 重置配置（用于测试）
 */
export function resetConfig(): void {
  globalConfig = null;
}
