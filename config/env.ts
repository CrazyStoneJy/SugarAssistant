import {
  APP_NAME,
  APP_VERSION,
  DEEPSEEK_API_KEY,
  DEEPSEEK_BASE_URL,
  DEEPSEEK_MODEL,
} from '@env';

// 环境变量配置
export const ENV_CONFIG = {
  // DeepSeek API配置
  DEEPSEEK_API_KEY: DEEPSEEK_API_KEY || '',
  DEEPSEEK_MODEL: DEEPSEEK_MODEL || 'deepseek-chat',
  DEEPSEEK_BASE_URL: DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
  
  // 应用配置
  APP_NAME: APP_NAME || 'SugarAssistant',
  APP_VERSION: APP_VERSION || '1.0.0',
};

// 调试信息
console.log('🔧 环境变量配置:', {
  DEEPSEEK_API_KEY: ENV_CONFIG.DEEPSEEK_API_KEY ? `${ENV_CONFIG.DEEPSEEK_API_KEY.substring(0, 8)}...` : '未配置',
  DEEPSEEK_MODEL: ENV_CONFIG.DEEPSEEK_MODEL,
  DEEPSEEK_BASE_URL: ENV_CONFIG.DEEPSEEK_BASE_URL,
});

// 检查环境变量是否已配置
export function isEnvConfigured(): boolean {
  const isConfigured = !!ENV_CONFIG.DEEPSEEK_API_KEY && 
                      ENV_CONFIG.DEEPSEEK_API_KEY !== 'your_deepseek_api_key_here' &&
                      ENV_CONFIG.DEEPSEEK_API_KEY !== '';
  
  console.log('🔍 环境变量检查:', {
    hasApiKey: !!ENV_CONFIG.DEEPSEEK_API_KEY,
    isNotDefault: ENV_CONFIG.DEEPSEEK_API_KEY !== 'your_deepseek_api_key_here',
    isNotEmpty: ENV_CONFIG.DEEPSEEK_API_KEY !== '',
    isConfigured,
  });
  
  return isConfigured;
}

// 获取DeepSeek API密钥
export function getDeepSeekAPIKey(): string {
  return ENV_CONFIG.DEEPSEEK_API_KEY;
}

// 获取DeepSeek模型名称
export function getDeepSeekModel(): string {
  return ENV_CONFIG.DEEPSEEK_MODEL;
}

// 获取DeepSeek基础URL
export function getDeepSeekBaseURL(): string {
  return ENV_CONFIG.DEEPSEEK_BASE_URL;
} 