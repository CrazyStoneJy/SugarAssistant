import AsyncStorage from '@react-native-async-storage/async-storage';

interface APIConfig {
  deepseekApiKey: string;
  deepseekModel: string;
  isConfigured: boolean;
}

const DEFAULT_CONFIG: APIConfig = {
  deepseekApiKey: '',
  deepseekModel: 'deepseek-chat',
  isConfigured: false,
};

const CONFIG_STORAGE_KEY = 'sugar_assistant_api_config';

/**
 * 保存API配置
 */
export async function saveAPIConfig(config: Partial<APIConfig>): Promise<void> {
  try {
    const currentConfig = await getAPIConfig();
    const newConfig = { ...currentConfig, ...config, isConfigured: true };
    await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
  } catch (error) {
    console.error('保存API配置失败:', error);
    throw new Error('保存配置失败');
  }
}

/**
 * 获取API配置
 */
export async function getAPIConfig(): Promise<APIConfig> {
  try {
    const configString = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
    if (configString) {
      const config = JSON.parse(configString);
      return { ...DEFAULT_CONFIG, ...config };
    }
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('获取API配置失败:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * 清除API配置
 */
export async function clearAPIConfig(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CONFIG_STORAGE_KEY);
  } catch (error) {
    console.error('清除API配置失败:', error);
    throw new Error('清除配置失败');
  }
}

/**
 * 检查API是否已配置
 */
export async function isAPIConfigured(): Promise<boolean> {
  const config = await getAPIConfig();
  return config.isConfigured && !!config.deepseekApiKey;
}

/**
 * 获取DeepSeek API密钥
 */
export async function getDeepSeekAPIKey(): Promise<string> {
  const config = await getAPIConfig();
  return config.deepseekApiKey;
}

/**
 * 获取DeepSeek模型名称
 */
export async function getDeepSeekModel(): Promise<string> {
  const config = await getAPIConfig();
  return config.deepseekModel;
} 