import { getStatusBarHeight } from '@/utils/androidSafeArea';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { ThemedText } from './ThemedText';

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
  translateX: Animated.Value;
}

const { width: screenWidth } = Dimensions.get('window');
const MENU_WIDTH = screenWidth * 0.8;

const menuItems = [
  {
    id: 'sessions',
    title: '聊天记录',
    icon: 'chatbubbles-outline',
    route: '/sessions',
    description: '管理聊天会话历史',
  },
  {
    id: 'ocr-data',
    title: 'OCR记录',
    icon: 'document-text-outline',
    route: '/ocr-data',
    description: '查看OCR识别历史记录',
  },
  {
    id: 'version',
    title: '版本信息',
    icon: 'information-circle-outline',
    route: '/version',
    description: '查看应用版本和更新信息',
  },
];

export default function SideMenu({ isVisible, onClose, translateX }: SideMenuProps) {
  const handleMenuItemPress = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuItemPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemIcon}>
        <Ionicons name={item.icon as any} size={24} color="#007AFF" />
      </View>
      <View style={styles.menuItemContent}>
        <ThemedText style={styles.menuItemTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.menuItemDescription}>{item.description}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  if (!isVisible) return null;

  return (
    <>
      {/* 透明点击区域 - 用于检测点击关闭 */}
      <TouchableOpacity
        style={styles.transparentOverlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* 侧边菜单 */}
      <Animated.View
        style={[
          styles.sideMenu,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {/* 菜单头部 */}
        <View style={styles.menuHeader}>
          <View style={styles.menuHeaderContent}>
            <View style={styles.appIcon}>
              <Ionicons name="medical" size={32} color="#007AFF" />
            </View>
            <View style={styles.appInfo}>
              <ThemedText style={styles.appTitle}>控糖小助手</ThemedText>
              <ThemedText style={styles.appSubtitle}>SugarAssistant</ThemedText>
            </View>
          </View>
        </View>

        {/* 菜单项列表 */}
        <View style={styles.menuItems}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* 菜单底部 */}
        <View style={styles.menuFooter}>
          <ThemedText style={styles.menuFooterText}>
            版本 1.0.0
          </ThemedText>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  transparentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'transparent',
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? getStatusBarHeight() + 20 : 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 120,
  },
  menuHeaderContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appInfo: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  menuItems: {
    flex: 1,
    paddingTop: 10,
    justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
    width: '90%',
    justifyContent: 'flex-start',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  menuFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuFooterText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
