import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import MarkdownText from './MarkdownText';

interface ChatMessageProps {
  text: string;
  isUser: boolean;
  timestamp: Date;
  onSpeak?: (text: string) => void;
}

export default function ChatMessage({ text, isUser, timestamp, onSpeak }: ChatMessageProps) {
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

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {/* 用户消息布局 */}
      {isUser ? (
        <View style={styles.userMessageLayout}>
          <View style={styles.userBubble}>
            <MarkdownText text={text} isUser={isUser} />
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
            <MarkdownText text={text} isUser={isUser} />
            <TouchableOpacity style={styles.speakButton} onPress={handleSpeak}>
              <Ionicons name="volume-high" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <ThemedText style={styles.timestamp}>
        {timestamp.toLocaleTimeString()}
      </ThemedText>
    </View>
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
    backgroundColor: '#E5E5EA',
    position: 'relative',
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
}); 