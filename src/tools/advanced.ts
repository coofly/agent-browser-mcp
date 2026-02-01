import { executeCommand, ExecuteOptions } from '../utils/executor.js';

/**
 * 高级功能工具
 */

/** 截图 */
export async function screenshot(
  path?: string,
  options?: ExecuteOptions & { fullPage?: boolean }
) {
  const args = ['screenshot'];
  if (path) {
    args.push(path);
  }
  if (options?.fullPage) {
    args.push('--full-page');
  }
  return executeCommand(args, options);
}

/** 滚动页面 */
export async function scroll(
  direction: 'up' | 'down' | 'left' | 'right',
  amount?: number,
  options?: ExecuteOptions
) {
  const args = ['scroll', direction];
  if (amount !== undefined) {
    args.push(String(amount));
  }
  return executeCommand(args, options);
}

/** 滚动到元素 */
export async function scrollTo(selector: string, options?: ExecuteOptions) {
  return executeCommand(['scroll', 'to', selector], options);
}

/** 等待元素出现 */
export async function waitFor(
  selector: string,
  options?: ExecuteOptions & { state?: 'visible' | 'hidden' | 'attached' }
) {
  const args = ['wait', 'for', selector];
  if (options?.state) {
    args.push('--state', options.state);
  }
  return executeCommand(args, options);
}

/** 执行 JavaScript */
export async function evaluate(script: string, options?: ExecuteOptions) {
  return executeCommand(['eval', script], options);
}

/** 等待（元素或时间） */
export async function wait(
  target: string,
  options?: ExecuteOptions & { state?: 'visible' | 'hidden' | 'attached' }
) {
  // 如果是纯数字，等待指定毫秒
  if (/^\d+$/.test(target)) {
    return executeCommand(['wait', target], options);
  }
  // 否则等待元素
  const args = ['wait', 'for', target];
  if (options?.state) {
    args.push('--state', options.state);
  }
  return executeCommand(args, options);
}

/** 关闭浏览器 */
export async function close(options?: ExecuteOptions) {
  return executeCommand(['close'], options);
}
