import { isBaiduSpeechConfigured, isEnvConfigured } from '@/config/env';
import { checkBaiduSpeechAvailability } from './baiduSpeechApi';

export interface ConfigStatus {
  deepseek: {
    isConfigured: boolean;
    hasApiKey: boolean;
    status: 'configured' | 'not_configured' | 'error';
  };
  baiduSpeech: {
    isConfigured: boolean;
    hasAppId: boolean;
    hasApiKey: boolean;
    hasSecretKey: boolean;
    isAvailable: boolean;
    status: 'configured' | 'not_configured' | 'error' | 'testing';
  };
  overall: {
    hasAnyApi: boolean;
    primaryService: 'deepseek' | 'baidu' | 'none';
  };
}

/**
 * 检查所有API配置状态
 */
export async function checkAllConfigs(): Promise<ConfigStatus> {
  const deepseekConfigured = isEnvConfigured();
  const baiduConfigured = isBaiduSpeechConfigured();
  
  let baiduAvailable = false;
  let baiduStatus: 'configured' | 'not_configured' | 'error' | 'testing' = 'not_configured';
  
  if (baiduConfigured) {
    try {
      baiduStatus = 'testing';
      baiduAvailable = await checkBaiduSpeechAvailability();
      baiduStatus = baiduAvailable ? 'configured' : 'error';
    } catch (error) {
      console.error('百度语音API可用性检查失败:', error);
      baiduStatus = 'error';
    }
  }
  
  const hasAnyApi = deepseekConfigured || baiduAvailable;
  let primaryService: 'deepseek' | 'baidu' | 'none' = 'none';
  
  if (deepseekConfigured) {
    primaryService = 'deepseek';
  } else if (baiduAvailable) {
    primaryService = 'baidu';
  }
  
  return {
    deepseek: {
      isConfigured: deepseekConfigured,
      hasApiKey: deepseekConfigured,
      status: deepseekConfigured ? 'configured' : 'not_configured',
    },
    baiduSpeech: {
      isConfigured: baiduConfigured,
      hasAppId: baiduConfigured,
      hasApiKey: baiduConfigured,
      hasSecretKey: baiduConfigured,
      isAvailable: baiduAvailable,
      status: baiduStatus,
    },
    overall: {
      hasAnyApi,
      primaryService,
    },
  };
}

/**
 * 获取配置状态的可读描述
 */
export function getConfigStatusDescription(status: ConfigStatus): string[] {
  const descriptions: string[] = [];
  
  // DeepSeek配置状态
  if (status.deepseek.status === 'configured') {
    descriptions.push('✅ DeepSeek API已配置');
  } else {
    descriptions.push('❌ DeepSeek API未配置');
  }
  
  // 百度语音API配置状态
  switch (status.baiduSpeech.status) {
    case 'configured':
      descriptions.push('✅ 百度语音API已配置并可用');
      break;
    case 'testing':
      descriptions.push('⏳ 正在测试百度语音API...');
      break;
    case 'error':
      descriptions.push('❌ 百度语音API配置错误');
      break;
    case 'not_configured':
      descriptions.push('❌ 百度语音API未配置');
      break;
  }
  
  // 整体状态
  if (status.overall.hasAnyApi) {
    descriptions.push(`✅ 主要服务: ${status.overall.primaryService}`);
  } else {
    descriptions.push('❌ 未配置任何API服务');
  }
  
  return descriptions;
}

/**
 * 获取配置建议
 */
export function getConfigSuggestions(status: ConfigStatus): string[] {
  const suggestions: string[] = [];
  
  if (!status.deepseek.isConfigured) {
    suggestions.push('1. 配置DeepSeek API密钥以使用AI聊天功能');
    suggestions.push('   - 在.env文件中设置DEEPSEEK_API_KEY');
  }
  
  if (!status.baiduSpeech.isConfigured) {
    suggestions.push('2. 配置百度语音API以使用语音识别功能');
    suggestions.push('   - 在.env文件中设置BAIDU_APP_ID、BAIDU_API_KEY、BAIDU_SECRET_KEY');
    suggestions.push('   - 访问 https://ai.baidu.com/tech/speech 获取密钥');
  } else if (status.baiduSpeech.status === 'error') {
    suggestions.push('3. 检查百度语音API配置');
    suggestions.push('   - 验证API密钥是否正确');
    suggestions.push('   - 检查网络连接');
  }
  
  if (!status.overall.hasAnyApi) {
    suggestions.push('4. 至少配置一个API服务以使用完整功能');
  }
  
  return suggestions;
}

/**
 * 验证配置是否完整
 */
export function isConfigComplete(status: ConfigStatus): boolean {
  return status.deepseek.isConfigured || status.baiduSpeech.isAvailable;
}

/**
 * 获取配置优先级
 */
export function getConfigPriority(status: ConfigStatus): string {
  if (status.deepseek.isConfigured && status.baiduSpeech.isAvailable) {
    return 'full'; // 完整配置
  } else if (status.deepseek.isConfigured) {
    return 'chat_only'; // 仅聊天功能
  } else if (status.baiduSpeech.isAvailable) {
    return 'speech_only'; // 仅语音功能
  } else {
    return 'none'; // 无配置
  }
} 