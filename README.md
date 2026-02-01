# agent-browser-mcp

**[English](README.md)** | [中文](README_ZH.md)

MCP (Model Context Protocol) server for [agent-browser](https://github.com/vercel-labs/agent-browser) - headless browser automation for AI agents.

## Features

- **CDP Remote Connection**: Connect to remote Chrome/Edge browser via Chrome DevTools Protocol
- **Multiple Transport Modes**: Support both stdio and SSE (Server-Sent Events) transport
- **Environment Variables**: Simple configuration via environment variables
- **Docker Support**: Ready-to-use Dockerfile for containerized deployment

## Installation

### Via npx (Recommended)

```bash
# Run directly without installation
npx @coofly/agent-browser-mcp

# SSE mode
MCP_TRANSPORT=sse MCP_PORT=9223 npx @coofly/agent-browser-mcp

# With CDP endpoint
CDP_ENDPOINT="http://localhost:9222" npx @coofly/agent-browser-mcp
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
| `MCP_TRANSPORT` | Transport mode (`stdio` or `sse`) | `stdio` |
| `MCP_PORT` | SSE server port | `9223` |
| `MCP_HOST` | SSE server host | `0.0.0.0` |
| `CDP_ENDPOINT` | CDP remote endpoint URL | - |
| `BROWSER_TIMEOUT` | Command timeout (ms) | `30000` |

## Usage

### Stdio Mode (Default)

```bash
npm start
```

### SSE Mode

```bash
MCP_TRANSPORT=sse MCP_PORT=9223 npm start
```

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
# Basic SSE mode (with built-in browser)
docker run -d -p 9223:9223 \
  -e MCP_TRANSPORT=sse \
  coofly/agent-browser-mcp:latest

# Connect to remote CDP browser (faster startup, no browser installation)
docker run -d -p 9223:9223 \
  -e MCP_TRANSPORT=sse \
  -e CDP_ENDPOINT=http://host.docker.internal:9222 \
  coofly/agent-browser-mcp:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  agent-browser-mcp:
    image: coofly/agent-browser-mcp:latest
    ports:
      - "9223:9223"
    environment:
      - MCP_TRANSPORT=sse
```

### Build from Source

```bash
# Build image
docker build -t agent-browser-mcp:latest .

# Run container
docker run -d -p 9223:9223 -e MCP_TRANSPORT=sse agent-browser-mcp:latest
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
