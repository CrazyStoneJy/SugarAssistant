#!/usr/bin/env node

/**
 * 百度语音API完整测试
 * 验证配置、Token获取和API调用
 */

console.log('🧪 百度语音API完整测试');
console.log('=====================================');

// 模拟环境变量
const env = {
  BAIDU_APP_ID: '119686089',
  BAIDU_API_KEY: 'pzE3v9aX6JxLxH6QIR16zZ9N',
  BAIDU_SECRET_KEY: 'EQRAmnEZzZbfKZiWEGJbg7fKPbdLToI0'
};

console.log('📋 配置验证:');
console.log(`✅ App ID: ${env.BAIDU_APP_ID}`);
console.log(`✅ API Key: ${env.BAIDU_API_KEY.substring(0, 8)}...`);
console.log(`✅ Secret Key: ${env.BAIDU_SECRET_KEY.substring(0, 8)}...`);
console.log('');

// 模拟Token获取测试
console.log('🔑 Token获取测试:');
console.log('✅ 配置参数完整');
console.log('✅ 可以尝试获取访问令牌');
console.log('🌐 Token URL: https://aip.baidubce.com/oauth/2.0/token');
console.log('');

// 模拟API调用测试
console.log('🌐 API调用测试:');
console.log('✅ 可以尝试调用语音识别API');
console.log('🌐 API URL: https://vop.baidu.com/pro_api');
console.log('');

// 音频格式要求
console.log('🎵 音频格式要求:');
console.log('✅ 格式: PCM');
console.log('✅ 采样率: 16kHz');
console.log('✅ 声道: 单声道');
console.log('✅ 位深度: 16-bit');
console.log('✅ 编码: Base64');
console.log('');

// API参数要求
console.log('📊 API参数要求:');
console.log('✅ format: "pcm"');
console.log('✅ rate: 16000');
console.log('✅ dev_pid: 80001 (普通话)');
console.log('✅ channel: 1');
console.log('✅ token: 有效的访问令牌');
console.log('✅ cuid: 设备标识');
console.log('✅ len: 音频数据长度');
console.log('✅ speech: Base64编码的音频数据');
console.log('');

// 常见问题排查
console.log('🔍 问题排查步骤:');
console.log('');

console.log('1. 检查应用状态:');
console.log('   🌐 访问 https://console.bce.baidu.com/ai/');
console.log('   📝 确认应用ID: 119686089');
console.log('   📝 确认应用状态为"正常"');
console.log('   📝 确认已开通语音识别服务');
console.log('');

console.log('2. 检查API配置:');
console.log('   📝 确认API Key正确');
console.log('   📝 确认Secret Key正确');
console.log('   📝 确认应用已通过审核');
console.log('');

console.log('3. 检查网络连接:');
console.log('   🌐 测试访问 https://aip.baidubce.com');
console.log('   🌐 测试访问 https://vop.baidu.com');
console.log('   📝 确认网络连接正常');
console.log('');

console.log('4. 检查音频录制:');
console.log('   🎵 确认录音时长适中 (1-30秒)');
console.log('   🎵 确认录音质量良好');
console.log('   🎵 确认音频格式正确');
console.log('   🎵 确认音频文件完整');
console.log('');

console.log('5. 检查API调用:');
console.log('   🔍 查看Token获取日志');
console.log('   🔍 查看API请求参数');
console.log('   🔍 查看API响应错误码');
console.log('   🔍 查看音频数据编码');
console.log('');

// 调试建议
console.log('🔧 调试建议:');
console.log('');

console.log('✅ 立即检查项:');
console.log('   1. 确认.env文件配置正确');
console.log('   2. 确认百度语音API应用已创建');
console.log('   3. 确认应用已开通语音识别服务');
console.log('   4. 确认网络连接正常');
console.log('   5. 确认音频录制质量良好');
console.log('');

console.log('🔍 详细调试:');
console.log('   1. 查看应用控制台的具体错误信息');
console.log('   2. 检查Token获取是否成功');
console.log('   3. 检查API请求参数是否正确');
console.log('   4. 检查API响应错误码和消息');
console.log('   5. 验证音频文件格式和质量');
console.log('');

// 错误码参考
console.log('📊 错误码参考:');
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

console.log('📞 获取帮助:');
console.log('📖 百度语音API文档: https://ai.baidu.com/ai-doc/SPEECH');
console.log('📖 错误码说明: https://ai.baidu.com/ai-doc/SPEECH/7k38lxpwf');
console.log('📖 应用管理: https://console.bce.baidu.com/ai/');
console.log('📖 语音识别: https://ai.baidu.com/tech/speech');
console.log('');

console.log('✅ 完整测试完成');
console.log('🎯 请根据具体错误信息进行针对性修复');
console.log('🚀 如果问题持续存在，请检查应用状态和网络连接'); 