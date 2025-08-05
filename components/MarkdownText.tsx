import React from 'react';
import { StyleSheet } from 'react-native';
import Marked, { MarkedStyles } from 'react-native-marked';
import { ThemedText } from './ThemedText';

interface MarkdownTextProps {
  text: string;
  isUser: boolean;
}

export default function MarkdownText({ text, isUser }: MarkdownTextProps) {
  // 如果是用户消息，直接显示纯文本
  if (isUser) {
    return (
      <ThemedText style={[styles.text, styles.userText]}>
        {text}
      </ThemedText>
    );
  }

  // 如果是AI消息，渲染markdown
  return (
    <Marked
      value={text}
      styles={markdownStyles as MarkedStyles}
      theme={{
        colors: {
          text: '#000000',
          link: '#007AFF',
          background: 'transparent',
          code: '#F1F3F4',
          border: '#E5E5EA',
        },
      }}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: '#FFFFFF',
  },
});

// 重新设计的Markdown样式配置
const markdownStyles = StyleSheet.create({
  // 段落样式 - 更舒适的间距
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
  },
  
  // 标题样式 - 更清晰的层次
  heading1: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
    color: '#000000',
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 10,
    color: '#000000',
    letterSpacing: -0.3,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#000000',
    letterSpacing: -0.2,
  },
  
  // 引用块样式 - 更优雅的设计
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    paddingLeft: 16,
    marginVertical: 12,
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingRight: 16,
    borderRadius: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  
  // 代码块样式 - 更现代的设计
  code_block: {
    backgroundColor: '#F6F8FA',
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: '#E1E4E8',
  },
  
  // 内联代码样式
  code_inline: {
    backgroundColor: '#F6F8FA',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E1E4E8',
  },
  
  // 列表样式 - 更好的间距
  list_item: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 4,
    color: '#000000',
    paddingLeft: 4,
  },
  bullet_list: {
    marginVertical: 8,
    paddingLeft: 8,
  },
  ordered_list: {
    marginVertical: 8,
    paddingLeft: 8,
  },
  
  // 文本格式样式
  strong: {
    fontWeight: '700',
    color: '#000000',
  },
  em: {
    fontStyle: 'italic',
    color: '#000000',
  },
  
  // 链接样式
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  
  // 分割线样式
  hr: {
    backgroundColor: '#E1E4E8',
    height: 1,
    marginVertical: 20,
    borderRadius: 1,
  },
  
  // 表格样式 - 更现代的设计
  table: {
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: 8,
    marginVertical: 12,
    overflow: 'hidden',
  },
  thead: {
    backgroundColor: '#F6F8FA',
  },
  th: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  td: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    fontSize: 14,
  },
}); 