import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import CustomTransition from '@/components/CustomTransition';
import AdvancedTransition from '@/components/AdvancedTransition';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getStatusBarHeight } from '@/utils/androidSafeArea';

const animationTypes = [
  { name: 'slide', label: '滑动' },
  { name: 'fade', label: '淡入淡出' },
  { name: 'scale', label: '缩放' },
  { name: 'slideUp', label: '向上滑动' },
  { name: 'slideDown', label: '向下滑动' },
  { name: 'zoom', label: '放大' },
  { name: 'flip', label: '翻转' },
  { name: 'bounce', label: '弹跳' },
];

const directions = [
  { name: 'left', label: '左' },
  { name: 'right', label: '右' },
  { name: 'up', label: '上' },
  { name: 'down', label: '下' },
];

const easings = [
  { name: 'linear', label: '线性' },
  { name: 'ease', label: '缓动' },
  { name: 'bounce', label: '弹跳' },
  { name: 'elastic', label: '弹性' },
];

export default function TransitionDemoScreen() {
  const [selectedAnimation, setSelectedAnimation] = useState('slide');
  const [selectedDirection, setSelectedDirection] = useState('right');
  const [selectedEasing, setSelectedEasing] = useState('ease');
  const [isVisible, setIsVisible] = useState(true);
  const [duration, setDuration] = useState(300);

  const triggerAnimation = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={Platform.OS === 'android'}
      />
      <ThemedView style={styles.container}>
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>转场动画演示</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 动画预览区域 */}
          <View style={styles.previewContainer}>
            <CustomTransition 
              isVisible={isVisible} 
              animationType={selectedAnimation as any}
              direction={selectedDirection as any}
              easing={selectedEasing as any}
              duration={duration}
            >
              <View style={styles.previewBox}>
                <Ionicons name="star" size={48} color="#FFD700" />
                <ThemedText style={styles.previewText}>动画预览</ThemedText>
              </View>
            </CustomTransition>
          </View>

          {/* 控制按钮 */}
          <View style={styles.controlsSection}>
            <TouchableOpacity style={styles.triggerButton} onPress={triggerAnimation}>
              <ThemedText style={styles.triggerButtonText}>触发动画</ThemedText>
            </TouchableOpacity>
          </View>

          {/* 动画类型选择 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>动画类型</ThemedText>
            <View style={styles.optionsGrid}>
              {animationTypes.map((type) => (
                <TouchableOpacity
                  key={type.name}
                  style={[
                    styles.optionButton,
                    selectedAnimation === type.name && styles.optionButtonActive
                  ]}
                  onPress={() => setSelectedAnimation(type.name)}
                >
                  <ThemedText style={[
                    styles.optionButtonText,
                    selectedAnimation === type.name && styles.optionButtonTextActive
                  ]}>
                    {type.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 方向选择 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>方向</ThemedText>
            <View style={styles.optionsGrid}>
              {directions.map((direction) => (
                <TouchableOpacity
                  key={direction.name}
                  style={[
                    styles.optionButton,
                    selectedDirection === direction.name && styles.optionButtonActive
                  ]}
                  onPress={() => setSelectedDirection(direction.name)}
                >
                  <ThemedText style={[
                    styles.optionButtonText,
                    selectedDirection === direction.name && styles.optionButtonTextActive
                  ]}>
                    {direction.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 缓动函数选择 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>缓动函数</ThemedText>
            <View style={styles.optionsGrid}>
              {easings.map((easing) => (
                <TouchableOpacity
                  key={easing.name}
                  style={[
                    styles.optionButton,
                    selectedEasing === easing.name && styles.optionButtonActive
                  ]}
                  onPress={() => setSelectedEasing(easing.name)}
                >
                  <ThemedText style={[
                    styles.optionButtonText,
                    selectedEasing === easing.name && styles.optionButtonTextActive
                  ]}>
                    {easing.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 持续时间调整 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>持续时间: {duration}ms</ThemedText>
            <View style={styles.durationControls}>
              <TouchableOpacity 
                style={styles.durationButton}
                onPress={() => setDuration(Math.max(100, duration - 100))}
              >
                <ThemedText style={styles.durationButtonText}>-100ms</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.durationButton}
                onPress={() => setDuration(Math.min(1000, duration + 100))}
              >
                <ThemedText style={styles.durationButtonText}>+100ms</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  previewContainer: {
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  previewText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  controlsSection: {
    marginBottom: 24,
  },
  triggerButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  triggerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    minWidth: 60,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  optionButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  durationControls: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 14,
    color: '#333',
  },
}); 