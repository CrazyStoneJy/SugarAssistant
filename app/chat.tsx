import ChatMessage from '@/components/ChatMessage';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import WeChatInput from '@/components/WeChatInput';
import { generateSimpleAIResponse } from '@/utils/aiResponse';
import { addMessageToCurrentSession, createNewChatSession, getCurrentChatSession } from '@/utils/chatStorage';
import { recognizeTextWithTencentOcr } from '@/utils/tencentOcrApi';

import { autoInitAPI, isAPIInitialized, sendMessageToDeepSeekStream } from '@/utils/deepseekApi';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

interface Message {
  id: string;
  text: string;
  imageUri?: string; // 添加图片URI支持
  isUser: boolean;
  timestamp: Date;
  ocrData?: {
    recognizedText: string;
    timestamp: Date;
  };
}

// 获取屏幕宽度
const { width: screenWidth } = Dimensions.get('window');

// 全局计数器，确保ID唯一性
let messageIdCounter = 0;

// 生成唯一消息ID的函数
const generateUniqueMessageId = (prefix: string = 'msg') => {
  messageIdCounter++;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const id = `${prefix}_${timestamp}_${messageIdCounter}_${random}`;
  console.log(`🔑 生成消息ID: ${id}`);
  return id;
};

// 检查并修复重复的消息ID
const ensureUniqueMessageIds = (messages: Message[]): Message[] => {
  const seenIds = new Set<string>();
  const fixedMessages: Message[] = [];
  let duplicateCount = 0;
  
  console.log(`🔍 检查 ${messages.length} 条消息的ID唯一性...`);
  
  messages.forEach((message, index) => {
    let uniqueId = message.id;
    
    // 如果ID已经存在，生成新的ID
    if (seenIds.has(uniqueId)) {
      console.log(`⚠️ 发现重复的消息ID: ${uniqueId} (索引: ${index})，正在修复...`);
      duplicateCount++;
      uniqueId = generateUniqueMessageId(message.id.split('_')[0] || 'msg');
    }
    
    seenIds.add(uniqueId);
    fixedMessages.push({
      ...message,
      id: uniqueId,
    });
  });
  
  if (duplicateCount > 0) {
    console.log(`🔧 修复了 ${duplicateCount} 个重复的消息ID`);
  } else {
    console.log(`✅ 所有消息ID都是唯一的`);
  }
  
  return fixedMessages;
};

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
      const fixedMessages = ensureUniqueMessageIds(newSession.messages);
      setMessages(fixedMessages);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const currentSession = await getCurrentChatSession();
      if (currentSession && currentSession.messages.length > 0) {
        // 检查并修复重复的消息ID
        const fixedMessages = ensureUniqueMessageIds(currentSession.messages);
        setMessages(fixedMessages);
      } else {
        // 如果没有历史消息，创建新的会话
        const newSession = createNewChatSession();
        const fixedMessages = ensureUniqueMessageIds(newSession.messages);
        setMessages(fixedMessages);
      }
    } catch (error) {
      console.error('加载聊天历史失败:', error);
      // 如果加载失败，创建新的会话
      const newSession = createNewChatSession();
      const fixedMessages = ensureUniqueMessageIds(newSession.messages);
      setMessages(fixedMessages);
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
      id: generateUniqueMessageId(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // 移除用户消息后的滚动，让FlatList自动处理

    try {
      // 保存用户消息到存储
      await addMessageToCurrentSession(userMessage);



      // 生成AI回复
      let aiResponseText: string;
      
      if (isAPIAvailable && isAPIInitialized()) {
        // 使用DeepSeek API
        console.log('🤖 使用DeepSeek API生成回复...');
        
        // 构建对话历史 - 只使用最后10条消息
        const conversationHistory = messages
          .slice(-10) // 只取最后10条消息
          .map(msg => ({
            role: msg.isUser ? 'user' as const : 'assistant' as const,
            content: msg.text,
          }));
        
        // 立即添加AI思考消息
        const thinkingMessage: Message = {
          id: generateUniqueMessageId('thinking'),
          text: '',
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, thinkingMessage]);
        
        // 移除思考消息后的滚动
        
        try {
          // 使用流式API
          let fullResponse = '';
          
          await sendMessageToDeepSeekStream(
            text.trim(),
            conversationHistory,
            (chunk: string) => {
              // 收到每个文本块时更新消息
              fullResponse += chunk;
              
              // 更新状态
              setMessages(prev => prev.map(msg => 
                msg.id === thinkingMessage.id 
                  ? { ...msg, text: fullResponse }
                  : msg
              ));
              
              // 移除流式更新时的滚动
            },
            (completeResponse: string) => {
              // 流式传输完成
              console.log('✅ 流式回复完成');
              aiResponseText = completeResponse;
              
              // 最终更新消息
              setMessages(prev => prev.map(msg => 
                msg.id === thinkingMessage.id 
                  ? { ...msg, text: completeResponse }
                  : msg
              ));
              
              // 移除最终滚动
              
              // 保存完整的AI回复到存储
              const aiMessage: Message = {
                id: thinkingMessage.id,
                text: completeResponse,
                isUser: false,
                timestamp: thinkingMessage.timestamp,
              };
              addMessageToCurrentSession(aiMessage);
            },
            (error: Error) => {
              console.error('DeepSeek API流式调用失败:', error);
              
              // 更新思考消息为错误信息
              setMessages(prev => prev.map(msg => 
                msg.id === thinkingMessage.id 
                  ? { ...msg, text: `API调用失败：${error.message}` }
                  : msg
              ));
              
              // 保存错误消息到存储
              const errorMessage: Message = {
                id: thinkingMessage.id,
                text: `API调用失败：${error.message}`,
                isUser: false,
                timestamp: thinkingMessage.timestamp,
              };
              addMessageToCurrentSession(errorMessage);
            },
            true // 包含血糖数据
          );
        } catch (error) {
          console.error('DeepSeek API调用失败:', error);
          
          // 更新思考消息为错误信息
          setMessages(prev => prev.map(msg => 
            msg.id === thinkingMessage.id 
              ? { ...msg, text: `API调用失败：${error instanceof Error ? error.message : '未知错误'}` }
              : msg
          ));
          
          // 保存错误消息到存储
          const errorMessage: Message = {
            id: thinkingMessage.id,
            text: `API调用失败：${error instanceof Error ? error.message : '未知错误'}`,
            isUser: false,
            timestamp: thinkingMessage.timestamp,
          };
          addMessageToCurrentSession(errorMessage);
        }
      } else {
        // 使用本地AI回复
        console.log('🤖 使用本地AI生成回复...');
        
        // 使用本地AI回复函数
        aiResponseText = generateSimpleAIResponse(text.trim());
        
        // 添加AI回复消息
        const aiMessage: Message = {
          id: generateUniqueMessageId(),
          text: aiResponseText,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
        addMessageToCurrentSession(aiMessage);
        
        console.log('✅ 本地AI回复已生成');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 添加错误提示消息
      const errorMessage: Message = {
        id: generateUniqueMessageId(),
        text: `发送消息失败：${error instanceof Error ? error.message : '未知错误'}`,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      addMessageToCurrentSession(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceResult = (text: string) => {
    if (text.trim()) {
      sendMessage(text.trim());
    }
  };

  // 处理图片上传
  const handleImageUpload = async (imageUri: string) => {
    const newMessage: Message = {
      id: generateUniqueMessageId(),
      text: '',
      imageUri: imageUri,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    addMessageToCurrentSession(newMessage);
    
    // 移除滚动操作，让FlatList自动处理
    // 当inverted为true时，新消息会自动显示在顶部

    // 开始OCR识别
    try {
      console.log('🔍 开始识别图片中的文字...');
      
      // 添加OCR识别中的消息
      const ocrMessage: Message = {
        id: generateUniqueMessageId('ocr'),
        text: '正在识别图片中的文字...',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, ocrMessage]);
      
      // 调用腾讯OCR API识别文字，现在返回识别文字和异常数据
      const { recognizedText, abnormalData } = await recognizeTextWithTencentOcr(imageUri);
      
      console.log('✅ OCR识别结果:', recognizedText);
      console.log('🔍 异常指标数据:', abnormalData);
      
      // 移除OCR识别中的消息
      setMessages(prev => prev.filter(msg => msg.id !== ocrMessage.id));
      
      // 更新用户消息，添加OCR数据
      const updatedUserMessage: Message = {
        ...newMessage,
        ocrData: {
          recognizedText: recognizedText,
          timestamp: new Date(),
        },
      };
      
      // 更新消息列表中的用户消息
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? updatedUserMessage : msg
      ));
      
      // 保存更新后的用户消息到存储
      await addMessageToCurrentSession(updatedUserMessage);
      
      // 生成AI回复
      if (recognizedText.trim()) {
        // 构建对话历史 - 只使用最后10条消息
        const conversationHistory = messages
          .slice(-10) // 只取最后10条消息
          .map(msg => ({
            role: msg.isUser ? 'user' as const : 'assistant' as const,
            content: msg.text,
          }));
        
        // 立即添加AI思考消息
        const thinkingMessage: Message = {
          id: generateUniqueMessageId('thinking'),
          text: '',
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, thinkingMessage]);
        
        try {
          // 使用DeepSeek API分析OCR数据
          let fullResponse = '';
          
          await sendMessageToDeepSeekStream(
            `我上传了一张图片，OCR识别到的文字内容是：\n\n"${recognizedText}"\n\n请分析这些文字内容，并提供有用的见解和建议。`,
            conversationHistory,
            (chunk: string) => {
              // 收到每个文本块时更新消息
              fullResponse += chunk;
              
              // 更新状态
              setMessages(prev => prev.map(msg => 
                msg.id === thinkingMessage.id 
                  ? { ...msg, text: fullResponse }
                  : msg
              ));
            },
            (completeResponse: string) => {
              // 流式传输完成
              console.log('✅ DeepSeek API分析OCR数据完成');
              
              // 最终更新消息
              setMessages(prev => prev.map(msg => 
                msg.id === thinkingMessage.id 
                  ? { ...msg, text: completeResponse }
                  : msg
              ));
              
              // 保存完整的AI回复到存储
              const aiMessage: Message = {
                id: thinkingMessage.id,
                text: completeResponse,
                isUser: false,
                timestamp: thinkingMessage.timestamp,
              };
              addMessageToCurrentSession(aiMessage);
            },
            (error: Error) => {
              console.error('DeepSeek API分析OCR数据失败:', error);
              
              // 更新思考消息为错误信息
              setMessages(prev => prev.map(msg => 
                msg.id === thinkingMessage.id 
                  ? { ...msg, text: `分析OCR数据失败：${error.message}` }
                  : msg
              ));
              
              // 保存错误消息到存储
              const errorMessage: Message = {
                id: thinkingMessage.id,
                text: `分析OCR数据失败：${error.message}`,
                isUser: false,
                timestamp: thinkingMessage.timestamp,
              };
              addMessageToCurrentSession(errorMessage);
            },
            true // 包含血糖数据
          );
        } catch (error) {
          console.error('DeepSeek API调用失败:', error);
          
          // 更新思考消息为错误信息
          setMessages(prev => prev.map(msg => 
            msg.id === thinkingMessage.id 
              ? { ...msg, text: `分析OCR数据失败：${error instanceof Error ? error.message : '未知错误'}` }
              : msg
          ));
          
          // 保存错误消息到存储
          const errorMessage: Message = {
            id: thinkingMessage.id,
            text: `分析OCR数据失败：${error instanceof Error ? error.message : '未知错误'}`,
            isUser: false,
            timestamp: thinkingMessage.timestamp,
          };
          addMessageToCurrentSession(errorMessage);
        }
        
        console.log('✅ AI分析OCR数据完成');
      } else {
        // 如果没有识别到文字，给出提示
        const aiMessage: Message = {
          id: generateUniqueMessageId(),
          text: '抱歉，我没有识别到图片中的文字内容。请确保图片清晰且包含文字。',
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
        addMessageToCurrentSession(aiMessage);
      }
    } catch (error) {
      console.error('❌ OCR识别失败:', error);
      
      // 移除OCR识别中的消息
      setMessages(prev => prev.filter(msg => msg.text !== '正在识别图片中的文字...'));
      
      // 添加错误提示消息
      const errorMessage: Message = {
        id: generateUniqueMessageId(),
        text: `图片识别失败：${error instanceof Error ? error.message : '未知错误'}`,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      addMessageToCurrentSession(errorMessage);
    }
  };

  const scrollToTop = () => {
    // 当inverted为true时，滚动到顶部实际上是滚动到列表末尾
    flatListRef.current?.scrollToEnd({ animated: true });
  };



  const renderMessage = ({ item, index }: { item: Message, index: number }) => (
    <ChatMessage
      index={index}
      text={item.text}
      imageUri={item.imageUri}
      isUser={item.isUser}
      timestamp={item.timestamp}
      isThinking={isLoading && !item.isUser && item.text === ''}
    />
  );

  const getTitleName = () => {
    return "控糖小助手"
  };


  if (isLoadingHistory) {
    return (
      <PageContainer title={getTitleName()} addHeaderSpacing={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>加载聊天记录...</ThemedText>
        </View>
      </PageContainer>
    );
  }

  // 添加错误处理
  if (!messages || messages.length === 0) {
    return (
      <PageContainer title={getTitleName()} addHeaderSpacing={false}>
        <View style={styles.errorContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#999" />
          <ThemedText style={styles.errorText}>欢迎使用SugarAssistant</ThemedText>
          <ThemedText style={styles.errorSubtext}>
            开始新的对话来创建第一个会话
          </ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              initializeChat();
            }}
          >
            <ThemedText style={styles.retryButtonText}>重新加载</ThemedText>
          </TouchableOpacity>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={getTitleName()}
      showMenuButton={true}
      addHeaderSpacing={false}
      rightComponent={
        <View style={styles.headerRightButtons}>
          <TouchableOpacity onPress={() => router.push('/foods')} style={styles.headerButton}>
            <Ionicons name="restaurant-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/blood-sugar-record' as any)} style={styles.headerButton}>
            <Ionicons name="fitness-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/diabetes-education' as any)} style={styles.headerButton}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      }
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={0}
        enabled={true}
      >
        <ThemedView style={styles.container}>
          {/* 聊天内容区域 */}
          <View style={styles.chatContainer}>
            <FlatList
              ref={flatListRef}
              data={messages.slice().reverse()}
              renderItem={renderMessage}
              keyExtractor={item => {
                // console.log(`🔍 FlatList keyExtractor: ${item.id}`);
                return item.id;
              }}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContentContainer}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              alwaysBounceVertical={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={10}
              keyboardDismissMode="none"
              inverted={true}
              nestedScrollEnabled={false}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10,
              }}
            />
          </View>

          {/* 输入框区域 */}
          <View style={styles.inputContainer}>
            <WeChatInput
              value={inputText}
              onChangeText={setInputText}
              onSend={sendMessage}
              onVoiceResult={handleVoiceResult}
              onImageUpload={handleImageUpload}
              disabled={isLoading}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  keyboardAvoidingContent: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#eeeeee',
  },
  messagesContentContainer: {
    flexGrow: 1,
    // paddingTop: 20, // 当inverted为true时，这是底部间距
    // paddingBottom: 60, // 为输入框留出空间
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 