import CustomTransition from '@/components/CustomTransition';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getStatusBarHeight } from '@/utils/androidSafeArea';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
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

interface TableRow {
  key: string;
  value: string;
}

// 全局计数器，确保key唯一性
let tableRowKeyCounter = 0;

// 生成唯一表格行key的函数
const generateUniqueTableRowKey = (index: number, rowKey: string) => {
  tableRowKeyCounter++;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return `table_row_${index}_${rowKey}_${timestamp}_${tableRowKeyCounter}_${random}`;
};

export default function OcrDetailScreen() {
  const { ocrData, showAllSessions } = useLocalSearchParams<{ 
    ocrData: string;
    showAllSessions: string;
  }>();
  
  const [ocrItem, setOcrItem] = useState<OcrDataItem | null>(null);
  const [tableData, setTableData] = useState<TableRow[]>([]);

  useEffect(() => {
    if (ocrData) {
      try {
        const parsedData: OcrDataItem = JSON.parse(ocrData);
        setOcrItem(parsedData);
        
        // 解析OCR文本，提取结构化数据
        const extractedData = parseOcrText(parsedData.text);
        setTableData(extractedData);
      } catch (error) {
        console.error('解析OCR数据失败:', error);
        Alert.alert('错误', '数据格式错误');
      }
    }
  }, [ocrData]);

  const parseOcrText = (text: string): TableRow[] => {
    const rows: TableRow[] = [];
    
    // 添加基本信息
    rows.push({ key: '识别时间', value: new Date().toLocaleString('zh-CN', { hour12: false }) });
    
    // 尝试解析结构化数据
    const lines = text.split('\n').filter(line => line.trim());
    
    // 定义常见的键值对分隔符
    const separators = [':', '：', '=', '＝', '-', '—', '|', '｜'];
    
    lines.forEach((line, index) => {
      let foundSeparator = false;
      
      // 尝试使用不同的分隔符解析
      for (const separator of separators) {
        const separatorIndex = line.indexOf(separator);
        if (separatorIndex > 0) {
          const key = line.substring(0, separatorIndex).trim();
          const value = line.substring(separatorIndex + separator.length).trim();
          if (key && value && key.length < 50) { // 限制key长度避免误判
            rows.push({ key, value });
            foundSeparator = true;
            break;
          }
        }
      }
      
      // 如果没有找到分隔符，按行号显示
      if (!foundSeparator) {
        // 跳过一些明显不是数据的行
        const skipPatterns = ['识别时间', '原始文本', '项目'];
        const shouldSkip = skipPatterns.some(pattern => line.includes(pattern));
        
        if (!shouldSkip) {
          rows.push({ key: `项目 ${index + 1}`, value: line });
        }
      }
    });
    
    return rows;
  };

  const handleBack = () => {
    router.back();
  };

  if (!ocrItem) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

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
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <ThemedText style={styles.title}>OCR数据详情</ThemedText>
            <View style={styles.placeholder} />
          </View>

          {/* 内容区域 */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 数据统计 */}
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>数据统计</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>文本长度：</Text>
                <Text style={styles.statsValue}>{ocrItem.text.length} 字符</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>行数：</Text>
                <Text style={styles.statsValue}>{ocrItem.text.split('\n').length} 行</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>识别时间：</Text>
                <Text style={styles.statsValue}>
                  {ocrItem.timestamp.toLocaleString('zh-CN', { hour12: false })}
                </Text>
              </View>
            </View>

            {/* 数据表格 */}
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>识别数据详情</Text>
              
              {tableData.map((row, index) => (
                <View key={generateUniqueTableRowKey(index, row.key)} style={styles.tableRow}>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellKey}>{row.key}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellValue}>{row.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* 原始文本 */}
            <View style={styles.originalTextContainer}>
              <Text style={styles.originalTextTitle}>原始识别文本</Text>
              <View style={styles.originalTextContent}>
                <Text style={styles.originalText}>{ocrItem.text}</Text>
              </View>
              <Text style={styles.originalTextTimestamp}>
                {ocrItem.timestamp.toLocaleString('zh-CN', { hour12: false })}
              </Text>
            </View>
          </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
    minHeight: 44,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  tableCellKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  tableCellValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  originalTextContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  originalTextTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  originalTextContent: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  originalText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  originalTextTimestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  statsValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  placeholder: {
    width: 40, // 占位符宽度，可以根据需要调整
  },
}); 