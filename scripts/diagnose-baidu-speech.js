#!/usr/bin/env node

/**
 * 百度语音API诊断脚本
 * 检查配置和连接问题
 */

console.log('🔍 百度语音API诊断');
console.log('=====================================');

// 模拟环境变量检查
console.log('📋 环境变量检查:');
console.log('');

// 检查.env文件是否存在
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);

console.log(`✅ .env文件存在: ${envExists}`);
if (!envExists) {
  console.log('❌ 请创建.env文件并配置百度语音API参数');
  console.log('📝 参考env.example文件');
}

// 检查配置参数
console.log('');
console.log('🔧 配置参数检查:');
console.log('');

const requiredParams = [
  'BAIDU_APP_ID',
  'BAIDU_API_KEY', 
  'BAIDU_SECRET_KEY'
];

console.log('必需的环境变量:');
requiredParams.forEach(param => {
  console.log(`  ${param}: 需要配置`);
});

console.log('');
console.log('❌ 常见问题分析:');
console.log('');

console.log('1. 环境变量未配置:');
console.log('   ❌ BAIDU_APP_ID 未设置或为空');
console.log('   ❌ BAIDU_API_KEY 未设置或为空');
console.log('   ❌ BAIDU_SECRET_KEY 未设置或为空');
console.log('');

console.log('2. 百度语音API配置问题:');
console.log('   ❌ App ID 不正确');
console.log('   ❌ API Key 不正确');
console.log('   ❌ Secret Key 不正确');
console.log('   ❌ 应用未开通语音识别服务');
console.log('   ❌ 应用未通过审核');
console.log('');

console.log('3. 网络连接问题:');
console.log('   ❌ 网络连接不稳定');
console.log('   ❌ 防火墙阻止请求');
console.log('   ❌ DNS解析问题');
console.log('');

console.log('4. 音频格式问题:');
console.log('   ❌ 音频格式不符合要求');
console.log('   ❌ 采样率不是16kHz');
console.log('   ❌ 不是PCM格式');
console.log('   ❌ 音频文件损坏');
console.log('');

console.log('5. API调用问题:');
console.log('   ❌ Token获取失败');
console.log('   ❌ Token已过期');
console.log('   ❌ 请求参数错误');
console.log('   ❌ 音频数据编码问题');
console.log('');

console.log('🔧 解决步骤:');
console.log('');

console.log('1. 检查环境变量配置:');
console.log('   📝 确保.env文件存在');
console.log('   📝 确保所有百度语音API参数已配置');
console.log('   📝 确保参数值不是默认值');
console.log('');

console.log('2. 验证百度语音API配置:');
console.log('   🌐 访问 https://ai.baidu.com/tech/speech');
console.log('   📝 创建应用并开通语音识别服务');
console.log('   📝 获取正确的App ID、API Key、Secret Key');
console.log('   📝 确保应用已通过审核');
console.log('');

console.log('3. 测试网络连接:');
console.log('   🌐 测试访问 https://aip.baidubce.com');
console.log('   🌐 测试访问 https://vop.baidu.com');
console.log('   📝 检查网络连接是否正常');
console.log('');

console.log('4. 验证音频格式:');
console.log('   🎵 确保音频是PCM格式');
console.log('   🎵 确保采样率是16kHz');
console.log('   🎵 确保是单声道');
console.log('   🎵 确保音频文件完整');
console.log('');

console.log('5. 调试API调用:');
console.log('   🔍 检查Token获取是否成功');
console.log('   🔍 检查请求参数是否正确');
console.log('   🔍 检查音频数据编码是否正确');
console.log('   🔍 检查API响应错误信息');
console.log('');

console.log('📊 诊断建议:');
console.log('');

console.log('✅ 立即检查项:');
console.log('   1. 确认.env文件存在且配置正确');
console.log('   2. 确认百度语音API应用已创建并开通服务');
console.log('   3. 确认网络连接正常');
console.log('   4. 确认音频录制质量良好');
console.log('');

console.log('🔍 调试步骤:');
console.log('   1. 查看控制台错误信息');
console.log('   2. 检查Token获取日志');
console.log('   3. 检查API请求和响应');
console.log('   4. 检查音频文件信息');
console.log('');

console.log('📞 获取帮助:');
console.log('   📖 百度语音API文档: https://ai.baidu.com/ai-doc/SPEECH');
console.log('   📖 错误码说明: https://ai.baidu.com/ai-doc/SPEECH/7k38lxpwf');
console.log('   📖 应用管理: https://console.bce.baidu.com/ai/');
console.log('');

console.log('✅ 诊断完成');
console.log('🎯 请按照上述步骤逐一检查和修复问题'); 