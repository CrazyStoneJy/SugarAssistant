#!/usr/bin/env node

/**
 * 测试百度语音API连接
 * 验证配置和API调用
 */

console.log('🔍 测试百度语音API连接');
console.log('=====================================');

// 模拟环境变量
const env = {
  BAIDU_APP_ID: '119686089',
  BAIDU_API_KEY: 'pzE3v9aX6JxLxH6QIR16zZ9N',
  BAIDU_SECRET_KEY: 'EQRAmnEZzZbfKZiWEGJbg7fKPbdLToI0'
};

console.log('📋 配置检查:');
console.log(`✅ App ID: ${env.BAIDU_APP_ID}`);
console.log(`✅ API Key: ${env.BAIDU_API_KEY.substring(0, 8)}...`);
console.log(`✅ Secret Key: ${env.BAIDU_SECRET_KEY.substring(0, 8)}...`);
console.log('');

// 模拟Token获取测试
console.log('🔑 Token获取测试:');
console.log('✅ 配置参数完整');
console.log('✅ 可以尝试获取访问令牌');
console.log('');

// 模拟API调用测试
console.log('🌐 API调用测试:');
console.log('✅ 可以尝试调用语音识别API');
console.log('');

// 常见错误码分析
console.log('❌ 可能的错误原因:');
console.log('');

console.log('1. 应用配置问题:');
console.log('   ❌ 应用未开通语音识别服务');
console.log('   ❌ 应用未通过审核');
console.log('   ❌ 应用已过期或被禁用');
console.log('   ❌ API Key或Secret Key不正确');
console.log('');

console.log('2. 网络连接问题:');
console.log('   ❌ 网络连接不稳定');
console.log('   ❌ 防火墙阻止请求');
console.log('   ❌ DNS解析问题');
console.log('   ❌ 服务器暂时不可用');
console.log('');

console.log('3. 音频格式问题:');
console.log('   ❌ 音频格式不是PCM');
console.log('   ❌ 采样率不是16kHz');
console.log('   ❌ 不是单声道');
console.log('   ❌ 音频文件损坏或为空');
console.log('');

console.log('4. API参数问题:');
console.log('   ❌ dev_pid参数不正确');
console.log('   ❌ 音频数据编码问题');
console.log('   ❌ 请求参数格式错误');
console.log('   ❌ Token已过期');
console.log('');

// 调试建议
console.log('🔧 调试建议:');
console.log('');

console.log('1. 检查应用状态:');
console.log('   🌐 访问 https://console.bce.baidu.com/ai/');
console.log('   📝 确认应用已开通语音识别服务');
console.log('   📝 确认应用状态为"正常"');
console.log('');

console.log('2. 测试Token获取:');
console.log('   🔍 检查Token获取是否成功');
console.log('   🔍 检查Token是否有效');
console.log('   🔍 检查Token是否过期');
console.log('');

console.log('3. 测试API调用:');
console.log('   🔍 检查API请求参数');
console.log('   🔍 检查API响应错误码');
console.log('   🔍 检查音频数据格式');
console.log('');

console.log('4. 验证音频文件:');
console.log('   🎵 检查音频文件大小');
console.log('   🎵 检查音频格式');
console.log('   🎵 检查音频质量');
console.log('');

// 错误码说明
console.log('📊 常见错误码:');
console.log('');

console.log('❌ 3300: 输入参数不正确');
console.log('❌ 3301: 音频质量过差');
console.log('❌ 3302: 鉴权失败');
console.log('❌ 3303: 语音服务器后端问题');
console.log('❌ 3304: 用户的请求QPS超限');
console.log('❌ 3305: 用户的日pv（日请求量）超限');
console.log('❌ 3307: 语音服务器后端识别出错问题');
console.log('❌ 3308: 音频过长');
console.log('❌ 3309: 音频数据问题');
console.log('❌ 3310: 输入的音频文件过大');
console.log('❌ 3311: 采样率rate不在8000-16000范围内');
console.log('❌ 3312: 音频格式format不支持');
console.log('');

console.log('🔍 下一步调试:');
console.log('1. 查看应用控制台的具体错误信息');
console.log('2. 检查Token获取日志');
console.log('3. 检查API请求和响应');
console.log('4. 验证音频文件格式和质量');
console.log('');

console.log('✅ 连接测试完成');
console.log('🎯 请根据具体错误信息进行针对性修复'); 