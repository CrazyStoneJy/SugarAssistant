import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import MarkdownText from './MarkdownText';
import { ThemedText } from './ThemedText';

interface ChatMessageProps {
  text: string;
  imageUri?: string; // 添加图片URI支持
  isUser: boolean;
  timestamp: Date;
  isThinking?: boolean;
  onSpeak?: (text: string) => void;
}

export default function ChatMessage({ text, imageUri, isUser, timestamp, isThinking = false, onSpeak }: ChatMessageProps) {
  const [showImageViewer, setShowImageViewer] = useState(false);

  const handleSpeak = () => {
    if (onSpeak) {
      onSpeak(text);
    } else {
      Speech.speak(text, {
        language: 'zh-CN',
        pitch: 1,
        rate: 0.8,
      });
    }
  };

  // 处理图片点击
  const handleImagePress = () => {
    if (imageUri) {
      setShowImageViewer(true);
    }
  };

  // 格式化时间显示
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    // 获取年月日（使用本地时间）
    const messageYear = messageDate.getFullYear();
    const messageMonth = messageDate.getMonth() + 1;
    const messageDay = messageDate.getDate();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth() + 1;
    const nowDay = now.getDate(); // 修正：使用getDate()而不是getDay()
    
    // 格式化时分秒
    const hours = messageDate.getHours().toString().padStart(2, '0');
    const minutes = messageDate.getMinutes().toString().padStart(2, '0');
    const seconds = messageDate.getSeconds().toString().padStart(2, '0');
    
    // 调试信息
    console.log('时间判断调试:', {
      messageDate: `${messageYear}-${messageMonth}-${messageDay}`,
      nowDate: `${nowYear}-${nowMonth}-${nowDay}`,
      isToday: messageYear === nowYear && messageMonth === nowMonth && messageDay === nowDay
    });
    
    // 判断是否是今天
    if (messageYear === nowYear && messageMonth === nowMonth && messageDay === nowDay) {
      return `今天 ${hours}时${minutes}分${seconds}秒`;
    }
    
    // 判断是否是昨天
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayYear = yesterday.getFullYear();
    const yesterdayMonth = yesterday.getMonth() + 1;
    const yesterdayDay = yesterday.getDate();
    
    console.log('昨天判断调试:', {
      messageDate: `${messageYear}-${messageMonth}-${messageDay}`,
      yesterdayDate: `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`,
      isYesterday: messageYear === yesterdayYear && messageMonth === yesterdayMonth && messageDay === yesterdayDay
    });
    
    if (messageYear === yesterdayYear && messageMonth === yesterdayMonth && messageDay === yesterdayDay) {
      return `昨天 ${hours}时${minutes}分${seconds}秒`;
    }
    
    // 其他情况显示完整日期
    const month = messageMonth.toString().padStart(2, '0');
    const day = messageDay.toString().padStart(2, '0');
    return `${messageYear}年${month}月${day}日 ${hours}时${minutes}分${seconds}秒`;
  };

  return (
    <>
      <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
        {/* 用户消息布局 */}
        {isUser ? (
          <View style={styles.userMessageLayout}>
            <View style={styles.userBubble}>
              {/* 显示图片 */}
              {imageUri && (
                <TouchableOpacity style={styles.imageContainer} onPress={handleImagePress}>
                  <Image source={{ uri: imageUri }} style={styles.messageImage} />
                </TouchableOpacity>
              )}
              {/* 显示文本 */}
              {text && <MarkdownText text={text} isUser={isUser} />}
            </View>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={20} color="#FFFFFF" />
            </View>
          </View>
        ) : (
          /* AI消息布局 */
          <View style={styles.aiMessageLayout}>
            <View style={styles.aiAvatar}>
              <Ionicons name="logo-github" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.aiBubble}>
              {isThinking ? (
                <View style={styles.thinkingContainer}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <ThemedText style={styles.thinkingText}>
                    AI正在思考中...
                  </ThemedText>
                </View>
              ) : (
                <>
                  {/* 显示图片 */}
                  {imageUri && (
                    <TouchableOpacity style={styles.imageContainer} onPress={handleImagePress}>
                      <Image source={{ uri: imageUri }} style={styles.messageImage} />
                    </TouchableOpacity>
                  )}
                  {/* 显示文本 */}
                  {text && <MarkdownText text={text} isUser={isUser} />}
                </>
              )}
              {/* <TouchableOpacity style={styles.speakButton} onPress={handleSpeak}>
                <Ionicons name="volume-high" size={16} color="#007AFF" />
              </TouchableOpacity> */}
            </View>
          </View>
        )}
        
        <ThemedText style={styles.timestamp}>
          {formatTimestamp(timestamp)}
        </ThemedText>
      </View>

      {/* 图片查看器Modal */}
      {imageUri && (
        <Modal visible={showImageViewer} transparent={true}>
          <ImageViewer
            imageUrls={[{ url: imageUri }]}
            index={0}
            onSwipeDown={() => setShowImageViewer(false)}
            onClick={() => setShowImageViewer(false)}
            enableSwipeDown={true}
            backgroundColor="rgba(0,0,0,0.9)"
            renderIndicator={() => <View />}
            saveToLocalByLongPress={false}
          />
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  
  // 用户消息布局
  userMessageLayout: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  userBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // AI消息布局
  aiMessageLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  
  // AI思考状态样式
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  thinkingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  
  // 声音按钮 - 移到右下角
  speakButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginHorizontal: 12,
  },
  messageImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageContainer: {
    width: 200,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    alignSelf: 'center',
    backgroundColor: 'transparent', // 透明背景，适应对话框颜色
    // 添加固定尺寸，防止图片加载时布局跳动
    minWidth: 200,
    minHeight: 150,
  },
});