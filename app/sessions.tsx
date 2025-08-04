import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getChatSessions, deleteChatSession, clearAllChatData, ChatSession } from '@/utils/chatStorage';
import { getStatusBarHeight } from '@/utils/androidSafeArea';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getCurrentChatSession } from '@/utils/chatStorage';

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const chatSessions = await getChatSessions();
      setSessions(chatSessions);
    } catch (error) {
      console.error('加载会话失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      '删除会话',
      '确定要删除这个聊天会话吗？此操作不可撤销。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChatSession(sessionId);
              await loadSessions(); // 重新加载会话列表
              
              // 如果删除的是当前会话，导航回聊天页面并刷新
              const currentSession = await getCurrentChatSession();
              if (!currentSession) {
                // 如果没有当前会话，导航回聊天页面
                router.push('/chat');
              }
            } catch (error) {
              console.error('删除会话失败:', error);
              Alert.alert('错误', '删除会话失败');
            }
          },
        },
      ]
    );
  };

  const handleClearAllSessions = () => {
    Alert.alert(
      '清除所有会话',
      '确定要清除所有聊天会话吗？此操作不可撤销。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllChatData();
              setSessions([]);
              
              // 清除所有会话后，导航回聊天页面
              router.push('/chat');
            } catch (error) {
              console.error('清除所有会话失败:', error);
              Alert.alert('错误', '清除所有会话失败');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return '刚刚';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLastMessage = (session: ChatSession) => {
    if (session.messages.length === 0) return '无消息';
    
    const lastMessage = session.messages[session.messages.length - 1];
    const text = lastMessage.text;
    return text.length > 30 ? text.substring(0, 30) + '...' : text;
  };

  const renderSession = ({ item }: { item: ChatSession }) => (
    <TouchableOpacity
      style={styles.sessionItem}
      onPress={() => {
        // 这里可以导航到特定的会话
        router.push('/chat');
      }}
    >
      <View style={styles.sessionInfo}>
        <ThemedText style={styles.sessionTitle}>
          会话 {item.id.substring(8)}
        </ThemedText>
        <ThemedText style={styles.sessionMessage}>
          {getLastMessage(item)}
        </ThemedText>
        <ThemedText style={styles.sessionDate}>
          {formatDate(item.updatedAt)} • {item.messages.length}条消息
        </ThemedText>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteSession(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={Platform.OS === 'android'}
      />
      <ThemedView style={styles.container}>
        {/* 顶部标题栏 */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>聊天会话</ThemedText>
          <TouchableOpacity onPress={handleClearAllSessions} style={styles.clearAllButton}>
            <ThemedText style={styles.clearAllButtonText}>清除全部</ThemedText>
          </TouchableOpacity>
        </View>

        {sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#999" />
            <ThemedText style={styles.emptyText}>暂无聊天会话</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              开始新的对话来创建第一个会话
            </ThemedText>
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={() => router.push('/chat')}
            >
              <ThemedText style={styles.newChatButtonText}>开始新对话</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={sessions}
            renderItem={renderSession}
            keyExtractor={item => item.id}
            style={styles.sessionsList}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F7F7F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingTop: Platform.OS === 'android' ? getStatusBarHeight() : 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
  },
  clearAllButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  newChatButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  newChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionsList: {
    flex: 1,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  sessionMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
}); 