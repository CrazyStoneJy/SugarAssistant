import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const CHAT_SESSIONS_KEY = 'sugar_assistant_chat_sessions';
const CURRENT_SESSION_KEY = 'sugar_assistant_current_session';

/**
 * 保存聊天会话
 */
export async function saveChatSession(session: ChatSession): Promise<void> {
  try {
    // 保存会话到会话列表
    const sessions = await getChatSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    
    // 保存当前会话
    await AsyncStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('保存聊天会话失败:', error);
    throw new Error('保存聊天会话失败');
  }
}

/**
 * 获取所有聊天会话
 */
export async function getChatSessions(): Promise<ChatSession[]> {
  try {
    const sessionsString = await AsyncStorage.getItem(CHAT_SESSIONS_KEY);
    if (sessionsString) {
      const sessions = JSON.parse(sessionsString);
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    }
    return [];
  } catch (error) {
    console.error('获取聊天会话失败:', error);
    return [];
  }
}

/**
 * 获取当前聊天会话
 */
export async function getCurrentChatSession(): Promise<ChatSession | null> {
  try {
    const sessionString = await AsyncStorage.getItem(CURRENT_SESSION_KEY);
    if (sessionString) {
      const session = JSON.parse(sessionString);
      return {
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      };
    }
    return null;
  } catch (error) {
    console.error('获取当前聊天会话失败:', error);
    return null;
  }
}

/**
 * 创建新的聊天会话
 */
export function createNewChatSession(): ChatSession {
  const sessionId = `session_${Date.now()}`;
  const now = new Date();
  
  return {
    id: sessionId,
    messages: [
      {
        id: '1',
        text: '你好！我是你的AI助手，有什么可以帮助你的吗？',
        isUser: false,
        timestamp: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 添加消息到当前会话
 */
export async function addMessageToCurrentSession(message: ChatMessage): Promise<void> {
  try {
    let session = await getCurrentChatSession();
    
    if (!session) {
      session = createNewChatSession();
    }
    
    session.messages.push(message);
    session.updatedAt = new Date();
    
    await saveChatSession(session);
  } catch (error) {
    console.error('添加消息失败:', error);
    throw new Error('添加消息失败');
  }
}

/**
 * 清除当前聊天会话
 */
export async function clearCurrentChatSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error('清除当前聊天会话失败:', error);
    throw new Error('清除聊天会话失败');
  }
}

/**
 * 删除聊天会话
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  try {
    const sessions = await getChatSessions();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(filteredSessions));
    
    // 如果删除的是当前会话，清除当前会话
    const currentSession = await getCurrentChatSession();
    if (currentSession && currentSession.id === sessionId) {
      await clearCurrentChatSession();
    }
  } catch (error) {
    console.error('删除聊天会话失败:', error);
    throw new Error('删除聊天会话失败');
  }
}

/**
 * 清除所有聊天数据
 */
export async function clearAllChatData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([CHAT_SESSIONS_KEY, CURRENT_SESSION_KEY]);
  } catch (error) {
    console.error('清除所有聊天数据失败:', error);
    throw new Error('清除聊天数据失败');
  }
}

/**
 * 获取存储的聊天数据大小（用于调试）
 */
export async function getChatStorageSize(): Promise<number> {
  try {
    const sessions = await getChatSessions();
    const currentSession = await getCurrentChatSession();
    
    const sessionsSize = JSON.stringify(sessions).length;
    const currentSize = currentSession ? JSON.stringify(currentSession).length : 0;
    
    return sessionsSize + currentSize;
  } catch (error) {
    console.error('获取存储大小失败:', error);
    return 0;
  }
} 