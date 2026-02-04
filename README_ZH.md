# agent-browser-mcp

[English](README.md) | **[中文](README_ZH.md)**

[agent-browser](https://github.com/vercel-labs/agent-browser) 的 MCP (Model Context Protocol) 服务器 - 为 AI 代理提供无头浏览器自动化能力。

## 功能特性

- **CDP 远程连接**：通过 Chrome DevTools Protocol 连接远程 Chrome/Edge 浏览器
- **传输选择**：设置 `MCP_HOST` + `MCP_PORT` 启用 HTTP，否则使用 Stdio
- **Streamable HTTP**：使用现代 MCP Streamable HTTP 传输，提供更好的会话管理
- **环境变量配置**：通过环境变量进行简单配置
- **Docker 支持**：提供 Dockerfile，支持容器化部署

## 安装

### 通过 npx（推荐）

**Linux / macOS / Git Bash：**

```bash
# 直接运行（Stdio 模式）
npx @coofly/agent-browser-mcp

# 连接远程 CDP 浏览器
CDP_ENDPOINT="http://localhost:9222" npx @coofly/agent-browser-mcp
```

**Windows (PowerShell)：**

```powershell
# 直接运行（Stdio 模式）
npx @coofly/agent-browser-mcp

# 连接远程 CDP 浏览器
$env:CDP_ENDPOINT="http://localhost:9222"; npx @coofly/agent-browser-mcp
```

**Windows (CMD)：**

```cmd
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
| `MCP_PORT` | HTTP 服务器端口（与 `MCP_HOST` 同时设置才启用 HTTP） | - |
| `MCP_HOST` | HTTP 服务器地址（与 `MCP_PORT` 同时设置才启用 HTTP） | - |
| `CDP_ENDPOINT` | CDP 远程端点 URL | - |
| `BROWSER_TIMEOUT` | 命令超时时间（毫秒） | `30000` |

## 使用方法

### Stdio 模式（默认）

```bash
# 在终端中：Stdio 模式（等待 MCP 输入）
npm start

# 通过管道：使用 Stdio 直连
echo '{}' | npm start
```

### HTTP 模式

```bash
# MCP_HOST 与 MCP_PORT 必须同时设置且有效
MCP_HOST=0.0.0.0 MCP_PORT=9223 npm start
```

若只设置其中一个变量或端口无效，服务会报错退出。

### HTTP 端点

在 HTTP 模式下，HTTP 端点可用：

- **MCP 端点**: `http://localhost:9223/mcp`
- **健康检查**: `http://localhost:9223/health`

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
# HTTP 模式，使用内置浏览器（首次启动时安装浏览器）
docker run -d -p 9223:9223 \
  -e MCP_HOST=0.0.0.0 \
  -e MCP_PORT=9223 \
  coofly/agent-browser-mcp:latest

# HTTP 模式，连接远程 CDP 浏览器（启动更快）
docker run -d -p 9223:9223 \
  -e MCP_HOST=0.0.0.0 \
  -e MCP_PORT=9223 \
  -e CDP_ENDPOINT=http://host.docker.internal:9222 \
  coofly/agent-browser-mcp:latest

# Stdio 模式（用于直接集成 MCP 客户端）
docker run -i --rm \
  coofly/agent-browser-mcp:latest

# 自定义超时时间（默认：30000ms）
docker run -d -p 9223:9223 \
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
      - "9223:9223"           # MCP HTTP 服务端口
    environment:
      # - MCP_HOST=0.0.0.0    # HTTP 服务绑定地址（与 MCP_PORT 同时设置）
      # - MCP_PORT=9223       # HTTP 服务端口（与 MCP_HOST 同时设置）
      # - CDP_ENDPOINT=http://chrome:9222  # 远程浏览器 CDP 端点
      # - BROWSER_TIMEOUT=30000            # 命令超时时间（毫秒）
```

### 从源码构建

```bash
# 构建镜像
docker build -t agent-browser-mcp:latest .

# 运行容器（HTTP 模式）
docker run -d -p 9223:9223 \
  -e MCP_HOST=0.0.0.0 \
  -e MCP_PORT=9223 \
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
| `browser_dblclick` | 双击元素 |
| `browser_type` | 输入文本（逐字符） |
| `browser_fill` | 填充输入框 |
| `browser_clear` | 清空输入框 |
| `browser_hover` | 悬停元素 |
| `browser_press` | 按下键盘按键 |
| `browser_select` | 选择下拉选项 |
| `browser_check` | 勾选复选框（操作复选框时优先使用，比 click 更可靠） |
| `browser_uncheck` | 取消勾选复选框（操作复选框时优先使用，比 click 更可靠） |
| `browser_focus` | 聚焦元素 |
| `browser_snapshot` | 获取页面可访问性快照 |
| `browser_get_text` | 获取元素文本 |
| `browser_get_html` | 获取元素 HTML |
| `browser_screenshot` | 截图 |
| `browser_scroll` | 滚动页面 |
| `browser_wait` | 等待元素出现或等待指定时间（毫秒） |
| `browser_evaluate` | 执行 JavaScript 代码 |
| `browser_close` | 关闭浏览器 |

## 许可证

GPL-3.0
