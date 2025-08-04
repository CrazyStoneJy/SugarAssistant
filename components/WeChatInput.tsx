import { getInputBottomPadding, getInputContainerBottomPadding } from '@/utils/androidSafeArea';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from './ThemedText';
import VoiceInput from './VoiceInput';

interface WeChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (text: string) => void;
  onVoiceResult: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function WeChatInput({
  value,
  onChangeText,
  onSend,
  onVoiceResult,
  disabled = false,
  placeholder = '输入消息...',
}: WeChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showVoiceButton, setShowVoiceButton] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      onChangeText('');
      Keyboard.dismiss();
    }
  };

  const toggleVoiceButton = () => {
    const newShowVoice = !showVoiceButton;
    setShowVoiceButton(newShowVoice);
    
    Animated.timing(slideAnim, {
      toValue: newShowVoice ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (newShowVoice) {
      inputRef.current?.blur();
    } else {
      inputRef.current?.focus();
    }
  };

  const handleVoiceResult = (text: string) => {
    setIsProcessingVoice(true);
    onVoiceResult(text);
    setShowVoiceButton(false);
    setIsProcessingVoice(false);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* 输入区域 */}
      <View style={styles.inputArea}>
        {/* 文本输入框 */}
        <View style={styles.textInputContainer}>
          <TextInput
            ref={inputRef}
            style={[styles.textInput, isFocused && styles.textInputFocused]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            editable={!showVoiceButton}
          />
        </View>

        {/* 语音/键盘切换按钮 */}
        <TouchableOpacity
          style={[styles.toggleButton, isProcessingVoice && styles.processingButton]}
          onPress={toggleVoiceButton}
          disabled={disabled || isProcessingVoice}
        >
          <Ionicons
            name={showVoiceButton ? 'keypad-outline' : 'mic'}
            size={24}
            color={isProcessingVoice ? '#FF9500' : '#007AFF'}
          />
        </TouchableOpacity>

        {/* 发送按钮 */}
        {value.trim() && !showVoiceButton && (
          <TouchableOpacity
            style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={disabled}
          >
            <ThemedText style={styles.sendButtonText}>发送</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* 语音输入区域 */}
      {showVoiceButton && (<Animated.View
        style={[
          styles.voiceContainer,
          {
            opacity: slideAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <VoiceInput
          onVoiceResult={handleVoiceResult}
          disabled={disabled}
        />
        {isProcessingVoice && (
          <View style={styles.processingContainer}>
            <ThemedText style={styles.processingText}>正在识别语音...</ThemedText>
          </View>
        )}
      </Animated.View>)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F7F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: Platform.OS === 'ios' ? 20 : getInputContainerBottomPadding(),
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minHeight: 36,
    maxHeight: 100,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  textInputFocused: {
    borderColor: '#007AFF',
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  processingButton: {
    backgroundColor: '#FFF3E0',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  voiceContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'android' ? getInputBottomPadding() : 20,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  processingContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
  },
  processingText: {
    fontSize: 14,
    color: '#FF9500',
    textAlign: 'center',
  },
}); 