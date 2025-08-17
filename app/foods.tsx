import CustomTransition from '@/components/CustomTransition';
import Header from '@/components/Header';
import { ThemedView } from '@/components/ThemedView';
import foodsJson from '@/data/foods.json';
import { getStatusBarHeight } from '@/utils/androidSafeArea';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface FoodItem {
  id: string;
  name: string;
  image: string;
  sugarContent: number; // 含糖量 (g/100g)
  glycemicIndex: number; // 升糖指数
  category: string;
}

// 排序类型
type SortType = 'default' | 'gi-asc' | 'gi-desc' | 'sugar-asc' | 'sugar-desc';

const { width: screenWidth } = Dimensions.get('window');

// 从JSON文件导入食物数据
const foodsData: FoodItem[] = foodsJson.foods;

export default function FoodsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [sortType, setSortType] = useState<SortType>('default');
  const [showGiDropdown, setShowGiDropdown] = useState(false);
  const [showSugarDropdown, setShowSugarDropdown] = useState(false);

  
  // 按分类筛选和排序
  const sortedFoods = useMemo(() => {
    let filteredFoods = foodsData.filter(food => 
      selectedCategory === '全部' || food.category === selectedCategory
    );

    switch (sortType) {
      case 'gi-asc':
        return filteredFoods.sort((a, b) => a.glycemicIndex - b.glycemicIndex);
      case 'gi-desc':
        return filteredFoods.sort((a, b) => b.glycemicIndex - a.glycemicIndex);
      case 'sugar-asc':
        return filteredFoods.sort((a, b) => a.sugarContent - b.sugarContent);
      case 'sugar-desc':
        return filteredFoods.sort((a, b) => b.sugarContent - a.sugarContent);
      default:
        return filteredFoods;
    }
  }, [selectedCategory, sortType]);

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

    const getGlycemicLevel = (gi: number) => {
      if (gi <= 55) return { level: '低升糖', color: '#4CAF50' };
      if (gi <= 70) return { level: '中升糖', color: '#FF9800' };
      return { level: '高升糖', color: '#F44336' };
    };

    const getSugarLevel = (sugar: number) => {
      if (sugar <= 5) return { level: '低糖', color: '#4CAF50', suitable: '适合' };
      if (sugar <= 15) return { level: '中糖', color: '#FF9800', suitable: '谨慎' };
      return { level: '高糖', color: '#F44336', suitable: '避免' };
    };

    const sugarLevel = getSugarLevel(item.sugarContent);
    const glycemicLevel = getGlycemicLevel(item.glycemicIndex);

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
          {/* 升糖指数显示 */}
          <View style={styles.giContainer}>
            <Text style={[styles.giLevel, { color: glycemicLevel.color }]}>
              {glycemicLevel.level}
            </Text>
          </View>
          {/* 含糖量显示 */}
          <View style={styles.sugarContainer}>
            <Text style={[styles.sugarLevelText, { color: sugarLevel.color }]}>
              {sugarLevel.level}
            </Text>
            <Text style={[styles.suitableText, { color: sugarLevel.color }]}>
              {sugarLevel.suitable}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const showInfoDialog = () => {
    Alert.alert(
      '数据说明',
      `含糖量：指每100克食物中糖分的含量（克）。数据来源于USDA营养数据库、中国食物成分表等权威营养数据库。

糖含量等级：
• ≤5g：低糖 - 适合糖不耐受和糖尿病人群
• 6-15g：中糖 - 谨慎食用，建议控制量
• >15g：高糖 - 避免食用

升糖指数(GI)：反映食物升高血糖的速度和能力。
• ≤55：低升糖 - 适合糖尿病人群
• 56-70：中升糖 - 谨慎食用
• >70：高升糖 - 避免食用

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

  const handleSortSelection = (type: SortType) => {
    setSortType(type);
    setShowGiDropdown(false);
    setShowSugarDropdown(false);
  };

  const closeDropdowns = () => {
    setShowGiDropdown(false);
    setShowSugarDropdown(false);
  };



  const getSortButtonText = () => {
    switch (sortType) {
      case 'gi-asc': return '升糖指数 ↑';
      case 'gi-desc': return '升糖指数 ↓';
      case 'sugar-asc': return '含糖量 ↑';
      case 'sugar-desc': return '含糖量 ↓';
      default: return '默认排序';
    }
  };

  const renderDropdownItem = (type: SortType, label: string, icon: string) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleSortSelection(type)}
    >
      <Ionicons name={icon as any} size={16} color="#666" />
      <Text style={styles.dropdownItemText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CustomTransition isVisible={true} animationType="slideUp" duration={400}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar 
            barStyle="dark-content" 
            backgroundColor="transparent" 
            translucent={Platform.OS === 'android'}
          />
          <ThemedView style={styles.container}>
            {/* 顶部导航栏 */}
            <Header
              title="食物库"
              showBackButton={true}
              rightComponent={
                <TouchableOpacity onPress={showInfoDialog} style={styles.infoButton}>
                  <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
              }
            />

          {/* 分类筛选 */}
          <View style={styles.categoryContainer}>
            <FlatList
              data={categories}
              renderItem={renderCategoryButton}
              keyExtractor={(item, index) => `category_${index}_${item}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          </View>

          {/* 排序Tab */}
          <View style={styles.sortContainer}>
            <Text style={styles.sortTitle}>排序方式：</Text>
            <View style={styles.sortTabs}>
              {/* 升糖指数排序Tab */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.sortTab,
                    (sortType === 'gi-asc' || sortType === 'gi-desc') && styles.sortTabActive
                  ]}
                  onPress={() => {
                    setShowSugarDropdown(false);
                    setShowGiDropdown(!showGiDropdown);
                  }}
                >
                  <Text style={[
                    styles.sortTabText,
                    (sortType === 'gi-asc' || sortType === 'gi-desc') && styles.sortTabTextActive
                  ]}>
                    升糖指数
                  </Text>
                  {(sortType === 'gi-asc' || sortType === 'gi-desc') && (
                    <Ionicons 
                      name={sortType === 'gi-asc' ? "arrow-up" : "arrow-down"} 
                      size={12} 
                      color="#ffffff" 
                      style={styles.sortDirectionIcon}
                    />
                  )}
                  <Ionicons 
                    name={showGiDropdown ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={(sortType === 'gi-asc' || sortType === 'gi-desc') ? '#ffffff' : '#666'} 
                  />
                </TouchableOpacity>
                
                {/* 升糖指数下拉菜单 */}
                {showGiDropdown && (
                  <View style={styles.dropdown}>
                    {renderDropdownItem('gi-asc', '从低到高', 'arrow-up')}
                    {renderDropdownItem('gi-desc', '从高到低', 'arrow-down')}
                  </View>
                )}
              </View>

              {/* 含糖量排序Tab */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.sortTab,
                    (sortType === 'sugar-asc' || sortType === 'sugar-desc') && styles.sortTabActive
                  ]}
                  onPress={() => {
                    setShowGiDropdown(false);
                    setShowSugarDropdown(!showSugarDropdown);
                  }}
                >
                  <Text style={[
                    styles.sortTabText,
                    (sortType === 'sugar-asc' || sortType === 'sugar-desc') && styles.sortTabTextActive
                  ]}>
                    含糖量
                  </Text>
                  {(sortType === 'sugar-asc' || sortType === 'sugar-desc') && (
                    <Ionicons 
                      name={sortType === 'sugar-asc' ? "arrow-up" : "arrow-down"} 
                      size={12} 
                      color="#ffffff" 
                      style={styles.sortDirectionIcon}
                    />
                  )}
                  <Ionicons 
                    name={showSugarDropdown ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={(sortType === 'sugar-asc' || sortType === 'sugar-desc') ? '#ffffff' : '#666'} 
                  />
                </TouchableOpacity>
                
                {/* 含糖量下拉菜单 */}
                {showSugarDropdown && (
                  <View style={styles.dropdown}>
                    {renderDropdownItem('sugar-asc', '从低到高', 'arrow-up')}
                    {renderDropdownItem('sugar-desc', '从高到低', 'arrow-down')}
                  </View>
                )}
              </View>
            </View>
            
            {/* 点击外部关闭下拉菜单的覆盖层 */}
            {(showGiDropdown || showSugarDropdown) && (
              <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={closeDropdowns}
              />
            )}
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
  </GestureHandlerRootView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'android' ? getStatusBarHeight() : 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
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
    paddingVertical: 10,
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
  sortContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sortTabs: {
    flexDirection: 'row',
    gap: 12,
  },
  tabContainer: {
    position: 'relative',
  },
  sortTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortTabActive: {
    backgroundColor: '#007AFF',
  },
  sortTabText: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  sortTabTextActive: {
    color: '#ffffff',
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    top: 35,
    left: -10,
    right: -10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  foodList: {
    padding: 16,
    paddingBottom: 100, // 为底部导航栏留出空间
  },
  foodItem: {
    flex: 1,
    margin: 6,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 140,
  },
  foodImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  foodImage: {
    fontSize: 24,
  },
  foodName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
  foodInfo: {
    alignItems: 'center',
    width: '100%',
  },
  giContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  giLabel: {
    fontSize: 10,
    color: '#666',
    marginRight: 2,
  },
  giValue: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 2,
  },
  giLevel: {
    fontSize: 10,
    fontWeight: '600',
  },
  sugarContainer: {
    alignItems: 'center',
  },
  sugarLevelText: {
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 2,
  },
  suitableText: {
    fontSize: 8,
  },
  sortDirectionIcon: {
    marginLeft: 2,
    marginRight: 4,
  },

}); 