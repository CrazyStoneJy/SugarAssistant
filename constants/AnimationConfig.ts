/**
 * 动画配置文件
 * 统一管理所有动画的参数，确保一致性和可维护性
 */

// 快速动画配置
export const FAST_ANIMATION = {
  // Spring 动画配置
  SPRING: {
    tension: 300,                    // 高张力，快速响应
    friction: 8,                     // 适中的摩擦力
    velocity: 1.0,                   // 高初始速度
    restDisplacementThreshold: 0.005, // 精确的停止阈值
    restSpeedThreshold: 0.005,       // 精确的停止速度阈值
  },
  
  // 快速 Spring 动画配置（用于侧边菜单等）
  FAST_SPRING: {
    tension: 200,                    // 中等张力
    friction: 6,                     // 低摩擦力
    velocity: 0.8,                   // 中等初始速度
    restDisplacementThreshold: 0.01, // 精确的停止阈值
    restSpeedThreshold: 0.01,        // 精确的停止速度阈值
  },
  
  // Timing 动画配置
  TIMING: {
    duration: 200,                   // 快速动画时长
    delay: 0,                        // 无延迟
    easing: 'ease',                  // 线性缓动
  },
  
  // 脉冲动画配置
  PULSE: {
    duration: 600,                   // 快速脉冲
    easing: 'ease',                  // 线性缓动
  },
};

// 中等速度动画配置
export const MEDIUM_ANIMATION = {
  SPRING: {
    tension: 150,
    friction: 10,
    velocity: 0.6,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  
  TIMING: {
    duration: 300,
    delay: 0,
    easing: 'ease',
  },
};

// 慢速动画配置（用于特殊效果）
export const SLOW_ANIMATION = {
  SPRING: {
    tension: 80,
    friction: 12,
    velocity: 0.4,
    restDisplacementThreshold: 0.02,
    restSpeedThreshold: 0.02,
  },
  
  TIMING: {
    duration: 500,
    delay: 0,
    easing: 'ease',
  },
};

// 动画类型配置
export const ANIMATION_TYPES = {
  SLIDE: 'slide',
  FADE: 'fade',
  SCALE: 'scale',
  SLIDE_UP: 'slideUp',
  SLIDE_DOWN: 'slideDown',
  ZOOM: 'zoom',
  ROTATE: 'rotate',
  BOUNCE: 'bounce',
};

// 动画方向配置
export const ANIMATION_DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down',
};

// 缓动函数配置
export const EASING_FUNCTIONS = {
  LINEAR: 'linear',
  EASE: 'ease',
  BOUNCE: 'bounce',
  ELASTIC: 'elastic',
};

// 默认动画配置
export const DEFAULT_ANIMATION = {
  type: ANIMATION_TYPES.FADE,
  direction: ANIMATION_DIRECTIONS.UP,
  duration: 200,
  delay: 0,
  easing: EASING_FUNCTIONS.EASE,
  useNativeDriver: true,
};

// 侧边菜单动画配置 - 无bounce效果，平滑滑动
export const SIDE_MENU_ANIMATION = {
  OPEN: {
    tension: 150,                    // 适中的张力，避免过快的弹出
    friction: 12,                    // 较高的摩擦力，减少bounce
    velocity: 0.6,                   // 适中的初始速度
    restDisplacementThreshold: 0.01, // 精确的停止阈值
    restSpeedThreshold: 0.01,        // 精确的停止速度阈值
    toValue: 0,
  },
  CLOSE: {
    tension: 150,                    // 适中的张力，避免过快的关闭
    friction: 12,                    // 较高的摩擦力，减少bounce
    velocity: 0.6,                   // 适中的初始速度
    restDisplacementThreshold: 0.01, // 精确的停止阈值
    restSpeedThreshold: 0.01,        // 精确的停止速度阈值
    toValue: -1, // 将在使用时乘以屏幕宽度
  },
};

// 输入框动画配置
export const INPUT_ANIMATION = {
  SLIDE: {
    ...FAST_ANIMATION.SPRING,
    toValue: 1,
  },
  RESET: {
    ...FAST_ANIMATION.SPRING,
    toValue: 0,
  },
};

// 页面转场动画配置
export const PAGE_TRANSITION_ANIMATION = {
  FAST: {
    ...FAST_ANIMATION.SPRING,
    toValue: 1,
  },
  MEDIUM: {
    ...MEDIUM_ANIMATION.SPRING,
    toValue: 1,
  },
  SLOW: {
    ...SLOW_ANIMATION.SPRING,
    toValue: 1,
  },
};
