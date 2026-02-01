import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { createServer as createHttpServer } from 'http';
import { getConfig } from './utils/configLoader.js';
import type { AppConfig } from './config.js';

import * as navigation from './tools/navigation.js';
import * as interaction from './tools/interaction.js';
import * as information from './tools/information.js';
import * as storage from './tools/storage.js';
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
    try {
      const result = await handleToolCall(name, args || {});
      return { content: [{ type: 'text', text: result }] };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: msg }) }] };
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

  const server = await createServer();

  if (appConfig.server.transport === 'sse') {
    await startSseServer(server, appConfig);
  } else {
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
 * 启动 SSE 模式服务器
 */
async function startSseServer(server: Server, config: AppConfig) {
  const { port, host } = config.server;

  // 存储活跃的 SSE 传输连接
  const transports = new Map<string, SSEServerTransport>();

  const httpServer = createHttpServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // SSE 端点
    if (url.pathname === '/sse' && req.method === 'GET') {
      const transport = new SSEServerTransport('/messages', res);
      const sessionId = crypto.randomUUID();
      transports.set(sessionId, transport);

      console.error(`[SSE] 新连接: ${sessionId}`);

      res.on('close', () => {
        transports.delete(sessionId);
        console.error(`[SSE] 连接关闭: ${sessionId}`);
      });

      await server.connect(transport);
      return;
    }

    // 消息端点
    if (url.pathname === '/messages' && req.method === 'POST') {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '缺少 sessionId 参数' }));
        return;
      }

      const transport = transports.get(sessionId);
      if (!transport) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '会话不存在' }));
        return;
      }

      await transport.handlePostMessage(req, res);
      return;
    }

    // 健康检查端点
    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        transport: 'sse',
        connections: transports.size
      }));
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  });

  httpServer.listen(port, host, () => {
    console.error(`[服务器] SSE 模式已启动`);
    console.error(`[服务器] 监听地址: http://${host}:${port}`);
    console.error(`[服务器] SSE 端点: http://${host}:${port}/sse`);
    console.error(`[服务器] 健康检查: http://${host}:${port}/health`);
  });
}
