# 转场动画使用指南

## 概述

本项目提供了两个转场动画组件：
- `CustomTransition`: 基础转场动画组件
- `AdvancedTransition`: 高级转场动画组件

## CustomTransition 组件

### 基本用法

```tsx
import CustomTransition from '@/components/CustomTransition';

<CustomTransition isVisible={true} animationType="slide" duration={300}>
  <YourContent />
</CustomTransition>
```

### 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | ReactNode | - | 要应用动画的内容 |
| `isVisible` | boolean | - | 控制动画的显示/隐藏 |
| `animationType` | string | 'slide' | 动画类型 |
| `duration` | number | 300 | 动画持续时间(毫秒) |
| `delay` | number | 0 | 动画延迟时间(毫秒) |
| `direction` | string | 'right' | 动画方向 |
| `easing` | string | 'ease' | 缓动函数 |
| `onAnimationComplete` | function | - | 动画完成回调 |
| `enableGesture` | boolean | false | 是否启用手势支持 |
| `gestureDirection` | string | 'horizontal' | 手势方向 |

### 支持的动画类型

1. **slide** - 滑动动画
   - 支持方向：left, right, up, down
   - 适合页面切换

2. **fade** - 淡入淡出动画
   - 适合内容显示/隐藏

3. **scale** - 缩放动画
   - 适合弹窗、模态框

4. **slideUp** - 向上滑动
   - 适合底部弹窗

5. **slideDown** - 向下滑动
   - 适合顶部下拉

6. **zoom** - 放大动画
   - 适合图片预览

7. **flip** - 翻转动画
   - 适合卡片翻转

8. **bounce** - 弹跳动画
   - 适合按钮点击反馈

### 支持的缓动函数

- **linear** - 线性动画
- **ease** - 缓动动画
- **bounce** - 弹跳效果
- **elastic** - 弹性效果

## AdvancedTransition 组件

`AdvancedTransition` 组件是 `CustomTransition` 的扩展版本，提供了更多高级功能。

### 基本用法

```tsx
import AdvancedTransition from '@/components/AdvancedTransition';

<AdvancedTransition 
  isVisible={true} 
  animationType="slide" 
  direction="right"
  easing="bounce"
  duration={400}
  onAnimationComplete={() => console.log('动画完成')}
>
  <YourContent />
</AdvancedTransition>
```

## 实际应用示例

### 1. 页面转场动画

```tsx
// 在页面组件中使用
export default function MyScreen() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <CustomTransition 
      isVisible={isVisible} 
      animationType="slide" 
      direction="right"
      duration={350}
    >
      <SafeAreaView style={styles.container}>
        {/* 页面内容 */}
      </SafeAreaView>
    </CustomTransition>
  );
}
```

### 2. 模态框动画

```tsx
// 模态框组件
export default function Modal({ visible, onClose }) {
  return (
    <CustomTransition 
      isVisible={visible} 
      animationType="scale" 
      duration={300}
      onAnimationComplete={onClose}
    >
      <View style={styles.modal}>
        {/* 模态框内容 */}
      </View>
    </CustomTransition>
  );
}
```

### 3. 列表项动画

```tsx
// 列表项组件
export default function ListItem({ item, index }) {
  return (
    <CustomTransition 
      isVisible={true} 
      animationType="slideUp" 
      duration={300}
      delay={index * 100} // 错开动画时间
    >
      <View style={styles.listItem}>
        {/* 列表项内容 */}
      </View>
    </CustomTransition>
  );
}
```

## 手势支持

转场动画组件支持手势交互：

```tsx
<CustomTransition 
  isVisible={isVisible}
  animationType="slide"
  enableGesture={true}
  gestureDirection="horizontal"
>
  <YourContent />
</CustomTransition>
```

## 性能优化建议

1. **使用 useNativeDriver**: 所有动画都启用了原生驱动以提高性能

2. **合理设置持续时间**: 建议动画持续时间在200-500ms之间

3. **避免过度使用**: 不要在所有元素上都使用动画，会影响性能

4. **使用条件渲染**: 对于不经常显示的内容，使用条件渲染而不是动画隐藏

## 演示页面

项目包含了一个转场动画演示页面 (`/transition-demo`)，可以：
- 实时预览不同的动画效果
- 调整动画参数
- 测试各种动画组合

访问方式：在聊天页面点击右上角的播放按钮。

## 注意事项

1. **Android兼容性**: 所有动画都经过Android测试，确保兼容性

2. **性能考虑**: 复杂的动画可能影响性能，建议在低端设备上测试

3. **手势冲突**: 启用手势支持时，注意与其他手势的冲突

4. **内存管理**: 动画完成后会自动清理资源

## 故障排除

### 常见问题

1. **动画不显示**
   - 检查 `isVisible` 属性是否正确设置
   - 确认组件是否正确导入

2. **动画卡顿**
   - 检查是否启用了 `useNativeDriver`
   - 减少动画持续时间
   - 检查设备性能

3. **手势不响应**
   - 确认 `enableGesture` 已设置为 true
   - 检查手势方向设置

4. **动画方向错误**
   - 检查 `direction` 属性设置
   - 确认动画类型支持该方向

### 调试技巧

1. 使用 `onAnimationComplete` 回调来确认动画执行
2. 在开发模式下查看动画帧率
3. 使用 React Native Debugger 调试动画状态 