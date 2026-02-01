import { executeCommand, ExecuteOptions } from '../utils/executor.js';

/**
 * 导航相关工具
 */

/** 打开 URL */
export async function open(url: string, options?: ExecuteOptions) {
  return executeCommand(['open', url], options);
}

/** 后退 */
export async function back(options?: ExecuteOptions) {
  return executeCommand(['back'], options);
}

/** 前进 */
export async function forward(options?: ExecuteOptions) {
  return executeCommand(['forward'], options);
}

/** 刷新页面 */
export async function reload(options?: ExecuteOptions) {
  return executeCommand(['reload'], options);
}

/** 获取当前 URL */
export async function getUrl(options?: ExecuteOptions) {
  return executeCommand(['get', 'url'], options);
}

/** 获取页面标题 */
export async function getTitle(options?: ExecuteOptions) {
  return executeCommand(['get', 'title'], options);
}

/** 等待页面加载 */
export async function waitForLoad(
  state: 'load' | 'domcontentloaded' | 'networkidle' = 'load',
  options?: ExecuteOptions
) {
  return executeCommand(['wait', 'load', state], options);
}

/** 等待 URL 匹配 */
export async function waitForUrl(
  pattern: string,
  options?: ExecuteOptions
) {
  return executeCommand(['wait', 'url', pattern], options);
}
