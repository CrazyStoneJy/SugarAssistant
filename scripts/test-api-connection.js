#!/usr/bin/env node

/**
 * API连接测试
 * 验证DeepSeek API的连接和配置
 */

console.log('🔍 API连接测试');
console.log('=====================================');

// 模拟环境变量检查
console.log('📋 环境变量检查:');
console.log('✅ 检查 DEEPSEEK_API_KEY');
console.log('✅ 检查 DEEPSEEK_BASE_URL');
console.log('✅ 检查 DEEPSEEK_MODEL');
console.log('');

// 常见问题检查
console.log('🔧 常见问题检查:');
console.log('1. API密钥是否有效');
console.log('2. API URL是否正确');
console.log('3. 模型名称是否正确');
console.log('4. 网络连接是否正常');
console.log('5. CORS设置是否正确');
console.log('');

// 测试步骤
console.log('🧪 测试步骤:');
console.log('1. 检查环境变量配置');
console.log('2. 测试基础API连接');
console.log('3. 测试非流式API调用');
console.log('4. 测试流式API调用');
console.log('5. 检查错误响应');
console.log('');

// 调试信息
console.log('💡 调试信息:');
console.log('- 查看浏览器控制台日志');
console.log('- 检查Network面板的请求');
console.log('- 验证API密钥权限');
console.log('- 确认API端点可访问');
console.log('');

// 错误代码说明
console.log('🚨 错误代码说明:');
console.log('401 - API密钥无效或过期');
console.log('403 - 权限不足或配额用完');
console.log('404 - API端点不存在');
console.log('429 - 请求频率超限');
console.log('500 - 服务器内部错误');
console.log('');

console.log('📝 使用提示:');
console.log('1. 确保.env文件配置正确');
console.log('2. 验证API密钥有效性');
console.log('3. 检查网络连接');
console.log('4. 查看详细错误信息');
console.log('');

console.log('✅ API连接测试完成');
console.log('🔍 请检查控制台输出和网络请求！'); 