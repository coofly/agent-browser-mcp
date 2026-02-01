# agent-browser-mcp

[English](README.md) | **[中文](README_ZH.md)**

[agent-browser](https://github.com/vercel-labs/agent-browser) 的 MCP (Model Context Protocol) 服务器 - 为 AI 代理提供无头浏览器自动化能力。

## 功能特性

- **CDP 远程连接**：通过 Chrome DevTools Protocol 连接远程 Chrome/Edge 浏览器
- **多传输模式**：支持 stdio 和 SSE (Server-Sent Events) 两种传输方式
- **YAML 配置**：易读的配置文件格式，支持注释
- **Docker 支持**：提供 Dockerfile，支持容器化部署

## 安装

### 通过 npx（推荐）

```bash
# 直接运行（无需安装）
npx @coofly/agent-browser-mcp

# SSE 模式
npx @coofly/agent-browser-mcp --sse --port 9223

# 连接 CDP
npx @coofly/agent-browser-mcp --cdp "http://localhost:9222"
```

### 从源码安装

```bash
# 克隆仓库
git clone <repository-url>
cd agent-browser-mcp

# 安装依赖
npm install

# 编译
npm run build
```

## 配置

复制示例配置文件：

```bash
cp config.example.yaml config.yaml
```

### 配置选项

```yaml
# CDP 远程调试配置
cdp:
  enabled: false
  endpoint: "http://10.0.0.20:9222"

# MCP 服务器配置
server:
  transport: stdio  # stdio 或 sse
  port: 9223
  host: "0.0.0.0"

# 浏览器操作配置
browser:
  timeout: 30000
```

## 使用方法

### Stdio 模式（默认）

```bash
npm start
```

### SSE 模式

```bash
# 命令行参数
npm start -- --sse --port 9223

# 环境变量
MCP_TRANSPORT=sse MCP_PORT=9223 npm start
```

### 连接 CDP 远程浏览器

```bash
# 启动带远程调试的 Chrome
chrome --remote-debugging-port=9222

# 启动 MCP 服务器并连接 CDP
npm start -- --cdp "http://localhost:9222"
```

### MCP 客户端配置

#### Claude Desktop

添加到 Claude Desktop 配置文件：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "agent-browser": {
      "command": "npx",
      "args": ["agent-browser-mcp"]
    }
  }
}
```

连接 CDP 端点：

```json
{
  "mcpServers": {
    "agent-browser": {
      "command": "npx",
      "args": ["agent-browser-mcp", "--cdp", "http://localhost:9222"]
    }
  }
}
```

## Docker

### 构建镜像

```bash
docker build -t agent-browser-mcp:latest .
```

### 运行容器

```bash
# SSE 模式
docker run -p 9223:9223 -e MCP_TRANSPORT=sse agent-browser-mcp:latest

# 指定 CDP 端点
docker run -p 9223:9223 \
  -e MCP_TRANSPORT=sse \
  -e CDP_ENDPOINT=http://host.docker.internal:9222 \
  agent-browser-mcp:latest

# 挂载自定义配置
docker run -p 9223:9223 \
  -v ./config.yaml:/app/config.yaml \
  agent-browser-mcp:latest
```

## 可用工具

| 工具 | 描述 |
|------|------|
| `browser_open` | 打开 URL |
| `browser_back` | 后退 |
| `browser_forward` | 前进 |
| `browser_reload` | 刷新页面 |
| `browser_get_url` | 获取当前 URL |
| `browser_get_title` | 获取页面标题 |
| `browser_click` | 点击元素 |
| `browser_type` | 输入文本（逐字符） |
| `browser_fill` | 填充输入框 |
| `browser_hover` | 悬停元素 |
| `browser_press` | 按下键盘按键 |
| `browser_select` | 选择下拉选项 |
| `browser_snapshot` | 获取页面可访问性快照 |
| `browser_get_text` | 获取元素文本 |
| `browser_get_html` | 获取元素 HTML |
| `browser_screenshot` | 截图 |
| `browser_scroll` | 滚动页面 |

## 环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `CDP_ENDPOINT` | CDP 远程端点 URL | - |
| `MCP_TRANSPORT` | 传输模式 (stdio/sse) | stdio |
| `MCP_PORT` | SSE 服务器端口 | 9223 |
| `MCP_HOST` | SSE 服务器地址 | 0.0.0.0 |
| `BROWSER_TIMEOUT` | 命令超时时间 (毫秒) | 30000 |

## 许可证

GPL-3.0
