import { Audio } from 'expo-av';

// 模拟语音转文本功能
// 在实际应用中，这里应该调用真实的语音识别API
export async function convertSpeechToText(audioUri: string): Promise<string> {
  try {
    // 这里应该调用真实的语音识别API
    // 例如：Google Speech-to-Text, Azure Speech Services, 或百度语音识别等
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    ];
    
    // 根据哈希值选择结果，确保相同录音得到相同结果
    const index = hash % mockResults.length;
    return mockResults[index];
    
  } catch (error) {
    console.error('语音转文本失败:', error);
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

// 检查语音识别权限
export async function checkSpeechRecognitionPermission(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('权限检查失败:', error);
    return false;
  }
}

// 语音识别状态
export interface SpeechRecognitionState {
  isListening: boolean;
  isProcessing: boolean;
  error: string | null;
}

// 语音识别结果
export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}
 