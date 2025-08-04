import ChatMessage from '@/components/ChatMessage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import WeChatInput from '@/components/WeChatInput';
import { generateAIResponse, getTypingDelay } from '@/utils/aiResponse';
import { getKeyboardVerticalOffset, getSafeAreaBottomHeight, getStatusBarHeight } from '@/utils/androidSafeArea';
import { addMessageToCurrentSession, createNewChatSession, getCurrentChatSession } from '@/utils/chatStorage';
import { checkEnvironmentConfig } from '@/utils/configChecker';
import { autoInitAPI, DeepSeekMessage, isAPIInitialized, sendMessageToDeepSeek } from '@/utils/deepseekApi';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
      // 检查环境变量配置
      const config = checkEnvironmentConfig();
      
      // 首先尝试从环境变量自动初始化
      if (autoInitAPI()) {
        setIsAPIAvailable(true);
        setApiSource('env');
        console.log('✅ 从环境变量成功初始化DeepSeek API');
        return;
      }

      // 如果环境变量未配置，使用模拟AI
      setIsAPIAvailable(false);
      setApiSource('none');
      console.log('ℹ️ 未配置API，使用模拟AI');
    } catch (error) {
      console.error('检查API状态失败:', error);
      setIsAPIAvailable(false);
      setApiSource('none');
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // 更新本地状态
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // 保存用户消息到存储
    try {
      await addMessageToCurrentSession(userMessage);
    } catch (error) {
      console.error('保存用户消息失败:', error);
    }

    try {
      let aiResponse: string;

      if (isAPIAvailable && isAPIInitialized()) {
        // 使用DeepSeek API
        const conversationHistory: DeepSeekMessage[] = messages
          .filter(msg => !msg.isUser) // 只包含AI的回复
          .map(msg => ({
            role: 'assistant',
            content: msg.text,
          }));

        aiResponse = await sendMessageToDeepSeek(text.trim(), conversationHistory);
      } else {
        // 使用模拟AI回复
        const mockResponse = generateAIResponse(text.trim());
        const typingDelay = getTypingDelay(mockResponse.text.length);
        await new Promise(resolve => setTimeout(resolve, typingDelay));
        aiResponse = mockResponse.text;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      
      // 更新本地状态
      setMessages(prev => [...prev, aiMessage]);
      
      // 保存AI消息到存储
      try {
        await addMessageToCurrentSession(aiMessage);
      } catch (error) {
        console.error('保存AI消息失败:', error);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 如果API调用失败，使用模拟回复
      const mockResponse = generateAIResponse(text.trim());
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: mockResponse.text,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // 保存模拟AI消息到存储
      try {
        await addMessageToCurrentSession(aiMessage);
      } catch (error) {
        console.error('保存模拟AI消息失败:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceResult = (text: string) => {
    sendMessage(text);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatMessage
      text={item.text}
      isUser={item.isUser}
      timestamp={item.timestamp}
    />
  );

  const getStatusText = () => {
    if (apiSource === 'env') {
      return '🟢 DeepSeek API (环境变量)';
    } else {
      return '🔴 使用模拟AI';
    }
  };

  const getLoadingText = () => {
    if (apiSource === 'env') {
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
      <ThemedView style={styles.container}>
        {/* 顶部状态栏 */}
        <View style={styles.statusBar}>
          <ThemedText style={styles.statusText}>
            {getStatusText()}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/sessions')} style={styles.sessionsButton}>
            <Ionicons name="list-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={getKeyboardVerticalOffset()}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContentContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onLayout={() => flatListRef.current?.scrollToEnd()}
            showsVerticalScrollIndicator={false}
          />
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <ThemedText style={styles.loadingText}>
                {getLoadingText()}
              </ThemedText>
            </View>
          )}

          <WeChatInput
            value={inputText}
            onChangeText={setInputText}
            onSend={sendMessage}
            onVoiceResult={handleVoiceResult}
            disabled={isLoading}
          />
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontSize: 14,
    color: '#666',
  },
  sessionsButton: {
    padding: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    // backgroundColor: 'blue',
  },
  messagesContentContainer: {
    paddingBottom: Platform.OS === 'android' ? 0 : getSafeAreaBottomHeight(),
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