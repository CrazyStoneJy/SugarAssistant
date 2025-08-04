import { checkAudioQuality, getAudioQualitySuggestions, isSuitableForSpeechRecognition } from '@/utils/audioQualityChecker';
import { checkSpeechRecognitionPermission, convertSpeechToText, getSpeechRecognitionStatus } from '@/utils/speechToText';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Animated, Platform, Pressable, StyleSheet } from 'react-native';
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
  const [speechStatus, setSpeechStatus] = useState<{
    baiduAvailable: boolean;
    fallbackAvailable: boolean;
    primaryService: string;
  } | null>(null);
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    // 请求录音权限
    (async () => {
      const hasPermission = await checkSpeechRecognitionPermission();
      if (!hasPermission) {
        Alert.alert('需要录音权限', '请在设置中允许应用使用麦克风');
      }
    })();

    // 检查语音识别服务状态
    (async () => {
      try {
        const status = await getSpeechRecognitionStatus();
        setSpeechStatus(status);
        console.log('🎤 语音识别服务状态:', status);
      } catch (error) {
        console.error('获取语音识别服务状态失败:', error);
      }
    })();
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

  const startRecording = async () => {
    if (disabled) return;

    try {
      setError(null);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 使用更适合语音识别的录音设置
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: 1, // PCM_16BIT
          audioEncoder: 1, // PCM_16BIT
          sampleRate: 16000,
          numberOfChannels: 1,
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
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('录音失败', err);
      setError('录音失败，请重试');
      Alert.alert('录音失败', '无法开始录音');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setIsProcessing(true);
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        // 检查音频质量
        try {
          const audioQuality = await checkAudioQuality(uri);
          console.log('🎵 音频质量检查:', audioQuality);
          
          if (!isSuitableForSpeechRecognition(audioQuality)) {
            const suggestions = getAudioQualitySuggestions(audioQuality);
            console.log('⚠️ 音频质量建议:', suggestions);
            setError(suggestions[0] || '音频质量不适合识别');
            return;
          }
          
          // 调用语音转文本功能
          const recognizedText = await convertSpeechToText(uri);
          if (recognizedText) {
            onVoiceResult(recognizedText);
          } else {
            setError('无法识别语音内容');
          }
        } catch (error) {
          console.error('语音识别失败:', error);
          setError('语音识别失败，请重试');
        }
      }
    } catch (error) {
      console.error('停止录音失败:', error);
      setError('录音处理失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePressIn = () => {
    if (!disabled && !isProcessing) {
      startRecording();
    }
  };

  const handlePressOut = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const getButtonText = () => {
    if (isProcessing) return '识别中...';
    if (isRecording) return '松开结束';
    return '按住说话';
  };

  const getButtonColor = () => {
    if (isProcessing) return '#FF9500';
    if (isRecording) return '#FF3B30';
    return '#007AFF';
  };

  const getIconName = () => {
    if (isProcessing) return 'hourglass';
    if (isRecording) return 'stop';
    return 'mic';
  };

  const getStatusText = () => {
    if (!speechStatus) return '';
    
    if (speechStatus.baiduAvailable) {
      return '使用百度语音API';
    } else if (speechStatus.fallbackAvailable) {
      return '使用模拟识别';
    } else {
      return '语音识别不可用';
    }
  };

  return (
    <Pressable
      style={[styles.container, disabled && styles.disabled]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isProcessing}
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
      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'android' ? 0 : 20,
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
    marginTop: 12,
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
    marginTop: 8,
  },
}); 