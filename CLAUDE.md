# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

agent-browser-mcp 是一个 MCP (Model Context Protocol) 服务器，为 AI Agent 提供无头浏览器自动化能力。基于 [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)，通过封装其 CLI 工具，将浏览器操作暴露为 MCP 工具供 AI 调用。

## 常用命令

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 开发模式（使用 tsx 直接运行 TypeScript）
npm run dev

# 生产模式运行
npm start

# 运行测试
npm test

# SSE 模式启动
npm start -- --sse --port 9223

# 连接远程 CDP 浏览器
npm start -- --cdp "http://localhost:9222"

# npx 执行方式（无需本地安装）
npx @coofly/agent-browser-mcp
npx @coofly/agent-browser-mcp --sse --port 9223
npx @coofly/agent-browser-mcp --cdp "http://localhost:9222"
```

## 架构概览

```
src/
├── index.ts           # 入口，加载配置并启动服务器
├── server.ts          # MCP 服务器核心，处理 stdio/SSE 传输
├── config.ts          # 配置类型定义和默认值
├── utils/
│   ├── configLoader.ts  # 配置加载（优先级：CLI > 环境变量 > 文件 > 默认）
│   └── executor.ts      # agent-browser CLI 命令执行器
└── tools/             # MCP 工具实现，按功能分类
    ├── navigation.ts    # 导航：open, back, forward, reload
    ├── interaction.ts   # 交互：click, type, fill, hover, press
    ├── information.ts   # 信息：snapshot, getText, getHtml
    ├── storage.ts       # 存储相关
    └── advanced.ts      # 高级：screenshot, scroll
```

### 核心流程

1. **配置加载** (`configLoader.ts`): 支持 YAML 文件、环境变量、命令行参数，按优先级合并
2. **服务器启动** (`server.ts`): 根据配置选择 stdio 或 SSE 传输模式
3. **工具调用**: MCP 请求 → `handleToolCall` → 对应 tools 模块 → `executeCommand` → 调用 `agent-browser` CLI

### 关键依赖

- `@modelcontextprotocol/sdk`: MCP 协议实现
- `yaml`: 配置文件解析
- 外部依赖: 需要系统安装 `agent-browser` CLI 工具

## 配置方式

复制 `config.example.yaml` 为 `config.yaml` 进行配置。支持三种配置来源：

| 来源 | 示例 |
|------|------|
| 配置文件 | `config.yaml` 中的 `cdp.endpoint` |
| 环境变量 | `CDP_ENDPOINT`, `MCP_TRANSPORT`, `MCP_PORT` |
| 命令行 | `--cdp`, `--sse`, `--port`, `--host` |

## 传输模式

- **stdio**: 默认模式，用于 Claude Desktop 等本地集成
- **SSE**: HTTP 模式，端点 `/sse`（连接）、`/messages`（消息）、`/health`（健康检查）
