import { getBaiduSpeechConfig, isBaiduSpeechConfigured } from '@/config/env';
import * as FileSystem from 'expo-file-system';

// 百度语音API接口类型定义
interface BaiduSpeechConfig {
  appId: string;
  apiKey: string;
  secretKey: string;
}

interface BaiduTokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

interface BaiduSpeechResponse {
  err_no: number;
  err_msg: string;
  sn: string;
  result: string[];
}

// 缓存token
let cachedToken: string | null = null;
let tokenExpireTime: number = 0;

/**
 * 获取百度语音API访问令牌
 */
async function getBaiduToken(): Promise<string> {
  const config = getBaiduSpeechConfig();
  
  // 检查是否已配置
  if (!isBaiduSpeechConfigured()) {
    throw new Error('百度语音API未配置，请在.env文件中配置BAIDU_APP_ID、BAIDU_API_KEY和BAIDU_SECRET_KEY');
  }

  // 检查缓存的token是否还有效
  const now = Date.now();
  if (cachedToken && now < tokenExpireTime) {
    return cachedToken;
  }

  try {
    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${config.apiKey}&client_secret=${config.secretKey}`;
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: BaiduTokenResponse = await response.json();

    if (data.error) {
      throw new Error(`获取百度语音API令牌失败: ${data.error_description || data.error}`);
    }

    if (!data.access_token) {
      throw new Error('获取百度语音API令牌失败: 未返回access_token');
    }

    // 缓存token，提前5分钟过期
    cachedToken = data.access_token;
    tokenExpireTime = now + (data.expires_in - 300) * 1000;

    console.log('✅ 成功获取百度语音API令牌, access_token', data.access_token);
    return data.access_token;
  } catch (error) {
    console.error('❌ 获取百度语音API令牌失败:', error);
    throw new Error(`获取百度语音API令牌失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 将音频文件转换为Base64编码，并返回原始字节数
 */
async function audioToBase64(audioUri: string): Promise<{ base64: string; originalLength: number }> {
  try {
    // 首先获取文件信息以获取原始字节数
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error('音频文件不存在');
    }
    
    const originalLength = fileInfo.size || 0;
    
    // 验证音频文件大小
    if (originalLength < 1024) {
      throw new Error('音频文件太小，可能录音时间过短');
    }
    
    if (originalLength > 100 * 1024 * 1024) {
      throw new Error('音频文件太大，请缩短录音时间');
    }
    
    console.log('📁 音频文件信息:', {
      uri: audioUri,
      size: originalLength,
      sizeKB: Math.round(originalLength / 1024),
    });
    
    // 读取文件为Base64编码
    const audioData = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    console.log('✅ 音频文件转Base64成功');
    
    return {
      base64: audioData,
      originalLength: originalLength,
    };
  } catch (error) {
    console.error('❌ 音频文件转Base64失败:', error);
    throw new Error('音频文件处理失败');
  }
}

/**
 * 使用百度语音API进行语音识别
 */
export async function recognizeSpeechWithBaidu(audioUri: string): Promise<string> {
  try {
    // 检查配置
    if (!isBaiduSpeechConfigured()) {
      throw new Error('百度语音API未配置');
    }

    console.log('🎤 开始百度语音识别...');

    // 获取访问令牌
    const accessToken = await getBaiduToken();

    console.log("baidu speech accessToken", accessToken);

    // 将音频文件转换为Base64
    const audioData = await audioToBase64(audioUri);

    // 调用百度语音识别API
    const speechUrl = `https://vop.baidu.com/pro_api`;
    
    // {
    //   "format":"pcm",
    //   "rate":16000,
    //   "dev_pid":80001,
    //   "channel":1,
    //   "token":xxx,
    //   "cuid":"baidu_workshop",
    //   "len":4096,
    //   "speech":"xxx", // xxx为 base64（FILE_CONTENT）
    // }

    const body = JSON.stringify({
      format: "pcm",
      rate: 16000,
      dev_pid: 80001, // 普通话(支持简单的英文识别) - 更准确的识别模型
      channel: 1,
      token: accessToken,
      cuid: getBaiduSpeechConfig().appId, // 使用App ID作为设备标识
      len: audioData.originalLength,
      speech: audioData.base64,
    });

    // console.log("baidu speech url", speechUrl);
    
    // console.log("baidu speech body", body);

    console.log('🌐 发送百度语音API请求...');
    console.log('📊 请求参数:', {
      format: "pcm",
      rate: 16000,
      dev_pid: 80001,
      channel: 1,
      len: audioData.originalLength,
      cuid: getBaiduSpeechConfig().appId,
    });

    const response = await fetch(speechUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    console.log('📡 API响应状态:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }

    const data: BaiduSpeechResponse = await response.json();

    console.log("📋 百度语音API响应:", data);

    if (data.err_no !== 0) {
      console.error('❌ 百度语音API错误:', {
        errorCode: data.err_no,
        errorMessage: data.err_msg,
        sn: data.sn,
      });
      
      // 根据错误码提供具体建议
      let suggestion = '';
      switch (data.err_no) {
        case 3300:
          suggestion = '请检查输入参数是否正确';
          break;
        case 3301:
          suggestion = '音频质量过差，请重新录音';
          break;
        case 3302:
          suggestion = '鉴权失败，请检查API Key和Secret Key';
          break;
        case 3303:
          suggestion = '服务器后端问题，请稍后重试';
          break;
        case 3304:
          suggestion = '请求频率超限，请稍后重试';
          break;
        case 3305:
          suggestion = '日请求量超限，请明天再试';
          break;
        case 3307:
          suggestion = '识别出错，请重新录音';
          break;
        case 3308:
          suggestion = '音频过长，请缩短录音时间';
          break;
        case 3309:
          suggestion = '音频数据问题，请重新录音';
          break;
        case 3310:
          suggestion = '音频文件过大，请缩短录音时间';
          break;
        case 3311:
          suggestion = '采样率不正确，请检查音频格式';
          break;
        case 3312:
          suggestion = '音频格式不支持，请使用PCM格式';
          break;
        default:
          suggestion = '未知错误，请检查网络连接和API配置';
      }
      
      throw new Error(`百度语音识别失败: ${data.err_msg} (错误码: ${data.err_no}) - ${suggestion}`);
    }

    if (!data.result || data.result.length === 0) {
      console.error('❌ 语音识别结果为空');
      throw new Error('语音识别结果为空，请重新录音');
    }

    const recognizedText = data.result[0];
    console.log('✅ 百度语音识别成功:', recognizedText);
    
    return recognizedText;
  } catch (error) {
    console.error('❌ 百度语音识别失败:', error);
    throw new Error(`语音识别失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 检查百度语音API是否可用
 */
export async function checkBaiduSpeechAvailability(): Promise<boolean> {
  try {
    if (!isBaiduSpeechConfigured()) {
      return false;
    }

    // 尝试获取token来验证配置是否正确
    await getBaiduToken();
    return true;
  } catch (error) {
    console.error('❌ 百度语音API不可用:', error);
    return false;
  }
}

/**
 * 获取百度语音API配置状态
 */
export function getBaiduSpeechStatus() {
  const config = getBaiduSpeechConfig();
  const isConfigured = isBaiduSpeechConfigured();
  
  return {
    isConfigured,
    hasAppId: !!config.appId,
    hasApiKey: !!config.apiKey,
    hasSecretKey: !!config.secretKey,
    config: isConfigured ? {
      appId: config.appId.substring(0, 8) + '...',
      apiKey: config.apiKey.substring(0, 8) + '...',
      secretKey: config.secretKey.substring(0, 8) + '...',
    } : null,
  };
} 