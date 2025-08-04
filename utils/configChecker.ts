import { isEnvConfigured, getDeepSeekAPIKey, getDeepSeekModel, getDeepSeekBaseURL } from '@/config/env';

/**
 * 检查环境变量配置状态
 */
export function checkEnvironmentConfig() {
  console.log('🔍 环境变量配置检查开始...');
  
  const apiKey = getDeepSeekAPIKey();
  const model = getDeepSeekModel();
  const baseUrl = getDeepSeekBaseURL();
  const isConfigured = isEnvConfigured();
  
  console.log('📋 配置详情:');
  console.log(`  API密钥: ${apiKey ? `${apiKey.substring(0, 8)}...` : '未配置'}`);
  console.log(`  模型名称: ${model}`);
  console.log(`  基础URL: ${baseUrl}`);
  console.log(`  配置状态: ${isConfigured ? '✅ 已配置' : '❌ 未配置'}`);
  
  if (isConfigured) {
    console.log('🎉 环境变量配置正确，可以使用真实AI对话！');
  } else {
    console.log('⚠️  环境变量未配置，将使用模拟AI');
    console.log('💡 提示：');
    console.log('  1. 确保项目根目录存在.env文件');
    console.log('  2. 在.env文件中配置DEEPSEEK_API_KEY');
    console.log('  3. 重启开发服务器：npm start -- --clear');
  }
  
  return {
    apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : '未配置',
    model,
    baseUrl,
    isConfigured,
  };
}

/**
 * 验证API配置是否有效
 */
export function validateAPIConfig() {
  const config = checkEnvironmentConfig();
  
  if (!config.isConfigured) {
    return {
      valid: false,
      message: '环境变量未配置',
      details: config,
    };
  }
  
  // 检查API密钥格式
  const apiKey = getDeepSeekAPIKey();
  if (!apiKey.startsWith('sk-')) {
    return {
      valid: false,
      message: 'API密钥格式不正确，应该以sk-开头',
      details: config,
    };
  }
  
  return {
    valid: true,
    message: 'API配置有效',
    details: config,
  };
} 