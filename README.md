# agent-browser-mcp

**[English](README.md)** | [中文](README_ZH.md)

MCP (Model Context Protocol) server for [agent-browser](https://github.com/vercel-labs/agent-browser) - headless browser automation for AI agents.

## Features

- **CDP Remote Connection**: Connect to remote Chrome/Edge browser via Chrome DevTools Protocol
- **Multiple Transport Modes**: Support both stdio and SSE (Server-Sent Events) transport
- **YAML Configuration**: Easy-to-read configuration with comments support
- **Docker Support**: Ready-to-use Dockerfile for containerized deployment

## Installation

### Via npx (Recommended)

```bash
# Run directly without installation
npx @coofly/agent-browser-mcp

# SSE mode
npx @coofly/agent-browser-mcp --sse --port 9223

# With CDP endpoint
npx @coofly/agent-browser-mcp --cdp "http://localhost:9222"
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

Copy the example configuration file:

```bash
cp config.example.yaml config.yaml
```

### Configuration Options

```yaml
# CDP remote debugging configuration
cdp:
  enabled: false
  endpoint: "http://10.0.0.20:9222"

# MCP server configuration
server:
  transport: stdio  # stdio or sse
  port: 9223
  host: "0.0.0.0"

# Browser operation configuration
browser:
  timeout: 30000
```

## Usage

### Stdio Mode (Default)

```bash
npm start
```

### SSE Mode

```bash
# Via command line
npm start -- --sse --port 9223

# Via environment variables
MCP_TRANSPORT=sse MCP_PORT=9223 npm start
```

### With CDP Remote Browser

```bash
# Start Chrome with remote debugging
chrome --remote-debugging-port=9222

# Start MCP server with CDP
npm start -- --cdp "http://localhost:9222"
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
      "args": ["agent-browser-mcp", "--cdp", "http://localhost:9222"]
    }
  }
}
```

## Docker

### Build Image

```bash
docker build -t agent-browser-mcp:latest .
```

### Run Container

```bash
# SSE mode
docker run -p 9223:9223 -e MCP_TRANSPORT=sse agent-browser-mcp:latest

# With CDP endpoint
docker run -p 9223:9223 \
  -e MCP_TRANSPORT=sse \
  -e CDP_ENDPOINT=http://host.docker.internal:9222 \
  agent-browser-mcp:latest

# With custom config
docker run -p 9223:9223 \
  -v ./config.yaml:/app/config.yaml \
  agent-browser-mcp:latest
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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CDP_ENDPOINT` | CDP remote endpoint URL | - |
| `MCP_TRANSPORT` | Transport mode (stdio/sse) | stdio |
| `MCP_PORT` | SSE server port | 9223 |
| `MCP_HOST` | SSE server host | 0.0.0.0 |
| `BROWSER_TIMEOUT` | Command timeout (ms) | 30000 |

## License

GPL-3.0
