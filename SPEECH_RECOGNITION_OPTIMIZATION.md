# 语音识别质量优化指南

## 🎯 问题分析

百度语音API识别率低可能由以下原因造成：

### 1. 音频质量问题
- **采样率不匹配**：百度API要求16kHz，但录音可能使用其他采样率
- **音频格式问题**：需要PCM格式，但录音可能是其他格式
- **音频质量过低**：比特率或编码方式不适合语音识别

### 2. API参数配置问题
- **dev_pid参数**：使用了不合适的识别模型
- **音频长度**：len字段计算错误（已修复）
- **设备标识**：cuid参数设置不当

### 3. 录音环境问题
- **背景噪音**：环境噪音影响识别准确率
- **录音距离**：麦克风距离过远或过近
- **录音时长**：录音时间太短或太长

## ✅ 已实施的优化

### 1. API参数优化
```typescript
// 修改前
dev_pid: 80001, // 不合适的模型

// 修改后  
dev_pid: 1537, // 普通话(支持简单的英文识别) - 更准确的识别模型
```

### 2. 录音设置优化
```typescript
// 使用更适合语音识别的录音设置
const { recording } = await Audio.Recording.createAsync({
  android: {
    extension: '.wav',
    outputFormat: 1, // PCM_16BIT
    audioEncoder: 1, // PCM_16BIT
    sampleRate: 16000, // 匹配百度API要求
    numberOfChannels: 1, // 单声道
    bitRate: 256000,
  },
  ios: {
    extension: '.wav',
    outputFormat: 1, // LINEARPCM
    audioQuality: 1, // HIGH
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/wav',
  },
});
```

### 3. 设备标识优化
```typescript
// 修改前
cuid: 'default-device-id',

// 修改后
cuid: getBaiduSpeechConfig().appId, // 使用App ID作为设备标识
```

## 🔧 进一步优化建议

### 1. 音频预处理
```typescript
// 可以添加音频预处理步骤
async function preprocessAudio(audioUri: string): Promise<string> {
  // 1. 音量标准化
  // 2. 降噪处理
  // 3. 静音检测和裁剪
  // 4. 音频格式转换
  return processedAudioUri;
}
```

### 2. 多模型尝试
```typescript
// 可以尝试不同的识别模型
const models = [
  1537, // 普通话(支持简单的英文识别)
  80001, // 普通话识别
  1737, // 英语识别
  1637, // 粤语识别
];

// 如果第一个模型识别失败，尝试其他模型
```

### 3. 置信度过滤
```typescript
// 添加置信度检查
if (data.result && data.result.length > 0) {
  const confidence = data.result[0].confidence || 0;
  if (confidence < 0.6) {
    // 置信度过低，使用回退方案
    return await convertSpeechToTextMock(audioUri);
  }
}
```

## 📊 识别率提升策略

### 1. 录音环境优化
- **安静环境**：选择噪音较小的环境录音
- **适当距离**：保持麦克风距离嘴部10-20厘米
- **清晰发音**：说话时发音清晰，语速适中

### 2. 录音时长控制
- **最短时长**：建议录音至少1秒
- **最长时长**：建议不超过60秒
- **自动检测**：可以添加静音检测自动停止录音

### 3. 错误处理优化
```typescript
// 添加更详细的错误处理
if (data.err_no !== 0) {
  switch (data.err_no) {
    case 3301: // 音频质量过差
      console.log('音频质量过差，建议重新录音');
      break;
    case 3302: // 鉴权失败
      console.log('API密钥错误');
      break;
    case 3303: // 音频格式错误
      console.log('音频格式不支持');
      break;
    default:
      console.log(`识别失败: ${data.err_msg}`);
  }
}
```

## 🧪 测试方法

### 1. 音频质量测试
```bash
# 检查录音文件信息
ffprobe recording.wav

# 检查音频参数
- 采样率: 16000 Hz
- 声道数: 1 (单声道)
- 格式: PCM 16-bit
- 时长: 1-60秒
```

### 2. API响应分析
```typescript
// 添加详细的API响应日志
console.log('API响应详情:', {
  err_no: data.err_no,
  err_msg: data.err_msg,
  result: data.result,
  confidence: data.confidence,
});
```

### 3. 对比测试
- 使用相同的音频文件测试不同的API参数
- 对比不同录音设置的效果
- 测试不同环境下的识别率

## 📈 监控指标

### 1. 识别成功率
- 成功识别次数 / 总录音次数
- 目标：> 80%

### 2. 识别准确率
- 正确识别的字符数 / 总字符数
- 目标：> 90%

### 3. 响应时间
- API响应时间
- 目标：< 3秒

## 🎯 预期效果

经过优化后，预期可以达到：
- **识别成功率**：85%以上
- **识别准确率**：90%以上
- **响应时间**：2-3秒
- **用户体验**：显著改善

## 📝 使用建议

1. **首次使用**：在安静环境下测试
2. **录音技巧**：清晰发音，适当语速
3. **环境选择**：避免噪音干扰
4. **设备检查**：确保麦克风正常工作
5. **网络检查**：确保网络连接稳定

通过这些优化，百度语音API的识别率应该会有显著提升！ 