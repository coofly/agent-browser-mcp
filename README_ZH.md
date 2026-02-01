# agent-browser-mcp

[English](README.md) | **[中文](README_ZH.md)**

[agent-browser](https://github.com/vercel-labs/agent-browser) 的 MCP (Model Context Protocol) 服务器 - 为 AI 代理提供无头浏览器自动化能力。

## 功能特性

- **CDP 远程连接**：通过 Chrome DevTools Protocol 连接远程 Chrome/Edge 浏览器
- **多传输模式**：支持 stdio 和 SSE (Server-Sent Events) 两种传输方式
- **环境变量配置**：通过环境变量进行简单配置
- **Docker 支持**：提供 Dockerfile，支持容器化部署

## 安装

### 通过 npx（推荐）

**Linux / macOS / Git Bash：**

```bash
# 直接运行（stdio 模式，默认）
npx @coofly/agent-browser-mcp

# SSE 模式
MCP_TRANSPORT=sse MCP_PORT=9223 npx @coofly/agent-browser-mcp

# 连接远程 CDP 浏览器
CDP_ENDPOINT="http://localhost:9222" npx @coofly/agent-browser-mcp

# SSE 模式 + 远程 CDP 浏览器
MCP_TRANSPORT=sse CDP_ENDPOINT="http://localhost:9222" npx @coofly/agent-browser-mcp
```

**Windows (PowerShell)：**

```powershell
# 直接运行（stdio 模式，默认）
npx @coofly/agent-browser-mcp

# SSE 模式
$env:MCP_TRANSPORT="sse"; $env:MCP_PORT="9223"; npx @coofly/agent-browser-mcp

# 连接远程 CDP 浏览器
$env:CDP_ENDPOINT="http://localhost:9222"; npx @coofly/agent-browser-mcp

# SSE 模式 + 远程 CDP 浏览器
$env:MCP_TRANSPORT="sse"; $env:CDP_ENDPOINT="http://localhost:9222"; npx @coofly/agent-browser-mcp
```

**Windows (CMD)：**

```cmd
# SSE 模式
set MCP_TRANSPORT=sse && set MCP_PORT=9223 && npx @coofly/agent-browser-mcp

# 连接远程 CDP 浏览器
set CDP_ENDPOINT=http://localhost:9222 && npx @coofly/agent-browser-mcp
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

通过环境变量配置：

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `MCP_TRANSPORT` | 传输模式 (`stdio` 或 `sse`) | `stdio` |
| `MCP_PORT` | SSE 服务器端口 | `9223` |
| `MCP_HOST` | SSE 服务器地址 | `0.0.0.0` |
| `CDP_ENDPOINT` | CDP 远程端点 URL | - |
| `BROWSER_TIMEOUT` | 命令超时时间（毫秒） | `30000` |

## 使用方法

### Stdio 模式（默认）

```bash
npm start
```

### SSE 模式

```bash
MCP_TRANSPORT=sse MCP_PORT=9223 npm start
```

### 连接 CDP 远程浏览器

```bash
# 启动带远程调试的 Chrome
chrome --remote-debugging-port=9222

# 启动 MCP 服务器并连接 CDP
CDP_ENDPOINT="http://localhost:9222" npm start
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
      "args": ["@coofly/agent-browser-mcp"],
      "env": {
        "CDP_ENDPOINT": "http://localhost:9222"
      }
    }
  }
}
```

## Docker

### 使用 Docker Hub（推荐）

```bash
# SSE 模式，使用内置浏览器（首次启动时安装浏览器）
docker run -d -p 9223:9223 \
  -e MCP_TRANSPORT=sse \
  coofly/agent-browser-mcp:latest

# SSE 模式，连接远程 CDP 浏览器（启动更快，无需安装浏览器）
docker run -d -p 9223:9223 \
  -e MCP_TRANSPORT=sse \
  -e CDP_ENDPOINT=http://host.docker.internal:9222 \
  coofly/agent-browser-mcp:latest

# Stdio 模式（用于直接集成 MCP 客户端）
docker run -i --rm \
  -e MCP_TRANSPORT=stdio \
  coofly/agent-browser-mcp:latest

# Stdio 模式，连接远程 CDP 浏览器
docker run -i --rm \
  -e MCP_TRANSPORT=stdio \
  -e CDP_ENDPOINT=http://host.docker.internal:9222 \
  coofly/agent-browser-mcp:latest

# 自定义超时时间（默认：30000ms）
docker run -d -p 9223:9223 \
  -e MCP_TRANSPORT=sse \
  -e BROWSER_TIMEOUT=60000 \
  coofly/agent-browser-mcp:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  agent-browser-mcp:
    image: coofly/agent-browser-mcp:latest
    ports:
      - "9223:9223"           # MCP SSE 服务端口
    environment:
      - MCP_TRANSPORT=sse     # 传输模式：sse 或 stdio
      # - MCP_HOST=0.0.0.0    # SSE 服务绑定地址（默认：0.0.0.0）
      # - MCP_PORT=9223       # SSE 服务端口（默认：9223）
      # - CDP_ENDPOINT=http://chrome:9222  # 远程浏览器 CDP 端点
      # - BROWSER_TIMEOUT=30000            # 命令超时时间（毫秒）
```

### 从源码构建

```bash
# 构建镜像
docker build -t agent-browser-mcp:latest .

# 运行容器
docker run -d -p 9223:9223 -e MCP_TRANSPORT=sse agent-browser-mcp:latest
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

## 许可证

GPL-3.0
