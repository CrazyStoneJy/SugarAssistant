# Markdown 消息渲染功能

## 功能概述

实现了对DeepSeek API返回的markdown格式消息的渲染支持，使用 `react-native-marked` 库让AI回复能够正确显示各种markdown格式，包括标题、代码块、列表等。

## 核心功能

### 1. Markdown渲染支持
- ✅ 支持标题 (H1, H2, H3)
- ✅ 支持段落和文本格式
- ✅ 支持粗体和斜体
- ✅ 支持代码块和内联代码
- ✅ 支持引用块
- ✅ 支持列表 (有序和无序)
- ✅ 支持链接
- ✅ 支持表格
- ✅ 支持分割线

### 2. 智能渲染逻辑
- ✅ 用户消息使用纯文本显示
- ✅ AI消息使用markdown格式渲染
- ✅ 保持原有的语音播放功能
- ✅ 保持原有的时间戳显示

### 3. 性能优化
- ✅ 使用 `react-native-marked` 提供更好的性能
- ✅ 配置 `flatListProps` 优化滚动性能
- ✅ 禁用不必要的滚动功能

## 技术实现

### 依赖安装
```bash
npm install react-native-marked
```

### MarkdownText组件 (`components/MarkdownText.tsx`)

#### 核心逻辑
```typescript
export default function MarkdownText({ text, isUser }: MarkdownTextProps) {
  // 用户消息使用纯文本
  if (isUser) {
    return (
      <ThemedText style={[styles.text, styles.userText]}>
        {text}
      </ThemedText>
    );
  }

  // AI消息使用markdown渲染
  return (
    <Marked
      value={text}
      styles={markdownStyles}
      flatListProps={{
        scrollEnabled: false,
        showsVerticalScrollIndicator: false,
      }}
    />
  );
}
```

#### 样式配置
```typescript
const markdownStyles = StyleSheet.create({
  paragraph: {
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 4,
    color: '#000000',
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#000000',
  },
  code_block: {
    backgroundColor: '#F1F3F4',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  // ... 更多样式配置
});
```

### ChatMessage组件集成

#### 更新内容
- 导入MarkdownText组件
- 替换原有的ThemedText显示
- 移除不再需要的文本样式
- 保持语音播放和时间戳功能

```typescript
<View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
  <MarkdownText text={text} isUser={isUser} />
  {!isUser && (
    <TouchableOpacity style={styles.speakButton} onPress={handleSpeak}>
      <Ionicons name="volume-high" size={16} color="#007AFF" />
    </TouchableOpacity>
  )}
</View>
```

## 支持的Markdown格式

### 文本格式
- **粗体文本** - 使用 `**文本**`
- *斜体文本* - 使用 `*文本*`
- `内联代码` - 使用 `` `代码` ``

### 标题
```markdown
# 一级标题
## 二级标题
### 三级标题
```

### 代码块
```javascript
// 代码块示例
function hello() {
  console.log("Hello World!");
}
```

### 引用
> 这是一个引用块
> 可以包含多行内容

### 列表
- 无序列表项1
- 无序列表项2

1. 有序列表项1
2. 有序列表项2

### 链接
[链接文本](https://example.com)

### 表格
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |

### 分割线
---

## 样式主题

### 颜色方案
- 主文本: `#000000`
- 链接: `#007AFF`
- 代码背景: `#F6F8FA`
- 引用背景: `#F8F9FA`
- 表格边框: `#E1E4E8`

### 字体大小和间距
- 正文: 16px，行高24px，垂直间距8px
- 一级标题: 22px，字重700，字间距-0.5
- 二级标题: 20px，字重600，字间距-0.3
- 三级标题: 18px，字重600，字间距-0.2
- 代码: 14px，行高20px

### 间距配置
- 段落间距: 8px
- 标题间距: 12-16px
- 代码块内边距: 16px
- 引用块内边距: 16px
- 列表左边距: 8px
- 表格内边距: 12px
- 分割线间距: 20px

### 设计特点
- **现代边框设计**: 代码块和引用块使用边框
- **圆角设计**: 引用块右侧圆角，分割线圆角
- **层次优化**: 标题使用不同字重和字间距
- **间距优化**: 更舒适的阅读间距
- **视觉层次**: 清晰的标题和内容区分

## 性能优化

### 渲染优化
- 用户消息使用轻量级文本组件
- AI消息按需渲染markdown
- 避免不必要的重新渲染
- 使用 `react-native-marked` 提供更好的性能

### 滚动优化
- 配置 `flatListProps` 禁用滚动
- 禁用垂直滚动指示器
- 优化长文本的渲染性能

### 内存优化
- 合理的样式配置
- 避免样式对象重复创建
- 组件生命周期优化

## react-native-marked 优势

### 性能优势
- 更快的渲染速度
- 更小的内存占用
- 更好的滚动性能

### 功能优势
- 更灵活的样式配置
- 更好的TypeScript支持
- 更活跃的维护和更新
- 更小的包体积

### 开发体验
- 更好的错误处理
- 更清晰的API设计
- 更完善的文档

## 测试建议

### 功能测试
1. 测试各种markdown格式的渲染
2. 验证用户消息和AI消息的显示差异
3. 检查语音播放功能是否正常
4. 测试长文本的渲染性能

### 样式测试
1. 验证不同设备的显示效果
2. 检查深色模式的适配
3. 测试不同屏幕尺寸的布局
4. 验证字体和颜色的正确性

### 性能测试
1. 大量markdown内容的渲染性能
2. 内存使用情况
3. 滚动时的流畅度
4. 应用启动时间

## 注意事项

1. **性能考虑**: 复杂的markdown可能影响渲染性能
2. **内存使用**: 大量markdown内容可能占用较多内存
3. **样式一致性**: 确保markdown样式与应用整体风格一致
4. **可访问性**: 考虑屏幕阅读器的支持
5. **国际化**: 支持不同语言的markdown内容
6. **滚动配置**: 根据需要调整 `flatListProps` 配置 