# agent-browser-mcp

**[English](README.md)** | [中文](README_ZH.md)

MCP (Model Context Protocol) server for [agent-browser](https://github.com/vercel-labs/agent-browser) - headless browser automation for AI agents.

## Features

- **CDP Remote Connection**: Connect to remote Chrome/Edge browser via Chrome DevTools Protocol
- **Auto Transport Detection**: Automatically detects stdio (pipe) or HTTP mode based on terminal type
- **Streamable HTTP**: Uses modern MCP Streamable HTTP transport for better session management
- **Environment Variables**: Simple configuration via environment variables
- **Docker Support**: Ready-to-use Dockerfile for containerized deployment

## Installation

### Via npx (Recommended)

**Linux / macOS / Git Bash:**

```bash
# Run directly (auto-detects mode)
npx @coofly/agent-browser-mcp

# With remote CDP browser
CDP_ENDPOINT="http://localhost:9222" npx @coofly/agent-browser-mcp
```

**Windows (PowerShell):**

```powershell
# Run directly (auto-detects mode)
npx @coofly/agent-browser-mcp

# With remote CDP browser
$env:CDP_ENDPOINT="http://localhost:9222"; npx @coofly/agent-browser-mcp
```

**Windows (CMD):**

```cmd
# With remote CDP browser
set CDP_ENDPOINT=http://localhost:9222 && npx @coofly/agent-browser-mcp
```

### From Source

```bash
# Clone the repository
git clone <repository-url>
cd agent-browser-mcp

# Install dependencies
npm install

# Build
npm run build
```

## Configuration

All configuration is done via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `MCP_PORT` | HTTP server port | `9223` |
| `MCP_HOST` | HTTP server host | `0.0.0.0` |
| `CDP_ENDPOINT` | CDP remote endpoint URL | - |
| `BROWSER_TIMEOUT` | Command timeout (ms) | `30000` |

**Transport Mode Auto-Detection:**
- **Interactive terminal (TTY)**: Starts HTTP server, listening on `/mcp` endpoint
- **Pipe input (non-TTY)**: Starts Stdio mode for Claude Desktop and other integrations

## Usage

### Auto Mode (Recommended)

```bash
# In terminal: starts HTTP server on port 9223
npm start

# Via pipe: starts Stdio mode
echo '{}' | npm start
```

### HTTP Mode Endpoints

When running in HTTP mode (interactive terminal):

- **MCP Endpoint**: `http://localhost:9223/mcp`
- **Health Check**: `http://localhost:9223/health`

### With CDP Remote Browser

```bash
# Start Chrome with remote debugging
chrome --remote-debugging-port=9222

# Start MCP server with CDP
CDP_ENDPOINT="http://localhost:9222" npm start
```

### MCP Client Configuration

#### Claude Desktop

Add to your Claude Desktop configuration file:

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

With CDP endpoint:

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

### Using Docker Hub (Recommended)

```bash
# HTTP mode with built-in browser (browser installed on first start)
docker run -d -p 9223:9223 \
  coofly/agent-browser-mcp:latest

# HTTP mode with remote CDP browser (faster startup)
docker run -d -p 9223:9223 \
  -e CDP_ENDPOINT=http://host.docker.internal:9222 \
  coofly/agent-browser-mcp:latest

# Stdio mode (for direct integration with MCP clients)
docker run -i --rm \
  coofly/agent-browser-mcp:latest

# Custom timeout setting (default: 30000ms)
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
      - "9223:9223"           # MCP HTTP server port
    environment:
      # - MCP_HOST=0.0.0.0    # HTTP server bind address (default: 0.0.0.0)
      # - MCP_PORT=9223       # HTTP server port (default: 9223)
      # - CDP_ENDPOINT=http://chrome:9222  # Remote browser CDP endpoint
      # - BROWSER_TIMEOUT=30000            # Command timeout in ms
```

### Build from Source

```bash
# Build image
docker build -t agent-browser-mcp:latest .

# Run container (HTTP mode)
docker run -d -p 9223:9223 agent-browser-mcp:latest
```

## Available Tools

| Tool | Description |
|------|-------------|
| `browser_open` | Open a URL |
| `browser_back` | Navigate back |
| `browser_forward` | Navigate forward |
| `browser_reload` | Reload current page |
| `browser_get_url` | Get current URL |
| `browser_get_title` | Get page title |
| `browser_click` | Click an element |
| `browser_type` | Type text (character by character) |
| `browser_fill` | Fill input field |
| `browser_hover` | Hover over element |
| `browser_press` | Press keyboard key |
| `browser_select` | Select dropdown option |
| `browser_snapshot` | Get page accessibility snapshot |
| `browser_get_text` | Get element text |
| `browser_get_html` | Get element HTML |
| `browser_screenshot` | Take screenshot |
| `browser_scroll` | Scroll page |

## License

GPL-3.0
