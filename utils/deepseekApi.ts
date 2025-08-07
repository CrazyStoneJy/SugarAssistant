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

interface DeepSeekStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
    };
    finish_reason: string | null;
  }>;
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
   * 发送聊天消息到DeepSeek API（非流式）
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
        let errorMessage = `API请求失败: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.error?.message || errorData.message || '未知错误'}`;
          console.error('API错误详情:', errorData);
        } catch (parseError) {
          console.error('无法解析错误响应:', parseError);
        }
        throw new Error(errorMessage);
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
   * 流式发送聊天消息到DeepSeek API
   */
  async chatStream(
    messages: DeepSeekMessage[], 
    onChunk: (chunk: string) => void,
    onComplete: (fullResponse: string) => void,
    onError: (error: Error) => void,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<void> {
    if (!this.isConfigured()) {
      const error = new Error('DeepSeek API未配置，请检查环境变量或手动配置API密钥');
      console.error('API配置错误:', error.message);
      onError(error);
      return;
    }

    try {
      const requestBody: DeepSeekRequest = {
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
        stream: true, // 启用流式传输
      };

      // console.log('🔧 流式API请求配置:', {
      //   url: `${this.baseUrl}/chat/completions`,
      //   model: this.model,
      //   messageCount: messages.length,
      //   hasApiKey: !!this.apiKey,
      // });

      console.log("deepseek stream requestBody", JSON.stringify(requestBody));
      

                    // 使用XMLHttpRequest替代fetch，对流式数据支持更好
      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.open('POST', `${this.baseUrl}/chat/completions`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'text/event-stream');
        xhr.setRequestHeader('Authorization', `Bearer ${this.apiKey || ''}`);
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        
        let fullResponse = '';
        let buffer = '';
        
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.LOADING) {
            // 处理流式数据
            const newData = xhr.responseText.substring(buffer.length);
            buffer = xhr.responseText;
            
            if (newData) {
              const lines = newData.split('\n');
              
              for (const line of lines) {
                if (line.trim() === '') continue;
                
                // console.log('📝 原始行:', line);
                
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  
                  // console.log('📦 数据块:', data);
                  
                  if (data === '[DONE]') {
                    console.log('✅ 收到流式传输完成信号');
                    onComplete(fullResponse);
                    resolve();
                    return;
                  }

                  try {
                    const parsed: DeepSeekStreamResponse = JSON.parse(data);
                    // console.log('🔍 解析结果:', parsed);
                    
                    if (parsed.choices && parsed.choices.length > 0) {
                      const choice = parsed.choices[0];
                      
                      if (choice.delta.content) {
                        const content = choice.delta.content;
                        fullResponse += content;
                        // console.log('📤 发送内容块:', content);
                        onChunk(content);
                      }

                      if (choice.finish_reason) {
                        console.log('✅ 流式传输完成，原因:', choice.finish_reason);
                        onComplete(fullResponse);
                        resolve();
                        return;
                      }
                    }
                  } catch (parseError) {
                    console.warn('解析SSE数据失败:', parseError, '原始数据:', data);
                  }
                } else {
                  console.log('📝 非SSE数据行:', line);
                }
              }
            }
          } else if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              console.log('✅ XMLHttpRequest流式传输完成');
              onComplete(fullResponse);
              resolve();
            } else {
              const error = new Error(`XMLHttpRequest失败: ${xhr.status} ${xhr.statusText}`);
              console.error('XMLHttpRequest错误:', error);
              onError(error);
              reject(error);
            }
          }
        };
        
        xhr.onerror = function() {
          const error = new Error('XMLHttpRequest网络错误');
          console.error('XMLHttpRequest网络错误:', error);
          onError(error);
          reject(error);
        };
        
        xhr.send(JSON.stringify(requestBody));
      });

      
    } catch (error) {
      console.error('DeepSeek API流式调用失败:', error);
      onError(error as Error);
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
export const DEFAULT_SYSTEM_PROMPT = `你是一位专业的营养师，专精于血糖控制、低升糖饮食、代谢综合征管理。
你的任务是根据用户提供的信息（如年龄、性别、生活习惯、体重目标、三餐情况等），量身定制控糖方案，包括但不限于饮食建议、血糖监测技巧、饮食误区提示、运动建议等。
你必须用通俗易懂、可执行性强的语言回答，避免空泛建议。每次建议都要结合控糖原理，并考虑用户的现实情况。
对于食物的检测，请参考《中华人民共和国卫生行业标准--食物血糖生成指数测定方法》，并参考食物血糖生成指数表。
你的回答应避免出现比较专业的术语，请用最简单的语言回答。可以把我当成一个营养学的门外汉来看待，一定要用通俗易懂的方式回答。

`;

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
 * 发送消息到DeepSeek API（非流式，包含OCR数据）
 */
export async function sendMessageToDeepSeek(
  userMessage: string,
  conversationHistory: DeepSeekMessage[] = [],
  ocrData: string[] = []
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
    // 构建包含异常指标OCR数据的system prompt
    let systemPrompt = DEFAULT_SYSTEM_PROMPT;
    
    if (ocrData.length > 0) {
      // 过滤出异常指标数据
      const abnormalData = filterAbnormalIndicators(ocrData);
      
      if (abnormalData.length > 0) {
        const ocrContext = `\n\n用户上传的图片中识别到的异常指标数据：\n${abnormalData.map((text, index) => `${index + 1}. ${text}`).join('\n')}\n\n请基于这些异常指标数据，结合营养师的专业知识，为用户提供针对性的饮食建议和血糖控制建议。重点关注异常指标的改善方案。`;
        systemPrompt += ocrContext;
        console.log("异常指标数据已添加到system prompt:", abnormalData);
      } else {
        console.log("未发现异常指标数据，使用默认system prompt");
      }
    }

    console.log("systemPrompt", systemPrompt);

    // 构建消息历史
    const messages: DeepSeekMessage[] = [
      deepseekAPI!.createSystemMessage(systemPrompt),
      ...conversationHistory,
      deepseekAPI!.createUserMessage(userMessage),
    ];

    console.log("history messages", messages);
    console.log("OCR data included:", ocrData.length > 0 ? ocrData.length : "无");
    console.log("Abnormal indicators found:", filterAbnormalIndicators(ocrData).length);

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
 * 流式发送消息到DeepSeek API（包含异常指标OCR数据）
 */
export async function sendMessageToDeepSeekStream(
  userMessage: string,
  conversationHistory: DeepSeekMessage[] = [],
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void,
  onError: (error: Error) => void,
  historicalAbnormalData: string[] = []
): Promise<void> {
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
    // 构建包含异常指标OCR数据的system prompt
    let systemPrompt = DEFAULT_SYSTEM_PROMPT;
    
    // 添加历史异常指标数据
    if (historicalAbnormalData.length > 0) {
      const historicalContext = `\n\n用户历史异常指标数据：\n${historicalAbnormalData.map((text, index) => `${index + 1}. ${text}`).join('\n')}\n\n请基于这些历史异常指标数据，结合营养师的专业知识，为用户提供针对性的饮食建议和血糖控制建议。重点关注异常指标的改善方案。`;
      systemPrompt += historicalContext;
      console.log("历史异常指标数据已添加到system prompt:", historicalAbnormalData.length, "条");
    }
    
    console.log("systemPrompt", systemPrompt)
    
    // 构建消息历史
    const messages: DeepSeekMessage[] = [
      deepseekAPI!.createSystemMessage(systemPrompt),
      ...conversationHistory,
      deepseekAPI!.createUserMessage(userMessage),
    ];

    // 调用流式API
    await deepseekAPI!.chatStream(
      messages,
      onChunk,
      onComplete,
      onError,
      {
        temperature: 0.7,
        maxTokens: 1000,
      }
    );
  } catch (error) {
    console.error('流式发送消息到DeepSeek失败:', error);
    onError(error as Error);
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

/**
 * 过滤OCR数据，只保留异常指标的数据
 */
export function filterAbnormalIndicators(ocrData: string[]): string[] {
  const abnormalData: string[] = [];
  
  // 定义异常指标的关键词和模式
  const abnormalPatterns = [
    // 血糖相关异常
    /血糖.*[>≥]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL)/i,
    /血糖.*[<≤]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL)/i,
    /空腹血糖.*[>≥]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL)/i,
    /餐后血糖.*[>≥]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL)/i,
    
    // 血压相关异常
    /血压.*[>≥]?\s*\d+\/\d+\s*mmHg/i,
    /收缩压.*[>≥]?\s*\d+\s*mmHg/i,
    /舒张压.*[>≥]?\s*\d+\s*mmHg/i,
    
    // 体重相关异常
    /体重.*[>≥]?\s*\d+\.?\d*\s*kg/i,
    /BMI.*[>≥]?\s*\d+\.?\d*/i,
    
    // 血脂相关异常
    /胆固醇.*[>≥]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL)/i,
    /甘油三酯.*[>≥]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL)/i,
    /HDL.*[<≤]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL)/i,
    /LDL.*[>≥]?\s*\d+\.?\d*\s*(mmol\/L|mg\/dL)/i,
    
    // 其他异常指标
    /尿酸.*[>≥]?\s*\d+\.?\d*\s*(μmol\/L|mg\/dL)/i,
    /肌酐.*[>≥]?\s*\d+\.?\d*\s*(μmol\/L|mg\/dL)/i,
    /转氨酶.*[>≥]?\s*\d+\.?\d*\s*(U\/L)/i,
    
    // 异常关键词
    /异常|偏高|偏低|升高|降低|超标|超限|危险|警告|注意/i,
    /糖尿病|高血压|高血脂|肥胖|代谢综合征/i,
  ];
  
  ocrData.forEach(text => {
    // 检查是否包含异常指标
    const hasAbnormalIndicator = abnormalPatterns.some(pattern => pattern.test(text));
    
    if (hasAbnormalIndicator) {
      abnormalData.push(text);
    }
  });
  
  return abnormalData;
}

/**
 * 创建包含异常指标OCR数据的system message
 */
export function createSystemMessageWithAbnormalOcrData(ocrData: string[] = []): DeepSeekMessage {
  if (!deepseekAPI) {
    throw new Error('DeepSeek API未初始化');
  }

  let systemPrompt = DEFAULT_SYSTEM_PROMPT;
  
  if (ocrData.length > 0) {
    // 过滤出异常指标数据
    const abnormalData = filterAbnormalIndicators(ocrData);
    
    if (abnormalData.length > 0) {
      const ocrContext = `\n\n用户上传的图片中识别到的异常指标数据：\n${abnormalData.map((text, index) => `${index + 1}. ${text}`).join('\n')}\n\n请基于这些异常指标数据，结合营养师的专业知识，为用户提供针对性的饮食建议和血糖控制建议。重点关注异常指标的改善方案。`;
      systemPrompt += ocrContext;
    }
  }

  return deepseekAPI.createSystemMessage(systemPrompt);
}

export type { DeepSeekMessage, DeepSeekRequest, DeepSeekResponse, DeepSeekStreamResponse };
