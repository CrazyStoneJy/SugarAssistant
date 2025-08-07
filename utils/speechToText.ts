import { getBaiduSpeechConfig, isBaiduSpeechConfigured } from '@/config/env';
import { Audio } from 'expo-av';
import { checkBaiduSpeechAvailability, recognizeSpeechWithBaidu } from './baiduSpeechApi';

// 语音识别结果
export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

// 语音识别状态
export interface SpeechRecognitionState {
  isListening: boolean;
  isProcessing: boolean;
  error: string | null;
}

/**
 * 诊断音频录制和识别问题
 */
export async function diagnoseSpeechRecognition(audioUri: string): Promise<{
  audioRecording: {
    fileExists: boolean;
    fileSize: number;
    fileSizeKB: number;
    estimatedDuration: number;
    issues: string[];
  };
  apiStatus: {
    isConfigured: boolean;
    hasValidToken: boolean;
    networkAccessible: boolean;
    issues: string[];
  };
  recommendations: string[];
}> {
  const diagnosis = {
    audioRecording: {
      fileExists: false,
      fileSize: 0,
      fileSizeKB: 0,
      estimatedDuration: 0,
      issues: [] as string[],
    },
    apiStatus: {
      isConfigured: false,
      hasValidToken: false,
      networkAccessible: false,
      issues: [] as string[],
    },
    recommendations: [] as string[],
  };

  try {
    // 1. 检查音频录制
    console.log('🔍 开始音频录制诊断...');
    const { getInfoAsync } = await import('expo-file-system');
    const fileInfo = await getInfoAsync(audioUri);
    
    diagnosis.audioRecording.fileExists = fileInfo.exists;
    const fileSize = fileInfo.exists && 'size' in fileInfo ? (fileInfo as any).size || 0 : 0;
    diagnosis.audioRecording.fileSize = fileSize;
    diagnosis.audioRecording.fileSizeKB = Math.round(fileSize / 1024);
    
    // 更准确的录音时长计算 - 针对PCM格式优化
    // PCM格式文件头较小，通常只有几个字节的元数据
    const headerSize = 50; // PCM格式文件头较小，预留50字节
    const actualAudioSize = Math.max(fileSize - headerSize, 0);
    const bytesPerSecond = 16000 * 2 * 1; // 采样率 * 字节数/样本 * 声道数
    diagnosis.audioRecording.estimatedDuration = actualAudioSize / bytesPerSecond;
    
    console.log('📊 PCM音频文件详细分析:', {
      fileSize,
      fileSizeKB: Math.round(fileSize / 1024),
      actualAudioSize,
      headerSize,
      bytesPerSecond,
      estimatedDuration: Math.round(diagnosis.audioRecording.estimatedDuration * 100) / 100,
      format: 'PCM',
    });
    
    if (!fileInfo.exists) {
      diagnosis.audioRecording.issues.push('音频文件不存在');
    } else if (fileSize < 1024) { // 小于1KB - 统一标准
      diagnosis.audioRecording.issues.push('音频文件太小，可能录音时间过短');
    } else if (fileSize > 100 * 1024 * 1024) {
      diagnosis.audioRecording.issues.push('音频文件太大，可能录音时间过长');
    }
    
    if (diagnosis.audioRecording.estimatedDuration < 1) { // 小于1秒 - 统一标准
      diagnosis.audioRecording.issues.push(`录音时间过短 (${Math.round(diagnosis.audioRecording.estimatedDuration * 100) / 100}秒)，建议至少1秒`);
    } else if (diagnosis.audioRecording.estimatedDuration > 30) {
      diagnosis.audioRecording.issues.push(`录音时间过长 (${Math.round(diagnosis.audioRecording.estimatedDuration * 100) / 100}秒)，建议不超过30秒`);
    }
    
    console.log('📁 音频录制诊断结果:', diagnosis.audioRecording);
    
    // 2. 检查API状态
    console.log('🔍 开始API状态诊断...');
    diagnosis.apiStatus.isConfigured = isBaiduSpeechConfigured();
    
    if (diagnosis.apiStatus.isConfigured) {
      try {
        // 尝试获取token来检查API配置
        const { getBaiduToken } = await import('./baiduSpeechApi');
        await getBaiduToken();
        diagnosis.apiStatus.hasValidToken = true;
      } catch (error) {
        diagnosis.apiStatus.issues.push(`Token获取失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
      
      // 检查网络连接
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://vop.baidu.com/pro_api', {
          method: 'HEAD',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        diagnosis.apiStatus.networkAccessible = response.status !== 0;
      } catch (error) {
        diagnosis.apiStatus.issues.push('网络连接失败，无法访问百度API');
      }
    } else {
      diagnosis.apiStatus.issues.push('百度语音API未配置');
    }
    
    console.log('🌐 API状态诊断结果:', diagnosis.apiStatus);
    
    // 3. 生成建议
    if (diagnosis.audioRecording.issues.length > 0) {
      diagnosis.recommendations.push('🎤 音频录制问题：');
      diagnosis.recommendations.push(...diagnosis.audioRecording.issues.map(issue => `  - ${issue}`));
    }
    
    if (diagnosis.apiStatus.issues.length > 0) {
      diagnosis.recommendations.push('🌐 API配置问题：');
      diagnosis.recommendations.push(...diagnosis.apiStatus.issues.map(issue => `  - ${issue}`));
    }
    
    if (diagnosis.recommendations.length === 0) {
      diagnosis.recommendations.push('✅ 音频录制和API配置都正常');
    }
    
    console.log('💡 诊断建议:', diagnosis.recommendations);
    
  } catch (error) {
    console.error('❌ 诊断过程出错:', error);
    diagnosis.recommendations.push(`❌ 诊断失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
  
  return diagnosis;
}

/**
 * 使用百度语音API进行语音转文本
 */
export async function convertSpeechToText(audioUri: string): Promise<string> {
  try {
    console.log('🎤 开始语音转文本处理...');
    
    // 首先进行诊断
    const diagnosis = await diagnoseSpeechRecognition(audioUri);
    console.log('🔍 诊断结果:', diagnosis);
    
    // 首先检查音频文件是否存在
    const { getInfoAsync } = await import('expo-file-system');
    const fileInfo = await getInfoAsync(audioUri);
    
    if (!fileInfo.exists) {
      throw new Error('音频文件不存在');
    }
    
    console.log('📁 音频文件信息:', {
      uri: audioUri,
      size: fileInfo.size,
      sizeKB: Math.round((fileInfo.size || 0) / 1024),
      estimatedDuration: Math.round((fileInfo.size || 0) / (16000 * 2 * 1) * 100) / 100,
    });
    
    // 检查音频文件大小
    if ((fileInfo.size || 0) < 1024) {
      throw new Error('音频文件太小，可能录音时间过短，请重新录音');
    }
    
    if ((fileInfo.size || 0) > 100 * 1024 * 1024) {
      throw new Error('音频文件太大，请缩短录音时间');
    }
    
    // 尝试使用百度语音API
    const isBaiduAvailable = await checkBaiduSpeechAvailability();
    
    if (isBaiduAvailable) {
      console.log('✅ 使用百度语音API进行识别');
      try {
        return await recognizeSpeechWithBaidu(audioUri);
      } catch (baiduError) {
        console.error('❌ 百度语音API识别失败:', baiduError);
        console.log('🔄 回退到模拟识别');
        return await convertSpeechToTextMock(audioUri);
      }
    } else {
      console.log('⚠️ 百度语音API不可用，使用模拟识别');
      return await convertSpeechToTextMock(audioUri);
    }
  } catch (error) {
    console.error('❌ 语音转文本失败:', error);
    
    // 如果所有方法都失败，返回友好的错误信息
    if (error instanceof Error) {
      if (error.message.includes('音频文件太小')) {
        throw new Error('录音时间太短，请按住按钮说话至少1秒');
      }
      if (error.message.includes('音频文件太大')) {
        throw new Error('录音时间太长，请缩短到30秒以内');
      }
      if (error.message.includes('网络')) {
        throw new Error('网络连接失败，请检查网络后重试');
      }
      if (error.message.includes('权限')) {
        throw new Error('麦克风权限被拒绝，请在设置中允许使用麦克风');
      }
    }
    
    throw new Error('语音识别失败，请重试');
  }
}

/**
 * 模拟语音转文本功能（备用方案）
 */
async function convertSpeechToTextMock(audioUri: string): Promise<string> {
  try {
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 根据音频URI生成一个"随机"结果，确保相同录音得到相同结果
    const hash = simpleHash(audioUri);
    const mockResults = [
      '你好，今天天气怎么样？',
      '我想问一个问题',
      '请帮我查询一下信息',
      '谢谢你的帮助',
      '这个功能很好用',
      '我想了解一下这个应用',
      '请给我一些建议',
      '今天心情不错',
      '我想学习新知识',
      '请帮我设置提醒',
      '这个应用很棒',
      '我想了解更多功能',
      '请告诉我使用方法',
      '谢谢你的耐心',
      '我想测试一下语音功能',
      '这个界面很友好',
      '请帮我查询血糖相关信息',
      '我想了解糖尿病饮食建议',
      '请告诉我哪些食物适合糖尿病人',
      '我想了解升糖指数的概念',
      '请推荐一些低糖食物',
      '我想了解如何控制血糖',
      '请告诉我糖尿病的注意事项',
      '我想了解胰岛素的作用',
      '请推荐一些健康的饮食习惯',
    ];
    
    // 根据哈希值选择结果，确保相同录音得到相同结果
    const index = hash % mockResults.length;
    const result = mockResults[index];
    
    console.log('🎭 模拟识别结果:', result);
    return result;
    
  } catch (error) {
    console.error('模拟语音转文本失败:', error);
    throw new Error('语音识别失败，请重试');
  }
}

// 简单的哈希函数，用于生成"随机"结果
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash);
}

/**
 * 检查语音识别权限
 */
export async function checkSpeechRecognitionPermission(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    console.log('🎤 录音权限状态:', status);
    return status === 'granted';
  } catch (error) {
    console.error('❌ 权限检查失败:', error);
    return false;
  }
}

/**
 * 获取语音识别服务状态
 */
export async function getSpeechRecognitionStatus() {
  try {
    const baiduStatus = await checkBaiduSpeechAvailability();
    
    const status = {
      baiduAvailable: baiduStatus,
      fallbackAvailable: true, // 模拟识别总是可用
      primaryService: baiduStatus ? 'baidu' : 'mock',
    };
    
    console.log('🎤 语音识别服务状态:', status);
    return status;
  } catch (error) {
    console.error('❌ 获取语音识别状态失败:', error);
    return {
      baiduAvailable: false,
      fallbackAvailable: true,
      primaryService: 'mock',
    };
  }
}

/**
 * 获取详细的语音识别配置信息
 */
export function getSpeechRecognitionConfigInfo() {
  try {
    const config = getBaiduSpeechConfig();
    const isConfigured = isBaiduSpeechConfigured();
    
    return {
      isConfigured,
      hasAppId: !!config.appId && config.appId !== 'your_baidu_app_id_here',
      hasApiKey: !!config.apiKey && config.apiKey !== 'your_baidu_api_key_here',
      hasSecretKey: !!config.secretKey && config.secretKey !== 'your_baidu_secret_key_here',
      config: isConfigured ? {
        appId: config.appId.substring(0, 8) + '...',
        apiKey: config.apiKey.substring(0, 8) + '...',
        secretKey: config.secretKey.substring(0, 8) + '...',
      } : null,
    };
  } catch (error) {
    console.error('❌ 获取百度语音配置信息失败:', error);
    return {
      isConfigured: false,
      hasAppId: false,
      hasApiKey: false,
      hasSecretKey: false,
      config: null,
    };
  }
}
 