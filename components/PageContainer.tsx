import { SIDE_MENU_ANIMATION } from '@/constants/AnimationConfig';
import { getStatusBarHeight } from '@/utils/androidSafeArea';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Header from './Header';
import SideMenu from './SideMenu';

const { width: screenWidth } = Dimensions.get('window');

interface PageContainerProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  transparentHeader?: boolean;
  headerElevation?: boolean;
  backgroundColor?: string;
  safeAreaTop?: boolean;
  safeAreaBottom?: boolean;
  addHeaderSpacing?: boolean;
}

export default function PageContainer({
  children,
  title,
  showBackButton = false,
  showMenuButton = false,
  onBackPress,
  rightComponent,
  transparentHeader = false,
  headerElevation = true,
  backgroundColor,
  safeAreaTop = true,
  safeAreaBottom = true,
  addHeaderSpacing = true,
}: PageContainerProps) {
  const [isSideMenuVisible, setIsSideMenuVisible] = useState(false);
  
  // 使用useMemo来延迟创建Animated.Value，避免在渲染过程中创建
  const sideMenuTranslateX = useMemo(() => new Animated.Value(-screenWidth * 0.8), []);

  const handleMenuPress = useCallback(() => {
    setIsSideMenuVisible(true);
    // 使用配置化的快速动画
    Animated.spring(sideMenuTranslateX, {
      ...SIDE_MENU_ANIMATION.OPEN,
      useNativeDriver: true,
    }).start();
  }, [sideMenuTranslateX]);

  const handleCloseSideMenu = useCallback(() => {
    // 使用配置化的快速动画
    Animated.spring(sideMenuTranslateX, {
      ...SIDE_MENU_ANIMATION.CLOSE,
      toValue: -screenWidth * 0.8, // 覆盖配置中的 toValue
      useNativeDriver: true,
    }).start(() => {
      setIsSideMenuVisible(false);
    });
  }, [sideMenuTranslateX]);

  // 使用useMemo来缓存各种高度计算，避免在渲染过程中重复计算
  const headerHeight = useMemo(() => getStatusBarHeight() + 56, []);
  const statusBarHeight = useMemo(() => getStatusBarHeight(), []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      
      {/* 导航栏 */}
      <Header
        title={title}
        showBackButton={showBackButton}
        showMenuButton={showMenuButton}
        onBackPress={onBackPress}
        onMenuPress={handleMenuPress}
        rightComponent={rightComponent}
        transparent={transparentHeader}
        elevation={headerElevation}
      />

      {/* 页面内容 */}
      <View style={[styles.content, { 
        paddingTop: addHeaderSpacing ? headerHeight : 0, 
        backgroundColor 
      }]}>
        {safeAreaTop && addHeaderSpacing && <View style={[styles.safeAreaTop, { height: statusBarHeight }]} />}
        
        <View style={styles.mainContent}>
          {children}
        </View>
        
        {safeAreaBottom && <View style={styles.safeAreaBottom} />}
      </View>

      {/* 侧边菜单 */}
      <SideMenu
        isVisible={isSideMenuVisible}
        onClose={handleCloseSideMenu}
        translateX={sideMenuTranslateX}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  safeAreaTop: {
    backgroundColor: 'transparent',
  },
  mainContent: {
    flex: 1,
  },
  safeAreaBottom: {
    height: Platform.OS === 'ios' ? 34 : 0,
    backgroundColor: 'transparent',
  },
});
