import { executeCommand, ExecuteOptions } from '../utils/executor.js';

/**
 * 交互相关工具
 */

/** 点击元素 */
export async function click(
  selector: string,
  options?: ExecuteOptions & { button?: 'left' | 'right' | 'middle' }
) {
  const args = ['click', selector];
  if (options?.button) {
    args.push('--button', options.button);
  }
  return executeCommand(args, options);
}

/** 双击元素 */
export async function dblclick(selector: string, options?: ExecuteOptions) {
  return executeCommand(['dblclick', selector], options);
}

/** 悬停在元素上 */
export async function hover(selector: string, options?: ExecuteOptions) {
  return executeCommand(['hover', selector], options);
}

/** 输入文本（逐字符） */
export async function type(
  selector: string,
  text: string,
  options?: ExecuteOptions
) {
  return executeCommand(['type', selector, text], options);
}

/** 填充文本（直接设置值） */
export async function fill(
  selector: string,
  text: string,
  options?: ExecuteOptions
) {
  return executeCommand(['fill', selector, text], options);
}

/** 清空输入框 */
export async function clear(selector: string, options?: ExecuteOptions) {
  return executeCommand(['clear', selector], options);
}

/** 按键 */
export async function press(key: string, options?: ExecuteOptions) {
  return executeCommand(['press', key], options);
}

/** 选择下拉选项 */
export async function select(
  selector: string,
  value: string,
  options?: ExecuteOptions
) {
  return executeCommand(['select', selector, value], options);
}

/** 勾选复选框 */
export async function check(selector: string, options?: ExecuteOptions) {
  return executeCommand(['check', selector], options);
}

/** 取消勾选复选框 */
export async function uncheck(selector: string, options?: ExecuteOptions) {
  return executeCommand(['uncheck', selector], options);
}
