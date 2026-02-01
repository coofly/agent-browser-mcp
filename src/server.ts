import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import { getConfig } from './utils/configLoader.js';
import type { AppConfig } from './config.js';

import * as navigation from './tools/navigation.js';
import * as interaction from './tools/interaction.js';
import * as information from './tools/information.js';
import * as advanced from './tools/advanced.js';

interface SessionOptions {
  session?: string;
  profile?: string;
  headed?: boolean;
  /** CDP 远程端点地址 */
  cdp?: string;
}

let globalOptions: SessionOptions = {};
let appConfig: AppConfig | null = null;

const tools: Tool[] = [
  // 导航工具
  {
    name: 'browser_open',
    description: '打开指定 URL',
    inputSchema: {
      type: 'object',
      properties: { url: { type: 'string', description: '要打开的 URL' } },
      required: ['url'],
    },
  },
  {
    name: 'browser_back',
    description: '浏览器后退',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'browser_forward',
    description: '浏览器前进',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'browser_reload',
    description: '刷新当前页面',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'browser_get_url',
    description: '获取当前页面 URL',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'browser_get_title',
    description: '获取当前页面标题',
    inputSchema: { type: 'object', properties: {} },
  },
  // 交互工具
  {
    name: 'browser_click',
    description: '点击元素',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: '元素选择器或 ref' },
        button: { type: 'string', enum: ['left', 'right', 'middle'] },
      },
      required: ['selector'],
    },
  },
  {
    name: 'browser_type',
    description: '在元素中输入文本（逐字符）',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: '元素选择器' },
        text: { type: 'string', description: '要输入的文本' },
      },
      required: ['selector', 'text'],
    },
  },
  {
    name: 'browser_fill',
    description: '填充输入框（直接设置值）',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: '元素选择器' },
        text: { type: 'string', description: '要填充的文本' },
      },
      required: ['selector', 'text'],
    },
  },
  {
    name: 'browser_hover',
    description: '悬停在元素上',
    inputSchema: {
      type: 'object',
      properties: { selector: { type: 'string' } },
      required: ['selector'],
    },
  },
  {
    name: 'browser_press',
    description: '按下键盘按键',
    inputSchema: {
      type: 'object',
      properties: { key: { type: 'string', description: '按键名称' } },
      required: ['key'],
    },
  },
  {
    name: 'browser_select',
    description: '选择下拉选项',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string' },
        value: { type: 'string' },
      },
      required: ['selector', 'value'],
    },
  },
  {
    name: 'browser_check',
    description: '勾选复选框（操作复选框时优先使用此工具，比 click 更可靠，尤其适用于 Element Plus 等自定义 UI 组件）',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: '元素选择器' },
      },
      required: ['selector'],
    },
  },
  {
    name: 'browser_uncheck',
    description: '取消勾选复选框（操作复选框时优先使用此工具，比 click 更可靠，尤其适用于 Element Plus 等自定义 UI 组件）',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: '元素选择器' },
      },
      required: ['selector'],
    },
  },
  {
    name: 'browser_dblclick',
    description: '双击元素',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: '元素选择器' },
      },
      required: ['selector'],
    },
  },
  {
    name: 'browser_clear',
    description: '清空输入框',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: '元素选择器' },
      },
      required: ['selector'],
    },
  },
  {
    name: 'browser_focus',
    description: '聚焦元素',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: '元素选择器' },
      },
      required: ['selector'],
    },
  },
  // 信息获取工具
  {
    name: 'browser_snapshot',
    description: '获取页面快照（可访问性树，最适合 AI）',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'browser_get_text',
    description: '获取元素文本内容',
    inputSchema: {
      type: 'object',
      properties: { selector: { type: 'string' } },
      required: ['selector'],
    },
  },
  {
    name: 'browser_get_html',
    description: '获取元素 HTML',
    inputSchema: {
      type: 'object',
      properties: { selector: { type: 'string' } },
      required: ['selector'],
    },
  },
  {
    name: 'browser_screenshot',
    description: '截取页面截图',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '保存路径' },
        fullPage: { type: 'boolean' },
      },
    },
  },
  {
    name: 'browser_scroll',
    description: '滚动页面',
    inputSchema: {
      type: 'object',
      properties: {
        direction: { type: 'string', enum: ['up', 'down', 'left', 'right'] },
        amount: { type: 'number' },
      },
      required: ['direction'],
    },
  },
  {
    name: 'browser_wait',
    description: '等待元素出现或等待指定时间（毫秒）',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: '元素选择器或等待时间（毫秒）' },
        state: { type: 'string', enum: ['visible', 'hidden', 'attached'], description: '等待元素时的状态' },
      },
      required: ['target'],
    },
  },
  {
    name: 'browser_evaluate',
    description: '执行 JavaScript 代码',
    inputSchema: {
      type: 'object',
      properties: {
        script: { type: 'string', description: '要执行的 JavaScript 代码' },
      },
      required: ['script'],
    },
  },
  {
    name: 'browser_close',
    description: '关闭浏览器',
    inputSchema: { type: 'object', properties: {} },
  },
];

/**
 * 处理工具调用
 */
async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  // 合并全局选项和 CDP 配置
  const opts: SessionOptions = { ...globalOptions };
  if (appConfig?.cdp.enabled && appConfig.cdp.endpoint) {
    opts.cdp = appConfig.cdp.endpoint;
  }

  switch (name) {
    // 导航
    case 'browser_open':
      return JSON.stringify(await navigation.open(args.url as string, opts));
    case 'browser_back':
      return JSON.stringify(await navigation.back(opts));
    case 'browser_forward':
      return JSON.stringify(await navigation.forward(opts));
    case 'browser_reload':
      return JSON.stringify(await navigation.reload(opts));
    case 'browser_get_url':
      return JSON.stringify(await navigation.getUrl(opts));
    case 'browser_get_title':
      return JSON.stringify(await navigation.getTitle(opts));

    // 交互
    case 'browser_click':
      return JSON.stringify(await interaction.click(args.selector as string, opts));
    case 'browser_type':
      return JSON.stringify(await interaction.type(args.selector as string, args.text as string, opts));
    case 'browser_fill':
      return JSON.stringify(await interaction.fill(args.selector as string, args.text as string, opts));
    case 'browser_hover':
      return JSON.stringify(await interaction.hover(args.selector as string, opts));
    case 'browser_press':
      return JSON.stringify(await interaction.press(args.key as string, opts));
    case 'browser_select':
      return JSON.stringify(await interaction.select(args.selector as string, args.value as string, opts));
    case 'browser_check':
      return JSON.stringify(await interaction.check(args.selector as string, opts));
    case 'browser_uncheck':
      return JSON.stringify(await interaction.uncheck(args.selector as string, opts));
    case 'browser_dblclick':
      return JSON.stringify(await interaction.dblclick(args.selector as string, opts));
    case 'browser_clear':
      return JSON.stringify(await interaction.clear(args.selector as string, opts));
    case 'browser_focus':
      return JSON.stringify(await interaction.focus(args.selector as string, opts));

    // 信息获取
    case 'browser_snapshot':
      return JSON.stringify(await information.snapshot(opts));
    case 'browser_get_text':
      return JSON.stringify(await information.getText(args.selector as string, opts));
    case 'browser_get_html':
      return JSON.stringify(await information.getHtml(args.selector as string, opts));

    // 高级功能
    case 'browser_screenshot':
      return JSON.stringify(await advanced.screenshot(args.path as string, opts));
    case 'browser_scroll':
      return JSON.stringify(await advanced.scroll(
        args.direction as 'up' | 'down' | 'left' | 'right',
        args.amount as number,
        opts
      ));
    case 'browser_wait':
      return JSON.stringify(await advanced.wait(
        args.target as string,
        { ...opts, state: args.state as 'visible' | 'hidden' | 'attached' | undefined }
      ));
    case 'browser_evaluate':
      return JSON.stringify(await advanced.evaluate(args.script as string, opts));
    case 'browser_close':
      return JSON.stringify(await advanced.close(opts));

    default:
      return JSON.stringify({ success: false, error: `未知工具: ${name}` });
  }
}

/**
 * 创建并启动 MCP 服务器
 */
export async function createServer() {
  const server = new Server(
    { name: 'agent-browser-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  // 列出工具
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // 调用工具
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // 打印请求日志
    const argsStr = args && Object.keys(args).length > 0 ? `: ${JSON.stringify(args)}` : '';
    console.error(`[Tool] ${name} 请求${argsStr}`);

    try {
      const result = await handleToolCall(name, args || {});

      // 解析结果，检查是否有错误
      try {
        const parsed = JSON.parse(result);
        if (!parsed.success && parsed.error) {
          console.error(`[Tool] ${name} 失败: ${parsed.error}`);
        } else if (!parsed.success && parsed.output) {
          // agent-browser 返回的嵌套错误
          try {
            const nested = JSON.parse(parsed.output);
            if (nested.error) {
              console.error(`[Tool] ${name} 失败: ${nested.error}`);
            }
          } catch {
            console.error(`[Tool] ${name} 失败: ${parsed.output}`);
          }
        } else {
          console.error(`[Tool] ${name} 成功`);
        }
      } catch {
        console.error(`[Tool] ${name} 结果: ${result}`);
      }

      return { content: [{ type: 'text', text: result }] };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const errorResult = JSON.stringify({ success: false, error: msg });

      // 打印错误结果日志
      console.error(`[Tool] ${name} 错误: ${errorResult}`);

      return { content: [{ type: 'text', text: errorResult }] };
    }
  });

  return server;
}

/**
 * 启动服务器
 */
export async function startServer() {
  appConfig = getConfig();

  // 如果启用了 CDP，设置到全局选项
  if (appConfig.cdp.enabled && appConfig.cdp.endpoint) {
    globalOptions.cdp = appConfig.cdp.endpoint;
    console.error(`[CDP] 已启用远程连接: ${appConfig.cdp.endpoint}`);
  }

  // 确定传输模式
  const configMode = appConfig.server.mode;
  let useHttpMode: boolean;

  if (configMode === 'http') {
    console.error('[服务器] 配置指定 HTTP 模式');
    useHttpMode = true;
  } else if (configMode === 'stdio') {
    console.error('[服务器] 配置指定 Stdio 模式');
    useHttpMode = false;
  } else {
    // auto 模式：默认使用 HTTP，仅当明确检测到管道输入时使用 Stdio
    // Docker 等容器环境没有 TTY，但应该使用 HTTP 模式
    useHttpMode = true;
    console.error('[服务器] 自动检测模式: HTTP（默认）');
  }

  if (useHttpMode) {
    const server = await createServer();
    await startHttpServer(server, appConfig);
  } else {
    const server = await createServer();
    await startStdioServer(server);
  }
}

/**
 * 启动 Stdio 模式服务器
 */
async function startStdioServer(server: Server) {
  console.error('[服务器] 以 Stdio 模式启动');
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

/**
 * 启动 HTTP 模式服务器（使用 StreamableHTTP）
 */
async function startHttpServer(server: Server, config: AppConfig) {
  const { port, host } = config.server;
  const transports = new Map<string, StreamableHTTPServerTransport>();

  const httpServer = createHttpServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    // CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');
    res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // 健康检查
    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        transport: 'streamable-http',
        connections: transports.size
      }));
      return;
    }

    // MCP 端点处理
    if (url.pathname === '/mcp') {
      await handleMcpRequest(req, res, server, transports);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  });

  httpServer.listen(port, host, () => {
    console.error(`[服务器] HTTP 模式已启动`);
    console.error(`[服务器] 监听地址: http://${host}:${port}`);
    console.error(`[服务器] MCP 端点: http://${host}:${port}/mcp`);
    console.error(`[服务器] 健康检查: http://${host}:${port}/health`);
  });
}

/**
 * 处理 MCP 请求
 */
async function handleMcpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  server: Server,
  transports: Map<string, StreamableHTTPServerTransport>
) {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports.has(sessionId)) {
    // 已有会话
    transport = transports.get(sessionId)!;
  } else if (!sessionId && req.method === 'POST') {
    // 新会话
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => {
        transports.set(id, transport);
        console.error(`[MCP] 新会话: ${id}`);
      },
    });
    transport.onclose = () => {
      const id = transport.sessionId;
      if (id) {
        transports.delete(id);
        console.error(`[MCP] 会话关闭: ${id}`);
      }
    };
    await server.connect(transport);
  } else if (sessionId && !transports.has(sessionId)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '会话不存在' }));
    return;
  } else {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '缺少 mcp-session-id' }));
    return;
  }

  await transport.handleRequest(req, res);
}
