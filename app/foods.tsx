import CustomTransition from '@/components/CustomTransition';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import foodsJson from '@/data/foods.json';
import { getStatusBarHeight } from '@/utils/androidSafeArea';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
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

interface FoodItem {
  id: string;
  name: string;
  image: string;
  sugarContent: number; // 含糖量 (g/100g)
  glycemicIndex: number; // 升糖指数
  category: string;
}

// 从JSON文件导入食物数据
const foodsData: FoodItem[] = foodsJson.foods;

export default function FoodsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  
  // 按升糖指数和含糖量排序
  const sortedFoods = useMemo(() => {
    return foodsData
      .filter(food => selectedCategory === '全部' || food.category === selectedCategory)
      .sort((a, b) => {
        // 首先按升糖指数排序
        if (a.glycemicIndex !== b.glycemicIndex) {
          return a.glycemicIndex - b.glycemicIndex;
        }
        // 升糖指数相同时按含糖量排序
        return a.sugarContent - b.sugarContent;
      });
  }, [selectedCategory]);

  // 获取所有分类
  const categories = useMemo(() => {
    const cats = ['全部', ...new Set(foodsData.map(food => food.category))];
    return cats;
  }, []);

  const renderFoodItem = ({ item }: { item: FoodItem }) => {
    const getGlycemicColor = (gi: number) => {
      if (gi <= 55) return '#4CAF50'; // 绿色 - 低升糖
      if (gi <= 70) return '#FF9800'; // 橙色 - 中升糖
      return '#F44336'; // 红色 - 高升糖
    };

    return (
      <TouchableOpacity 
        style={styles.foodItem}
        onPress={() => router.push(`/food-detail?id=${item.id}`)}
      >
        <View style={styles.foodImageContainer}>
          <Text style={styles.foodImage}>{item.image}</Text>
        </View>
        <Text style={styles.foodName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.foodInfo}>
          <Text style={styles.sugarText}>
            糖: {item.sugarContent}g
          </Text>
          <Text style={[styles.giText, { color: getGlycemicColor(item.glycemicIndex) }]}>
            GI: {item.glycemicIndex}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const showInfoDialog = () => {
    Alert.alert(
      '数据说明',
      `含糖量：指每100克食物中糖分的含量（克）。数据来源于USDA营养数据库、中国食物成分表等权威营养数据库。

升糖指数(GI)：反映食物升高血糖的速度和能力。
• ≤55：低升糖
• 56-70：中升糖
• >70：高升糖

数据来源：悉尼大学GI数据库、国际GI表(2021)、USDA营养数据库、中国食物成分表等。`,
      [
        { text: '知道了', style: 'default' }
      ]
    );
  };

  const renderCategoryButton = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item && styles.categoryButtonTextActive
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <CustomTransition isVisible={true} animationType="slideUp" duration={400}>
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
            <ThemedText style={styles.title}>食物库</ThemedText>
            <TouchableOpacity onPress={showInfoDialog} style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* 分类筛选 */}
          <View style={styles.categoryContainer}>
            <FlatList
              data={categories}
              renderItem={renderCategoryButton}
              keyExtractor={item => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          </View>



          {/* 图例说明 */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>低升糖 (≤55)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendText}>中升糖 (56-70)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>高升糖 ({'>'}70)</Text>
            </View>
          </View>

          {/* 食物列表 */}
          <FlatList
            data={sortedFoods}
            renderItem={renderFoodItem}
            keyExtractor={item => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.foodList}
          />
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
  infoButton: {
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
  categoryContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
  },
  foodList: {
    padding: 16,
  },
  foodItem: {
    flex: 1,
    margin: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
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
  foodImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodImage: {
    fontSize: 24,
  },
  foodName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 16,
  },
  foodInfo: {
    alignItems: 'center',
  },
  sugarText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  giText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
  },

}); 