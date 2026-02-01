import { executeCommand } from './utils/executor.js';

async function test() {
  console.log('测试 agent-browser CLI 命令执行...\n');

  // 测试打开页面
  console.log('1. 测试打开百度...');
  const openResult = await executeCommand(['open', 'https://www.baidu.com']);
  console.log('结果:', openResult);

  // 测试获取标题
  console.log('\n2. 测试获取页面标题...');
  const titleResult = await executeCommand(['get', 'title']);
  console.log('结果:', titleResult);

  // 测试获取快照
  console.log('\n3. 测试获取页面快照...');
  const snapshotResult = await executeCommand(['snapshot']);
  console.log('结果:', snapshotResult.success ? '成功' : snapshotResult.error);
  if (snapshotResult.success) {
    console.log('快照长度:', snapshotResult.output.length, '字符');
  }

  console.log('\n测试完成!');
}

test().catch(console.error);
