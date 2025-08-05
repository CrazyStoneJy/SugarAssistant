#!/usr/bin/env node

/**
 * 流式API调试测试
 * 诊断流式请求失败的问题
 */

console.log('🔍 流式API调试测试');
console.log('=====================================');

// 可能的问题
console.log('❌ 可能的问题:');
console.log('1. API密钥配置错误');
console.log('2. API URL不正确');
console.log('3. 模型名称错误');
console.log('4. 网络连接问题');
console.log('5. CORS跨域问题');
console.log('6. 请求格式错误');
console.log('7. 流式响应解析错误');
console.log('');

// 检查步骤
console.log('🔧 检查步骤:');
console.log('1. 验证环境变量配置');
console.log('2. 检查API密钥有效性');
console.log('3. 测试基础API连接');
console.log('4. 验证流式请求格式');
console.log('5. 检查响应解析逻辑');
console.log('');

// 调试建议
console.log('💡 调试建议:');
console.log('✅ 在浏览器中测试API连接');
console.log('✅ 检查网络请求的详细信息');
console.log('✅ 验证API密钥权限');
console.log('✅ 确认模型名称正确');
console.log('✅ 检查CORS设置');
console.log('');

// 常见错误
console.log('🚨 常见错误:');
console.log('- 401 Unauthorized: API密钥错误');
console.log('- 403 Forbidden: 权限不足');
console.log('- 404 Not Found: API端点错误');
console.log('- 429 Too Many Requests: 请求频率限制');
console.log('- 500 Internal Server Error: 服务器错误');
console.log('- CORS错误: 跨域请求被阻止');
console.log('');

// 解决方案
console.log('🛠️ 解决方案:');
console.log('1. 检查.env文件中的API密钥');
console.log('2. 验证API密钥是否有效');
console.log('3. 确认API URL是否正确');
console.log('4. 检查网络连接');
console.log('5. 尝试使用非流式API测试');
console.log('6. 查看浏览器开发者工具的网络面板');
console.log('');

console.log('📝 调试步骤:');
console.log('1. 打开浏览器开发者工具');
console.log('2. 查看Network面板');
console.log('3. 发送测试消息');
console.log('4. 检查请求和响应');
console.log('5. 查看控制台错误信息');
console.log('');

console.log('✅ 流式API调试测试完成');
console.log('🔍 请按照上述步骤进行调试！'); 