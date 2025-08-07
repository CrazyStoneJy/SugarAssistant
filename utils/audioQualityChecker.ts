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
 * 预处理音频文件，确保质量适合语音识别
 */
export async function preprocessAudio(audioUri: string): Promise<string> {
  try {
    console.log('🔧 开始PCM音频预处理...');
    
    // 获取音频文件信息
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error('音频文件不存在');
    }
    
    // 检查文件大小 - 针对PCM格式优化
    const fileSize = fileInfo.size || 0;
    if (fileSize < 300) { // 小于300字节 - PCM格式更宽松的标准
      throw new Error('音频文件太小，可能录音时间过短');
    }
    
    // 如果文件大小合理，直接返回原文件
    // 在实际应用中，这里可以添加音频格式转换、降噪等处理
    console.log('✅ PCM音频预处理完成');
    return audioUri;
    
  } catch (error) {
    console.error('❌ 音频预处理失败:', error);
    throw new Error('音频预处理失败');
  }
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
    
    // 更准确的音频时长计算 - 针对PCM格式优化
    // PCM格式文件头较小，通常只有几个字节的元数据
    const headerSize = 50; // PCM格式文件头较小，预留50字节
    const actualAudioSize = Math.max(fileSize - headerSize, 0);
    
    // 16kHz采样率，16位深度，单声道 = 32000字节/秒
    const bytesPerSecond = 16000 * 2 * 1; // 采样率 * 字节数/样本 * 声道数
    const estimatedDuration = actualAudioSize / bytesPerSecond;
    const duration = Math.max(estimatedDuration, 0);
    
    console.log('📊 PCM音频文件分析:', {
      fileSize,
      fileSizeKB: Math.round(fileSize / 1024),
      actualAudioSize,
      headerSize,
      bytesPerSecond,
      estimatedDuration: Math.round(duration * 100) / 100,
      format: 'PCM',
    });
    
    // 检查音频质量
    const issues: string[] = [];
    let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    
    // 检查文件大小 - 针对PCM格式优化
    if (fileSize < 300) { // 小于300字节 - PCM格式更宽松的标准
      issues.push('文件太小，可能录音时间过短');
      quality = 'poor';
    } else if (fileSize > 100 * 1024 * 1024) { // 大于100MB
      issues.push('文件太大，可能录音时间过长');
      quality = 'poor';
    }
    
    // 检查录音时长 - 针对PCM格式优化
    if (duration < 0.2) { // 小于0.2秒 - PCM格式更宽松的标准
      issues.push(`录音时间过短 (${Math.round(duration * 100) / 100}秒)，建议至少0.3秒`);
      quality = 'poor';
    } else if (duration > 300) { // 大于5分钟
      issues.push(`录音时间过长 (${Math.round(duration * 100) / 100}秒)，建议不超过5分钟`);
      quality = 'fair';
    }
    
    // 检查文件大小与时长比例 - 针对PCM格式优化
    const sizePerSecond = fileSize / Math.max(duration, 1);
    if (sizePerSecond < 6000) { // 低于6kHz采样率估算 - PCM格式更宽松的标准
      issues.push('音频质量可能过低，建议使用高质量录音');
      quality = 'fair';
    }
    
    return {
      fileSize,
      duration,
      sampleRate: 16000, // 假设使用16kHz
      channels: 1, // 假设单声道
      bitRate: 256000, // 假设256kbps
      format: 'pcm',
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
  
  // 添加具体建议 - 针对PCM格式优化
  if (info.duration < 0.2) {
    suggestions.push('💡 建议录音时间至少0.2秒');
  }
  
  if (info.duration > 60) {
    suggestions.push('💡 建议录音时间不超过60秒');
  }
  
  if (info.fileSize < 300) {
    suggestions.push('💡 PCM录音文件较小，请确保录到了声音');
  }
  
  return suggestions;
}

/**
 * 检查是否适合语音识别
 */
export function isSuitableForSpeechRecognition(info: AudioQualityInfo): boolean {
  // 更宽松的标准，只要不是poor质量就认为适合
  return info.quality !== 'poor';
}

/**
 * 获取音频质量评分
 */
export function getAudioQualityScore(info: AudioQualityInfo): number {
  let score = 100;
  
  // 根据问题数量扣分 - 更宽松的扣分标准
  score -= info.issues.length * 10;
  
  // 根据质量等级调整 - 更宽松的评分标准
  switch (info.quality) {
    case 'excellent':
      score = Math.min(score, 100);
      break;
    case 'good':
      score = Math.min(score, 90);
      break;
    case 'fair':
      score = Math.min(score, 70);
      break;
    case 'poor':
      score = Math.min(score, 50);
      break;
  }
  
  return Math.max(score, 0);
} 