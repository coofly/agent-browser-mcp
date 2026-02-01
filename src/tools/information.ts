import { executeCommand, ExecuteOptions } from '../utils/executor.js';

/**
 * 信息获取相关工具
 */

/** 获取页面快照（可访问性树） */
export async function snapshot(options?: ExecuteOptions) {
  return executeCommand(['snapshot'], options);
}

/** 获取元素文本 */
export async function getText(selector: string, options?: ExecuteOptions) {
  return executeCommand(['get', 'text', selector], options);
}

/** 获取元素 HTML */
export async function getHtml(selector: string, options?: ExecuteOptions) {
  return executeCommand(['get', 'html', selector], options);
}

/** 获取输入框的值 */
export async function getValue(selector: string, options?: ExecuteOptions) {
  return executeCommand(['get', 'value', selector], options);
}

/** 获取元素属性 */
export async function getAttribute(
  selector: string,
  attribute: string,
  options?: ExecuteOptions
) {
  return executeCommand(['get', 'attr', selector, attribute], options);
}

/** 获取元素数量 */
export async function count(selector: string, options?: ExecuteOptions) {
  return executeCommand(['count', selector], options);
}

/** 检查元素是否可见 */
export async function isVisible(selector: string, options?: ExecuteOptions) {
  return executeCommand(['visible', selector], options);
}

/** 检查元素是否启用 */
export async function isEnabled(selector: string, options?: ExecuteOptions) {
  return executeCommand(['enabled', selector], options);
}

/** 检查复选框是否选中 */
export async function isChecked(selector: string, options?: ExecuteOptions) {
  return executeCommand(['checked', selector], options);
}
