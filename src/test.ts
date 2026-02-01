import { createServer } from './server.js';

async function test() {
  console.log('创建 MCP 服务器...');
  const server = await createServer();
  console.log('服务器创建成功');

  // 测试列出工具
  console.log('\n测试列出工具...');
  const toolsHandler = (server as any)._requestHandlers?.get('tools/list');
  if (toolsHandler) {
    const result = await toolsHandler({});
    console.log(`找到 ${result.tools.length} 个工具:`);
    result.tools.forEach((t: any) => console.log(`  - ${t.name}: ${t.description}`));
  }

  console.log('\n测试完成!');
}

test().catch(console.error);
