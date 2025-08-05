import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import CustomTransition from '@/components/CustomTransition';
import AdvancedTransition from '@/components/AdvancedTransition';
import foodDetailsJson from '@/data/food-details.json';
import { getStatusBarHeight } from '@/utils/androidSafeArea';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface FoodDetail {
  id: string;
  name: string;
  image: string;
  sugarContent: number;
  glycemicIndex: number;
  category: string;
  description: string;
  benefits: string[];
  warnings: string[];
  servingSize: string;
  calories: number;
}

// 从JSON文件导入食物详情数据
const foodDetails: Record<string, FoodDetail> = foodDetailsJson.foodDetails;

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const food = foodDetails[id || '1'];

  if (!food) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <ThemedText style={styles.title}>食物详情</ThemedText>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>未找到食物信息</ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const getGlycemicLevel = (gi: number) => {
    if (gi <= 55) return { level: '低', color: '#4CAF50' };
    if (gi <= 70) return { level: '中', color: '#FF9800' };
    return { level: '高', color: '#F44336' };
  };

  const glycemicLevel = getGlycemicLevel(food.glycemicIndex);

  return (
    <CustomTransition isVisible={true} animationType="slide" duration={350}>
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
            <ThemedText style={styles.title}>食物详情</ThemedText>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 食物基本信息 */}
            <View style={styles.foodHeader}>
              <View style={styles.foodImageContainer}>
                <Text style={styles.foodImage}>{food.image}</Text>
              </View>
              <View style={styles.foodInfo}>
                <ThemedText style={styles.foodName}>{food.name}</ThemedText>
                <ThemedText style={styles.foodCategory}>{food.category}</ThemedText>
              </View>
            </View>

            {/* 营养信息 */}
            <View style={styles.nutritionSection}>
              <ThemedText style={styles.sectionTitle}>营养信息</ThemedText>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <ThemedText style={styles.nutritionLabel}>含糖量</ThemedText>
                  <ThemedText style={styles.nutritionValue}>{food.sugarContent}g</ThemedText>
                </View>
                <View style={styles.nutritionItem}>
                  <ThemedText style={styles.nutritionLabel}>升糖指数</ThemedText>
                  <ThemedText style={styles.nutritionValue}>{food.glycemicIndex}</ThemedText>
                </View>
                <View style={styles.nutritionItem}>
                  <ThemedText style={styles.nutritionLabel}>升糖等级</ThemedText>
                  <ThemedText style={[styles.nutritionValue, { color: glycemicLevel.color }]}>
                    {glycemicLevel.level}
                  </ThemedText>
                </View>
                <View style={styles.nutritionItem}>
                  <ThemedText style={styles.nutritionLabel}>热量</ThemedText>
                  <ThemedText style={styles.nutritionValue}>{food.calories}kcal</ThemedText>
                </View>
              </View>
            </View>

            {/* 食物描述 */}
            <View style={styles.descriptionSection}>
              <ThemedText style={styles.sectionTitle}>食物描述</ThemedText>
              <ThemedText style={styles.description}>{food.description}</ThemedText>
            </View>

            {/* 健康益处 */}
            <View style={styles.benefitsSection}>
              <ThemedText style={styles.sectionTitle}>健康益处</ThemedText>
              {food.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <ThemedText style={styles.benefitText}>{benefit}</ThemedText>
                </View>
              ))}
            </View>

            {/* 注意事项 */}
            <View style={styles.warningsSection}>
              <ThemedText style={styles.sectionTitle}>注意事项</ThemedText>
              {food.warnings.map((warning, index) => (
                <View key={index} style={styles.warningItem}>
                  <Ionicons name="warning" size={16} color="#FF9800" />
                  <ThemedText style={styles.warningText}>{warning}</ThemedText>
                </View>
              ))}
            </View>

            {/* 食用建议 */}
            <View style={styles.adviceSection}>
              <ThemedText style={styles.sectionTitle}>食用建议</ThemedText>
              <View style={styles.adviceContainer}>
                <ThemedText style={styles.adviceText}>
                  • 建议食用量：{food.servingSize}
                </ThemedText>
                <ThemedText style={styles.adviceText}>
                  • 最佳食用时间：餐后30分钟
                </ThemedText>
                <ThemedText style={styles.adviceText}>
                  • 搭配建议：与蛋白质食物一起食用可降低升糖指数
                </ThemedText>
              </View>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  foodImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  foodImage: {
    fontSize: 32,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  foodCategory: {
    fontSize: 14,
    color: '#666',
  },
  nutritionSection: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  descriptionSection: {
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
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  benefitsSection: {
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
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  warningsSection: {
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
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  adviceSection: {
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
  adviceContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
  },
  adviceText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
}); 