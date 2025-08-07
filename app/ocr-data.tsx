import CustomTransition from '@/components/CustomTransition';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getStatusBarHeight } from '@/utils/androidSafeArea';
import { getAllSessionsOcrData } from '@/utils/chatStorage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface OcrDataItem {
  id: string;
  text: string;
  timestamp: Date;
  sessionId?: string;
}

// 全局计数器，确保ID唯一性
let ocrDataIdCounter = 0;

// 生成唯一OCR数据ID的函数
const generateUniqueOcrDataId = () => {
  ocrDataIdCounter++;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `ocr_${timestamp}_${ocrDataIdCounter}_${random}`;
};

export default function OcrDataScreen() {
  const [ocrDataList, setOcrDataList] = useState<OcrDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadOcrData();
  }, []);

  const loadOcrData = async () => {
    try {
      setIsLoading(true);
      // 获取所有会话的OCR数据
      const ocrData = await getAllSessionsOcrData();
      console.log('📄 所有会话OCR数据:', ocrData);

      // 转换为显示格式，使用OCR完成时的实际时间
      const ocrDataItems: OcrDataItem[] = ocrData.map((item, index) => {
        console.log(`📅 OCR项目 ${index}: 文本="${item.text.substring(0, 20)}..." 时间=${item.timestamp.toLocaleString('zh-CN', { hour12: false })}`);
        return {
          id: generateUniqueOcrDataId(),
          text: item.text,
          timestamp: item.timestamp, // 使用OCR完成时的实际时间
        };
      });

      setOcrDataList(ocrDataItems);
    } catch (error) {
      console.error('加载OCR数据失败:', error);
      Alert.alert('错误', '加载OCR数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条OCR数据吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: () => {
            setOcrDataList(prev => prev.filter(item => item.id !== itemId));
          }
        }
      ]
    );
  };

  const handleItemPress = (item: OcrDataItem) => {
    // 导航到详情页面，传递OCR数据
    router.push({
      pathname: '/ocr-detail' as any,
      params: { 
        ocrData: JSON.stringify(item),
        showAllSessions: 'true' // 默认显示所有会话
      }
    });
  };

  const renderOcrItem = ({ item }: { item: OcrDataItem }) => (
    <TouchableOpacity 
      style={styles.ocrItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.ocrContent}>
        <Text style={styles.ocrText} numberOfLines={3}>
          {item.text}
        </Text>
        <Text style={styles.ocrTimestamp}>
          {item.timestamp.toLocaleString('zh-CN', { hour12: false })}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>暂无OCR数据</Text>
      <Text style={styles.emptySubtitle}>
        所有会话中都没有OCR识别数据
      </Text>
      <TouchableOpacity style={styles.uploadButton} onPress={() => router.push('/chat')}>
        <Text style={styles.uploadButtonText}>去上传图片</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <CustomTransition isVisible={true} animationType="slide" duration={350}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="transparent" 
          translucent={Platform.OS === 'android'}
        />
        <ThemedView style={styles.container}>
          {/* 顶部导航栏 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <ThemedText style={styles.title}>OCR数据列表</ThemedText>
            <View style={styles.placeholder} />
          </View>

          {/* 数据统计 */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              共找到 {ocrDataList.length} 条OCR数据
            </Text>
          </View>

          {/* OCR数据列表 */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          ) : (
            <FlatList
              data={ocrDataList}
              renderItem={renderOcrItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={renderEmptyState}
            />
          )}
        </ThemedView>
      </SafeAreaView>
    </CustomTransition>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'android' ? getStatusBarHeight() : 0,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  ocrItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  ocrContent: {
    flex: 1,
    paddingRight: 30, // 为删除按钮留出空间
  },
  ocrText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  ocrTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 40, // Adjust as needed for spacing
  },
}); 