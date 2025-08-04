import * as FileSystem from 'expo-file-system';

export interface AudioQualityInfo {
  fileSize: number;
  duration: number;
  sampleRate: number;
  channels: number;
  bitRate: number;
  format: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
}

/**
 * 检查音频文件质量是否适合语音识别
 */
export async function checkAudioQuality(audioUri: string): Promise<AudioQualityInfo> {
  try {
    // 获取文件信息
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error('音频文件不存在');
    }

    const fileSize = fileInfo.size || 0;
    
    // 这里应该使用音频分析库来获取详细信息
    // 由于Expo的限制，我们使用基本的文件大小和时长估算
    
    // 估算音频时长（基于文件大小和比特率）
    const estimatedDuration = fileSize / (16000 * 2 * 1); // 16kHz, 16-bit, 单声道
    const duration = Math.max(estimatedDuration, 0);
    
    // 检查音频质量
    const issues: string[] = [];
    let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    
    // 检查文件大小
    if (fileSize < 1024) { // 小于1KB
      issues.push('文件太小，可能录音时间过短');
      quality = 'poor';
    } else if (fileSize > 10 * 1024 * 1024) { // 大于10MB
      issues.push('文件太大，可能录音时间过长');
      quality = 'poor';
    }
    
    // 检查录音时长
    if (duration < 0.5) { // 小于0.5秒
      issues.push('录音时间过短，建议至少1秒');
      quality = 'poor';
    } else if (duration > 60) { // 大于60秒
      issues.push('录音时间过长，建议不超过60秒');
      quality = 'fair';
    }
    
    // 检查文件大小与时长比例
    const sizePerSecond = fileSize / duration;
    if (sizePerSecond < 16000) { // 低于16kHz采样率
      issues.push('音频质量可能过低，建议使用高质量录音');
      quality = 'fair';
    }
    
    return {
      fileSize,
      duration,
      sampleRate: 16000, // 假设使用16kHz
      channels: 1, // 假设单声道
      bitRate: 256000, // 假设256kbps
      format: 'wav',
      quality,
      issues,
    };
  } catch (error) {
    console.error('音频质量检查失败:', error);
    throw new Error('音频质量检查失败');
  }
}

/**
 * 获取音频质量建议
 */
export function getAudioQualitySuggestions(info: AudioQualityInfo): string[] {
  const suggestions: string[] = [];
  
  if (info.quality === 'poor') {
    suggestions.push('❌ 音频质量较差，建议重新录音');
  } else if (info.quality === 'fair') {
    suggestions.push('⚠️ 音频质量一般，可能影响识别准确率');
  } else {
    suggestions.push('✅ 音频质量良好，适合语音识别');
  }
  
  // 添加具体建议
  if (info.duration < 1) {
    suggestions.push('💡 建议录音时间至少1秒');
  }
  
  if (info.duration > 30) {
    suggestions.push('💡 建议录音时间不超过30秒');
  }
  
  if (info.fileSize < 2048) {
    suggestions.push('💡 录音文件太小，可能没有录到声音');
  }
  
  return suggestions;
}

/**
 * 检查是否适合语音识别
 */
export function isSuitableForSpeechRecognition(info: AudioQualityInfo): boolean {
  return info.quality !== 'poor' && info.issues.length === 0;
}

/**
 * 获取音频质量评分
 */
export function getAudioQualityScore(info: AudioQualityInfo): number {
  let score = 100;
  
  // 根据问题数量扣分
  score -= info.issues.length * 20;
  
  // 根据质量等级调整
  switch (info.quality) {
    case 'excellent':
      score = Math.min(score, 100);
      break;
    case 'good':
      score = Math.min(score, 80);
      break;
    case 'fair':
      score = Math.min(score, 60);
      break;
    case 'poor':
      score = Math.min(score, 40);
      break;
  }
  
  return Math.max(score, 0);
} 