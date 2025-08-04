import { Dimensions, Platform, StatusBar } from 'react-native';

/**
 * 获取Android设备的状态栏高度
 */
export const getStatusBarHeight = (): number => {
  if (Platform.OS === 'android') {
    return StatusBar.currentHeight || 0;
  }
  return 0;
};

/**
 * 获取设备的安全区域底部高度
 */
export const getSafeAreaBottomHeight = (): number => {
  if (Platform.OS === 'android') {
    // Android设备使用更小的底部padding，让输入框更贴近底部
    return Math.max(8, getStatusBarHeight() * 0.3);
  }
  return 20; // iOS默认值
};

/**
 * 获取输入框的底部padding
 */
export const getInputBottomPadding = (): number => {
  if (Platform.OS === 'android') {
    // 输入框使用最小的底部padding，让输入框贴近底部
    return 2;
  }
  return 20; // iOS默认值
};

/**
 * 获取输入框容器的底部padding
 */
export const getInputContainerBottomPadding = (): number => {
  if (Platform.OS === 'android') {
    // 输入框容器使用更小的底部padding
    return 0;
  }
  return 20; // iOS默认值
};

/**
 * 获取键盘避免视图的垂直偏移
 */
export const getKeyboardVerticalOffset = (): number => {
  if (Platform.OS === 'ios') {
    return 0;
  }
  return getStatusBarHeight();
};

/**
 * 获取设备屏幕高度
 */
export const getScreenHeight = (): number => {
  return Dimensions.get('window').height;
};

/**
 * 获取设备屏幕宽度
 */
export const getScreenWidth = (): number => {
  return Dimensions.get('window').width;
};

/**
 * 检查是否为刘海屏或打孔屏设备
 */
export const isNotchDevice = (): boolean => {
  const { height, width } = Dimensions.get('window');
  const aspectRatio = height / width;
  
  // 高宽比大于2.1的设备可能是刘海屏
  return aspectRatio > 2.1;
}; 