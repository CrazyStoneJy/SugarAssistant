import { checkAudioQuality, getAudioQualitySuggestions, isSuitableForSpeechRecognition, preprocessAudio } from '@/utils/audioQualityChecker';
import { diagnoseBaiduSpeechIssues } from '@/utils/baiduSpeechApi';
import { checkSpeechRecognitionPermission, convertSpeechToText, diagnoseSpeechRecognition, getSpeechRecognitionConfigInfo, getSpeechRecognitionStatus } from '@/utils/speechToText';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Animated, Platform, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';

interface VoiceInputProps {
  onVoiceResult: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onVoiceResult, disabled = false }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [speechStatus, setSpeechStatus] = useState<{
    baiduAvailable: boolean;
    fallbackAvailable: boolean;
    primaryService: string;
  } | null>(null);
  const [configInfo, setConfigInfo] = useState<any>(null);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [lastRecordingUri, setLastRecordingUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [baiduDiagnosis, setBaiduDiagnosis] = useState<any>(null);
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    // 检查录音权限
    (async () => {
      try {
        const permission = await checkSpeechRecognitionPermission();
        setHasPermission(permission);
        
        if (!permission) {
          console.log('⚠️ 录音权限未授予');
          setError('需要录音权限，请在设置中允许使用麦克风');
        } else {
          console.log('✅ 录音权限已授予');
          setError(null);
        }
      } catch (error) {
        console.error('❌ 权限检查失败:', error);
        setHasPermission(false);
        setError('权限检查失败');
      }
    })();

    // 检查语音识别服务状态
    (async () => {
      try {
        const status = await getSpeechRecognitionStatus();
        setSpeechStatus(status);
        console.log('🎤 语音识别服务状态:', status);
      } catch (error) {
        console.error('❌ 获取语音识别服务状态失败:', error);
      }
    })();

    // 获取配置信息
    try {
      const config = getSpeechRecognitionConfigInfo();
      setConfigInfo(config);
      console.log('🔧 语音识别配置信息:', config);
    } catch (error) {
      console.error('❌ 获取配置信息失败:', error);
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  // 播放录音
  const playRecording = async () => {
    if (!lastRecordingUri) {
      Alert.alert('没有录音', '请先录制一段音频');
      return;
    }

    try {
      setIsPlaying(true);
      
      // 停止当前播放
      if (sound) {
        await sound.unloadAsync();
      }

      // 创建新的音频播放器
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: lastRecordingUri },
        { shouldPlay: true }
      );

      setSound(newSound);

      // 监听播放完成
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      console.log('🔊 开始播放录音:', lastRecordingUri);
    } catch (error) {
      console.error('❌ 播放录音失败:', error);
      setIsPlaying(false);
      Alert.alert('播放失败', '无法播放录音文件');
    }
  };

  // 停止播放
  const stopPlaying = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        console.log('⏹️ 停止播放录音');
      } catch (error) {
        console.error('❌ 停止播放失败:', error);
      }
    }
  };

  // 诊断百度语音API
  const diagnoseBaiduAPI = async () => {
    try {
      console.log('🔍 开始诊断百度语音API...');
      const diagnosis = await diagnoseBaiduSpeechIssues();
      setBaiduDiagnosis(diagnosis);
      
      // 显示诊断结果
      const message = diagnosis.recommendations.join('\n');
      Alert.alert('百度语音API诊断结果', message);
      
      console.log('📋 百度语音API诊断结果:', diagnosis);
    } catch (error) {
      console.error('❌ 诊断失败:', error);
      Alert.alert('诊断失败', error instanceof Error ? error.message : '未知错误');
    }
  };

  const startRecording = async () => {
    if (disabled) return;

    // 检查权限
    if (!hasPermission) {
      Alert.alert(
        '需要录音权限',
        '请在设置中允许应用使用麦克风，然后重试',
        [
          { text: '取消', style: 'cancel' },
          { text: '去设置', onPress: () => {
            // 在iOS上可以打开设置
            if (Platform.OS === 'ios') {
              // 这里可以添加打开设置的逻辑
            }
          }}
        ]
      );
      return;
    }

    try {
      setError(null);
      setDiagnosis(null);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 使用优化的录音设置，确保高质量音频
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: 1, // PCM_16BIT
          audioEncoder: 1, // PCM_16BIT
          sampleRate: 16000, // 匹配百度API要求
          numberOfChannels: 1, // 单声道
          bitRate: 256000, // 高质量比特率
        },
        ios: {
          extension: '.wav',
          outputFormat: 1, // LINEARPCM
          audioQuality: 2, // MAX - 最高质量
          sampleRate: 16000, // 匹配百度API要求
          numberOfChannels: 1, // 单声道
          bitRate: 256000, // 高质量比特率
          linearPCMBitDepth: 16, // 16位深度
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
        },
      });
      
      setRecording(recording);
      setIsRecording(true);
      console.log('🎤 开始录音...');
    } catch (err) {
      console.error('❌ 录音失败:', err);
      setError('录音失败，请重试');
      Alert.alert('录音失败', '无法开始录音，请检查麦克风权限');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setIsProcessing(true);
    
    try {
      console.log('🛑 停止录音...');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        console.log('📁 录音文件URI:', uri);
        setLastRecordingUri(uri); // 保存录音文件URI
        
        try {
          // 预处理音频文件
          const processedUri = await preprocessAudio(uri);
          console.log('✅ 音频预处理完成');
          
          // 检查音频质量
          const audioQuality = await checkAudioQuality(processedUri);
          console.log('🎵 音频质量检查:', audioQuality);
          
          if (!isSuitableForSpeechRecognition(audioQuality)) {
            const suggestions = getAudioQualitySuggestions(audioQuality);
            console.log('⚠️ 音频质量建议:', suggestions);
            setError(suggestions[0] || '音频质量不适合识别，请重新录音');
            return;
          }
          
          // 进行诊断
          const diagnosisResult = await diagnoseSpeechRecognition(processedUri);
          setDiagnosis(diagnosisResult);
          console.log('🔍 诊断结果:', diagnosisResult);
          
          // 调用语音转文本功能
          console.log('🔄 开始语音识别...');
          const recognizedText = await convertSpeechToText(processedUri);
          
          if (recognizedText) {
            console.log('✅ 语音识别成功:', recognizedText);
            onVoiceResult(recognizedText);
            setError(null);
          } else {
            console.log('❌ 语音识别结果为空');
            setError('无法识别语音内容，请重新录音');
          }
        } catch (error) {
          console.error('❌ 语音识别失败:', error);
          setError(error instanceof Error ? error.message : '语音识别失败，请重试');
        }
      } else {
        console.log('❌ 录音文件URI为空');
        setError('录音文件生成失败');
      }
    } catch (error) {
      console.error('❌ 停止录音失败:', error);
      setError('录音处理失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePressIn = () => {
    if (!disabled && !isProcessing && hasPermission) {
      startRecording();
    }
  };

  const handlePressOut = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const getButtonText = () => {
    if (!hasPermission) return '需要权限';
    if (isProcessing) return '识别中...';
    if (isRecording) return '松开结束';
    return '按住说话';
  };

  const getButtonColor = () => {
    if (!hasPermission) return '#999';
    if (isProcessing) return '#FF9500';
    if (isRecording) return '#FF3B30';
    return '#007AFF';
  };

  const getIconName = () => {
    if (!hasPermission) return 'mic-off';
    if (isProcessing) return 'hourglass';
    if (isRecording) return 'stop';
    return 'mic';
  };

  const getStatusText = () => {
    if (!hasPermission) return '麦克风权限被拒绝';
    if (!speechStatus) return '检查服务状态...';
    
    if (speechStatus.baiduAvailable) {
      return '使用百度语音API';
    } else if (speechStatus.fallbackAvailable) {
      return '使用模拟识别';
    } else {
      return '语音识别不可用';
    }
  };

  const getConfigStatusText = () => {
    if (!configInfo) return '';
    
    if (configInfo.isConfigured) {
      return '百度API已配置';
    } else {
      return '百度API未配置，使用模拟识别';
    }
  };

  const getDiagnosisText = () => {
    if (!diagnosis) return '';
    
    const issues = [];
    if (diagnosis.audioRecording.issues.length > 0) {
      issues.push(`录音: ${diagnosis.audioRecording.issues[0]}`);
    }
    if (diagnosis.apiStatus.issues.length > 0) {
      issues.push(`API: ${diagnosis.apiStatus.issues[0]}`);
    }
    
    return issues.length > 0 ? issues.join(' | ') : '诊断正常';
  };

  return (
    <Pressable
      style={[styles.container, disabled && styles.disabled]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isProcessing || !hasPermission}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: getButtonColor() },
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Ionicons
          name={getIconName() as any}
          size={32}
          color="#FFFFFF"
        />
      </Animated.View>
      <ThemedText style={styles.buttonText}>{getButtonText()}</ThemedText>
      {speechStatus && (
        <ThemedText style={styles.statusText}>{getStatusText()}</ThemedText>
      )}
      {configInfo && (
        <ThemedText style={styles.configText}>{getConfigStatusText()}</ThemedText>
      )}
      {diagnosis && (
        <ThemedText style={styles.diagnosisText}>{getDiagnosisText()}</ThemedText>
      )}
      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}
      
      {/* 播放测试按钮 */}
      {lastRecordingUri && (
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={isPlaying ? stopPlaying : playRecording}
          disabled={isProcessing}
        >
          <Ionicons
            name={isPlaying ? "stop" : "play"}
            size={20}
            color="#FFFFFF"
          />
          <ThemedText style={styles.playButtonText}>
            {isPlaying ? '停止播放' : '播放录音'}
          </ThemedText>
        </TouchableOpacity>
      )}
      
      {/* 诊断按钮 */}
      <TouchableOpacity
        style={styles.diagnoseButton}
        onPress={diagnoseBaiduAPI}
        disabled={isProcessing}
      >
        <Ionicons
          name="bug"
          size={16}
          color="#FFFFFF"
        />
        <ThemedText style={styles.diagnoseButtonText}>
          诊断百度API
        </ThemedText>
      </TouchableOpacity>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12, // 减少垂直间距，从20改为12
    paddingBottom: Platform.OS === 'android' ? 0 : 12, // 减少Android底部间距，从20改为12
    zIndex: 1,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8, // 减少顶部间距，从12改为8
  },
  statusText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 6, // 减少顶部间距，从8改为6
  },
  configText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
  diagnosisText: {
    fontSize: 12,
    color: '#FF9500',
    textAlign: 'center',
    marginTop: 2,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    width: '80%', // 调整宽度
    alignSelf: 'center',
  },
  playButtonActive: {
    backgroundColor: '#FF3B30',
  },
  playButtonText: {
    color: '#FFFFFF',
    marginLeft: 5,
    fontSize: 14,
  },
  diagnoseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    width: '80%', // 调整宽度
    alignSelf: 'center',
  },
  diagnoseButtonText: {
    color: '#FFFFFF',
    marginLeft: 5,
    fontSize: 14,
  },
}); 