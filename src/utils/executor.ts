import { spawn } from 'child_process';

/**
 * 执行 agent-browser CLI 命令
 */
export interface ExecuteOptions {
  session?: string;
  profile?: string;
  json?: boolean;
  headed?: boolean;
  timeout?: number;
  /** CDP 远程端点地址 */
  cdp?: string;
}

export interface ExecuteResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * 执行 agent-browser 命令
 */
export async function executeCommand(
  args: string[],
  options: ExecuteOptions = {}
): Promise<ExecuteResult> {
  const cmdArgs: string[] = [];

  // 添加全局选项
  if (options.cdp) {
    cmdArgs.push('--cdp', options.cdp);
  }
  if (options.session) {
    cmdArgs.push('--session', options.session);
  }
  if (options.profile) {
    cmdArgs.push('--profile', options.profile);
  }
  if (options.json !== false) {
    cmdArgs.push('--json');
  }
  if (options.headed) {
    cmdArgs.push('--headed');
  }

  // 添加命令参数
  cmdArgs.push(...args);

  return new Promise((resolve) => {
    const timeout = options.timeout || 30000;
    let stdout = '';
    let stderr = '';

    const proc = spawn('agent-browser', cmdArgs, {
      shell: true,
      timeout,
    });

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output: stdout.trim() });
      } else {
        resolve({
          success: false,
          output: stdout.trim(),
          error: stderr.trim() || `命令退出码: ${code}`,
        });
      }
    });

    proc.on('error', (err) => {
      resolve({
        success: false,
        output: '',
        error: `执行错误: ${err.message}`,
      });
    });
  });
}

/**
 * 解析 JSON 输出
 */
export function parseJsonOutput<T>(output: string): T | null {
  try {
    return JSON.parse(output) as T;
  } catch {
    return null;
  }
}
