import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Keyboard,
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
  onImageUpload?: (imageUri: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function WeChatInput({
  value,
  onChangeText,
  onSend,
  onVoiceResult,
  onImageUpload,
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

  // 选择图片
  const pickImage = async () => {
    try {
      // 请求相册权限
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('需要权限', '请允许访问相册以选择图片');
        return;
      }

      // 打开图片选择器 - 移除裁剪功能
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // 移除裁剪功能
        aspect: undefined, // 移除宽高比限制
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        // 直接调用图片上传回调，不显示预览
        if (onImageUpload) {
          onImageUpload(imageUri);
        }
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('选择图片失败', '请重试');
    }
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
            maxLength={1000}
            numberOfLines={1}
            onContentSizeChange={(event) => {
              // 动态调整输入框高度
              const { height } = event.nativeEvent.contentSize;
              console.log('输入框内容高度:', height);
            }}
            onFocus={() => {
              setIsFocused(true);
              console.log('输入框获得焦点');
            }}
            onBlur={() => setIsFocused(false)}
            editable={!showVoiceButton}
            keyboardType="default"
            returnKeyType="default"
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            textAlignVertical="top"
          />
        </View>

        {/* 图片上传按钮 */}
        <TouchableOpacity
          style={[styles.imageButton, disabled && styles.imageButtonDisabled]}
          onPress={pickImage}
          disabled={disabled || showVoiceButton}
        >
          <Ionicons
            name="image-outline"
            size={24}
            color={disabled ? '#CCCCCC' : '#007AFF'}
          />
        </TouchableOpacity>

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

      {/* 图片预览区域 */}
      {/* 移除选中的图片 */}
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
    backgroundColor: 'white',
    // borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 0, // 由父组件控制底部间距
    // zIndex: 1000,
    // elevation: 10,
    width: '100%',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    maxHeight: 150,
    marginRight: 8,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
    // elevation: 2,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
    minHeight: 36,
    borderRadius: 18,
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
    paddingVertical: 12, // 减少垂直间距，从20改为12
    paddingHorizontal: 16,
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
  imageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  imageButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  diagnoseButtonText: {
    color: '#FFFFFF',
    marginLeft: 5,
    fontSize: 14,
  },
}); 