import { ThemedText } from '@/components/ThemedText';
import { getStatusBarHeight } from '@/utils/androidSafeArea';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface BloodSugarRecord {
  id: string;
  timestamp: Date;
  bloodSugar: number; // 血糖值 (mmol/L)
  mealType: 'before-breakfast' | 'after-breakfast' | 'before-lunch' | 'after-lunch' | 'before-dinner' | 'after-dinner' | 'bedtime';
  notes?: string;
}

interface ChartData {
  date: string;
  beforeMeal: number[];
  afterMeal: number[];
}

export default function BloodSugarRecordScreen() {
  const [records, setRecords] = useState<BloodSugarRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<BloodSugarRecord['mealType']>('before-breakfast');
  const [bloodSugarValue, setBloodSugarValue] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const mealTypeLabels = {
    'before-breakfast': '早餐前',
    'after-breakfast': '早餐后',
    'before-lunch': '午餐前',
    'after-lunch': '午餐后',
    'before-dinner': '晚餐前',
    'after-dinner': '晚餐后',
    'bedtime': '睡前'
  };

  const mealTypeIcons = {
    'before-breakfast': 'sunny-outline',
    'after-breakfast': 'sunny',
    'before-lunch': 'restaurant-outline',
    'after-lunch': 'restaurant',
    'before-dinner': 'moon-outline',
    'after-dinner': 'moon',
    'bedtime': 'bed-outline'
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const storedRecords = await AsyncStorage.getItem('bloodSugarRecords');
      if (storedRecords) {
        const parsedRecords = JSON.parse(storedRecords).map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp)
        }));
        setRecords(parsedRecords);
      }
    } catch (error) {
      console.error('加载血糖记录失败:', error);
    }
  };

  const saveRecords = async (newRecords: BloodSugarRecord[]) => {
    try {
      await AsyncStorage.setItem('bloodSugarRecords', JSON.stringify(newRecords));
      setRecords(newRecords);
    } catch (error) {
      console.error('保存血糖记录失败:', error);
      Alert.alert('错误', '保存记录失败，请重试');
    }
  };

  const addRecord = () => {
    if (!bloodSugarValue.trim()) {
      Alert.alert('提示', '请输入血糖值');
      return;
    }

    const value = parseFloat(bloodSugarValue);
    if (isNaN(value) || value < 0 || value > 50) {
      Alert.alert('提示', '请输入有效的血糖值 (0-50 mmol/L)');
      return;
    }

    const newRecord: BloodSugarRecord = {
      id: Date.now().toString(),
      timestamp: selectedDate,
      bloodSugar: value,
      mealType: selectedMealType,
      notes: notes.trim() || undefined
    };

    const newRecords = [newRecord, ...records];
    saveRecords(newRecords);
    
    // 重置表单
    setBloodSugarValue('');
    setNotes('');
    setSelectedMealType('before-breakfast');
    setShowAddModal(false);
    
    Alert.alert('成功', '血糖记录已保存');
  };

  const deleteRecord = (id: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            const newRecords = records.filter(record => record.id !== id);
            saveRecords(newRecords);
          }
        }
      ]
    );
  };

  const getBloodSugarStatus = (value: number) => {
    if (value < 3.9) return { status: '低血糖', color: '#e74c3c', icon: 'warning' };
    if (value <= 6.1) return { status: '正常', color: '#27ae60', icon: 'checkmark-circle' };
    if (value <= 7.8) return { status: '偏高', color: '#f39c12', icon: 'alert-circle' };
    return { status: '高血糖', color: '#e74c3c', icon: 'close-circle' };
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const renderRecordItem = (record: BloodSugarRecord) => {
    const status = getBloodSugarStatus(record.bloodSugar);
    
    return (
      <View key={record.id} style={styles.recordItem}>
        <View style={styles.recordHeader}>
          <View style={styles.recordInfo}>
            <View style={styles.mealTypeContainer}>
              <Ionicons 
                name={mealTypeIcons[record.mealType] as any} 
                size={20} 
                color="#0a7ea4" 
              />
              <ThemedText style={styles.mealTypeText}>
                {mealTypeLabels[record.mealType]}
              </ThemedText>
            </View>
            <View style={styles.timeContainer}>
              <ThemedText style={styles.dateText}>
                {formatDate(record.timestamp)}
              </ThemedText>
              <ThemedText style={styles.timeText}>
                {formatTime(record.timestamp)}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => deleteRecord(record.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.recordBody}>
          <View style={styles.bloodSugarContainer}>
            <ThemedText style={styles.bloodSugarValue}>
              {record.bloodSugar}
            </ThemedText>
            <ThemedText style={styles.bloodSugarUnit}>mmol/L</ThemedText>
          </View>
          
          <View style={styles.statusContainer}>
            <Ionicons 
              name={status.icon as any} 
              size={16} 
              color={status.color} 
            />
            <ThemedText style={[styles.statusText, { color: status.color }]}>
              {status.status}
            </ThemedText>
          </View>
        </View>
        
        {record.notes && (
          <View style={styles.notesContainer}>
            <ThemedText style={styles.notesText}>{record.notes}</ThemedText>
          </View>
        )}
      </View>
    );
  };

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>添加血糖记录</ThemedText>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#687076" />
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <ThemedText style={styles.formLabel}>测量时间</ThemedText>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText style={styles.dateInputText}>
                {selectedDate.toLocaleDateString('zh-CN')} {selectedDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </ThemedText>
              <Ionicons name="calendar-outline" size={20} color="#687076" />
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <ThemedText style={styles.formLabel}>餐次类型</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealTypeScroll}>
              {Object.entries(mealTypeLabels).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.mealTypeButton,
                    selectedMealType === key && styles.mealTypeButtonSelected
                  ]}
                  onPress={() => setSelectedMealType(key as BloodSugarRecord['mealType'])}
                >
                  <Ionicons 
                    name={mealTypeIcons[key as keyof typeof mealTypeIcons] as any} 
                    size={16} 
                    color={selectedMealType === key ? '#fff' : '#687076'} 
                  />
                  <ThemedText style={[
                    styles.mealTypeButtonText,
                    selectedMealType === key && styles.mealTypeButtonTextSelected
                  ]}>
                    {label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formSection}>
            <ThemedText style={styles.formLabel}>血糖值 (mmol/L)</ThemedText>
            <TextInput
              style={styles.textInput}
              value={bloodSugarValue}
              onChangeText={setBloodSugarValue}
              placeholder="请输入血糖值"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <View style={styles.formSection}>
            <ThemedText style={styles.formLabel}>备注 (可选)</ThemedText>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="添加备注信息"
              multiline
              maxLength={100}
            />
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={addRecord}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.addButtonText}>保存记录</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderStats = () => {
    if (records.length === 0) return null;

    const today = new Date();
    const todayRecords = records.filter(record => 
      record.timestamp.toDateString() === today.toDateString()
    );

    const average = todayRecords.length > 0 
      ? todayRecords.reduce((sum, record) => sum + record.bloodSugar, 0) / todayRecords.length
      : 0;

    const highest = todayRecords.length > 0 
      ? Math.max(...todayRecords.map(record => record.bloodSugar))
      : 0;

    const lowest = todayRecords.length > 0 
      ? Math.min(...todayRecords.map(record => record.bloodSugar))
      : 0;

    return (
      <View style={styles.statsContainer}>
        <ThemedText style={styles.statsTitle}>今日统计</ThemedText>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{todayRecords.length}</ThemedText>
            <ThemedText style={styles.statLabel}>记录次数</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{average.toFixed(1)}</ThemedText>
            <ThemedText style={styles.statLabel}>平均血糖</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{highest.toFixed(1)}</ThemedText>
            <ThemedText style={styles.statLabel}>最高血糖</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{lowest.toFixed(1)}</ThemedText>
            <ThemedText style={styles.statLabel}>最低血糖</ThemedText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* 头部 */}
      <View style={[styles.header, { paddingTop: getStatusBarHeight() + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0a7ea4" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>血糖记录</ThemedText>
        <TouchableOpacity
          style={styles.addButtonHeader}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#0a7ea4" />
        </TouchableOpacity>
      </View>

      {/* 统计信息 */}
      {renderStats()}

      {/* 记录列表 */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color="#ccc" />
            <ThemedText style={styles.emptyTitle}>暂无血糖记录</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              点击右上角"+"按钮添加第一条血糖记录
            </ThemedText>
          </View>
        ) : (
          records.map(renderRecordItem)
        )}
      </ScrollView>

      {/* 添加记录模态框 */}
      {renderAddModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#11181C',
  },
  addButtonHeader: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  statsContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0a7ea4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#687076',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
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
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 20,
  },
  recordItem: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordInfo: {
    flex: 1,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginLeft: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#687076',
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#687076',
  },
  deleteButton: {
    padding: 8,
  },
  recordBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bloodSugarContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bloodSugarValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#11181C',
  },
  bloodSugarUnit: {
    fontSize: 16,
    color: '#687076',
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  notesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#687076',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#11181C',
  },
  closeButton: {
    padding: 4,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#11181C',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  dateInputText: {
    fontSize: 16,
    color: '#11181C',
  },
  mealTypeScroll: {
    flexDirection: 'row',
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  mealTypeButtonSelected: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  mealTypeButtonText: {
    fontSize: 14,
    color: '#687076',
    marginLeft: 4,
  },
  mealTypeButtonTextSelected: {
    color: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
