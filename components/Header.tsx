import { useColorScheme } from '@/hooks/useColorScheme';
import { getStatusBarHeight } from '@/utils/androidSafeArea';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
  elevation?: boolean;
}

export default function Header({
  title,
  showBackButton = false,
  showMenuButton = false,
  onBackPress,
  onMenuPress,
  rightComponent,
  transparent = false,
  elevation = true,
}: HeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    }
  };

  return (
    <ThemedView
      style={[
        styles.header,
        transparent && styles.transparentHeader,
        elevation && styles.elevatedHeader,
        isDark && styles.darkHeader,
      ]}
    >
      {/* 状态栏占位 */}
      <View style={[styles.statusBarPlaceholder, { height: getStatusBarHeight() }]} />
      
      {/* 导航栏内容 */}
      <View style={styles.headerContent}>
        {/* 左侧按钮区域 */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={isDark ? '#ECEDEE' : '#11181C'}
              />
            </TouchableOpacity>
          )}
          {showMenuButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleMenuPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="menu"
                size={24}
                color={isDark ? '#ECEDEE' : '#11181C'}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* 标题区域 */}
        <View style={styles.titleSection}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {title}
          </ThemedText>
        </View>

        {/* 右侧按钮区域 */}
        <View style={styles.rightSection}>
          {rightComponent}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  transparentHeader: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  elevatedHeader: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkHeader: {
    backgroundColor: '#151718',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusBarPlaceholder: {
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
  },
  leftSection: {
    minWidth: 48,
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: 48,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '80%',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
