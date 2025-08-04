import { getInputBottomPadding } from '@/utils/androidSafeArea';
import { checkSpeechRecognitionPermission, convertSpeechToText } from '@/utils/speechToText';
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
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    // 请求录音权限
    (async () => {
      const hasPermission = await checkSpeechRecognitionPermission();
      if (!hasPermission) {
        Alert.alert('需要录音权限', '请在设置中允许应用使用麦克风');
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

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
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
        // 调用语音转文本功能
        try {
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
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 8,
  },
}); 