import ChatMessage from '@/components/ChatMessage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import WeChatInput from '@/components/WeChatInput';
import { generateAIResponse } from '@/utils/aiResponse';
import { getStatusBarHeight } from '@/utils/androidSafeArea';
import { addMessageToCurrentSession, createNewChatSession, getCurrentChatSession } from '@/utils/chatStorage';

import { autoInitAPI, isAPIInitialized } from '@/utils/deepseekApi';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAPIAvailable, setIsAPIAvailable] = useState(true);
  const [apiSource, setApiSource] = useState<'env' | 'manual' | 'none'>('none');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 使用 useFocusEffect 监听页面焦点变化
  useFocusEffect(
    useCallback(() => {
      // 每次页面获得焦点时重新加载聊天历史
      loadChatHistory();
    }, [])
  );

  useEffect(() => {
    initializeChat();
  }, []);

  // 监听键盘事件
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      console.log('键盘弹出，高度:', e.endCoordinates.height);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      console.log('键盘收起');
    });

    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  const initializeChat = async () => {
    try {
      setIsLoadingHistory(true);
      
      // 检查API状态
      await checkAPIStatus();
      
      // 加载历史消息
      await loadChatHistory();
    } catch (error) {
      console.error('初始化聊天失败:', error);
      // 如果加载失败，创建新的会话
      const newSession = createNewChatSession();
      setMessages(newSession.messages);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const currentSession = await getCurrentChatSession();
      if (currentSession && currentSession.messages.length > 0) {
        setMessages(currentSession.messages);
      } else {
        // 如果没有历史消息，创建新的会话
        const newSession = createNewChatSession();
        setMessages(newSession.messages);
      }
    } catch (error) {
      console.error('加载聊天历史失败:', error);
      // 如果加载失败，创建新的会话
      const newSession = createNewChatSession();
      setMessages(newSession.messages);
    }
  };

  const checkAPIStatus = async () => {
    try {
      // 首先尝试从环境变量自动初始化
      if (autoInitAPI()) {
        setIsAPIAvailable(true);
        setApiSource('env');
        console.log('✅ 从环境变量成功初始化DeepSeek API');
        return;
      }

      // 如果环境变量不可用，检查手动配置
      if (isAPIInitialized()) {
        setIsAPIAvailable(true);
        setApiSource('manual');
        console.log('✅ 使用手动配置的DeepSeek API');
        return;
      }

      // 如果都没有配置，使用模拟AI
      setIsAPIAvailable(false);
      setApiSource('none');
      console.log('⚠️ 未配置API，使用模拟AI');
    } catch (error) {
      console.error('检查API状态失败:', error);
      setIsAPIAvailable(false);
      setApiSource('none');
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // 添加用户消息后滚动到底部
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // 保存用户消息到存储
      await addMessageToCurrentSession(userMessage);

      // 生成AI回复
      let aiResponseText: string;
      
      // FIXME: 流式回复
      // isAPIAvailable && isAPIInitialized()
      if (false) {
      } else {
        // 使用模拟AI回复
        console.log('🎭 使用模拟AI生成回复...');
        const mockResponse = await generateAIResponse(text.trim());
        aiResponseText = mockResponse.text;
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // 保存AI回复到存储
      await addMessageToCurrentSession(aiMessage);
      
      // 添加新消息后滚动到底部
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 如果发送失败，添加错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '抱歉，发送消息时出现错误，请重试。',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      await addMessageToCurrentSession(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceResult = (text: string) => {
    sendMessage(text);
  };



  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatMessage
      text={item.text}
      isUser={item.isUser}
      timestamp={item.timestamp}
    />
  );

  const getTitleName = () => {
    return "控糖小助手"
  };

  const getLoadingText = () => {
    if (apiSource === 'env' || apiSource === 'manual') {
      return 'AI正在思考中...';
    } else {
      return '模拟AI回复中...';
    }
  };

  if (isLoadingHistory) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="transparent" 
          translucent={Platform.OS === 'android'}
        />
        <ThemedView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <ThemedText style={styles.loadingText}>加载聊天记录...</ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={Platform.OS === 'android'}
      />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ThemedView style={styles.container}>
          {/* 顶部状态栏 */}
          <View style={styles.statusBar}>
            <ThemedText style={styles.statusText}>
              {getTitleName()}
            </ThemedText>
            <View style={styles.statusButtons}>
              <TouchableOpacity 
                onPress={scrollToTop} 
                style={styles.scrollButton}
              >
                <Ionicons name="arrow-up-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/sessions')} style={styles.sessionsButton}>
                <Ionicons name="list-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 聊天内容区域 */}
          <View style={styles.chatContainer}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContentContainer}
              onContentSizeChange={() => {
                // 只在有新消息添加时才自动滚动到底部
                // 这里不自动滚动，让用户手动控制
              }}
              onLayout={() => {
                // 只在有新消息添加时才自动滚动到底部
                // 这里不自动滚动，让用户手动控制
              }}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              bounces={true}
              alwaysBounceVertical={false}
              removeClippedSubviews={false}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="on-drag"
              inverted={false}
              nestedScrollEnabled={false}
            />
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <ThemedText style={styles.loadingText}>
                  {getLoadingText()}
                </ThemedText>
              </View>
            )}
          </View>

          {/* 输入框区域 - 固定在底部 */}
          <View style={styles.inputContainer}>
            <WeChatInput
              value={inputText}
              onChangeText={setInputText}
              onSend={sendMessage}
              onVoiceResult={handleVoiceResult}
              disabled={isLoading}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eeeeee',
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    // backgroundColor: 'red',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7F7F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingTop: Platform.OS === 'android' ? getStatusBarHeight() : 0,
  },
  statusText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '700',
  },
  statusButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollButton: {
    padding: 8,
  },

  sessionsButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1000,
    marginBottom: Platform.OS === 'android' ? -5 : 0, // 减少Android的负边距，从-10改为-5
  },
  keyboardAvoidingContent: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messagesContentContainer: {
    flexGrow: 1,
    paddingTop: 10,
    paddingBottom: 8, // 添加底部间距，确保最后一条消息和输入框之间有适当距离
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#999',
  },
}); 