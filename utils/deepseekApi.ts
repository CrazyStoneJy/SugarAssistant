import { getDeepSeekAPIKey, getDeepSeekBaseURL, getDeepSeekModel, isEnvConfigured } from '@/config/env';

interface DeepSeekMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class DeepSeekAPI {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey?: string, model?: string, baseUrl?: string) {
    // 优先使用传入的参数，否则从环境变量读取
    this.apiKey = apiKey || getDeepSeekAPIKey();
    this.baseUrl = baseUrl || getDeepSeekBaseURL();
    this.model = model || getDeepSeekModel();
  }

  /**
   * 检查API是否已正确配置
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_deepseek_api_key_here';
  }

  /**
   * 发送聊天消息到DeepSeek API
   */
  async chat(messages: DeepSeekMessage[], options: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  } = {}): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('DeepSeek API未配置，请检查环境变量或手动配置API密钥');
    }

    try {
      const requestBody: DeepSeekRequest = {
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
        stream: options.stream ?? false,
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorData.error?.message || '未知错误'}`);
      }

      const data: DeepSeekResponse = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        throw new Error('API返回的响应格式不正确');
      }
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      throw error;
    }
  }

  /**
   * 创建系统消息
   */
  createSystemMessage(content: string): DeepSeekMessage {
    return {
      role: 'system',
      content,
    };
  }

  /**
   * 创建用户消息
   */
  createUserMessage(content: string): DeepSeekMessage {
    return {
      role: 'user',
      content,
    };
  }

  /**
   * 创建助手消息
   */
  createAssistantMessage(content: string): DeepSeekMessage {
    return {
      role: 'assistant',
      content,
    };
  }

  /**
   * 获取API配置信息
   */
  getConfig() {
    return {
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : '未配置',
      model: this.model,
      baseUrl: this.baseUrl,
      isConfigured: this.isConfigured(),
    };
  }
}

// 默认的系统提示词
const DEFAULT_SYSTEM_PROMPT = `你是一个智能AI助手，名为SugarAssistant。你具有以下特点：

1. 友好和耐心：总是以友好、耐心的态度回应用户
2. 专业和准确：提供准确、有用的信息和建议
3. 简洁明了：用简洁明了的语言回答问题
4. 多语言支持：能够用中文和英文进行交流
5. 上下文理解：能够理解对话的上下文，保持连贯性

请根据用户的问题提供有帮助的回答。`;

// 创建API实例
let deepseekAPI: DeepSeekAPI | null = null;

/**
 * 初始化DeepSeek API
 */
export function initDeepSeekAPI(apiKey?: string, model?: string, baseUrl?: string): void {
  deepseekAPI = new DeepSeekAPI(apiKey, model, baseUrl);
}

/**
 * 检查API是否已初始化
 */
export function isAPIInitialized(): boolean {
  return deepseekAPI !== null && deepseekAPI.isConfigured();
}

/**
 * 自动初始化API（从环境变量读取配置）
 */
export function autoInitAPI(): boolean {
  if (isEnvConfigured()) {
    initDeepSeekAPI();
    return true;
  }
  return false;
}

/**
 * 发送消息到DeepSeek API
 */
export async function sendMessageToDeepSeek(
  userMessage: string,
  conversationHistory: DeepSeekMessage[] = []
): Promise<string> {
  if (!deepseekAPI) {
    // 尝试自动初始化
    if (!autoInitAPI()) {
      throw new Error('DeepSeek API未初始化，请先调用initDeepSeekAPI()或配置环境变量');
    }
  }

  if (!deepseekAPI?.isConfigured()) {
    throw new Error('DeepSeek API未配置，请检查环境变量或手动配置API密钥');
  }

  try {
    // 构建消息历史
    const messages: DeepSeekMessage[] = [
      deepseekAPI!.createSystemMessage(DEFAULT_SYSTEM_PROMPT),
      ...conversationHistory,
      deepseekAPI!.createUserMessage(userMessage),
    ];

    console.log("history messages", messages);

    // 调用API
    const response = await deepseekAPI!.chat(messages, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    console.log("response", response);

    return response;
  } catch (error) {
    console.error('发送消息到DeepSeek失败:', error);
    throw error;
  }
}

/**
 * 获取API使用情况
 */
export function getAPIStatus(): {
  initialized: boolean;
  configured: boolean;
  model?: string;
  config?: any;
} {
  return {
    initialized: deepseekAPI !== null,
    configured: deepseekAPI?.isConfigured() || false,
    model: deepseekAPI?.getConfig()?.model,
    config: deepseekAPI?.getConfig(),
  };
}

export type { DeepSeekMessage, DeepSeekRequest, DeepSeekResponse };
