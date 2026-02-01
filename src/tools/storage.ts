import { executeCommand, ExecuteOptions } from '../utils/executor.js';

/**
 * 存储相关工具
 */

/** 获取所有 Cookie */
export async function getCookies(options?: ExecuteOptions) {
  return executeCommand(['cookie', 'list'], options);
}

/** 设置 Cookie */
export async function setCookie(
  name: string,
  value: string,
  options?: ExecuteOptions & { domain?: string; path?: string }
) {
  const args = ['cookie', 'set', name, value];
  if (options?.domain) {
    args.push('--domain', options.domain);
  }
  if (options?.path) {
    args.push('--path', options.path);
  }
  return executeCommand(args, options);
}

/** 删除 Cookie */
export async function deleteCookie(name: string, options?: ExecuteOptions) {
  return executeCommand(['cookie', 'delete', name], options);
}

/** 清除所有 Cookie */
export async function clearCookies(options?: ExecuteOptions) {
  return executeCommand(['cookie', 'clear'], options);
}
