interface AIResponse {
  text: string;
  type: 'greeting' | 'question' | 'answer' | 'joke' | 'help';
}

const responses = {
  greeting: [
    '你好！很高兴见到你！',
    '嗨！有什么可以帮助你的吗？',
    '欢迎！我是你的AI助手，随时为你服务。',
  ],
  question: [
    '这是一个很好的问题！让我想想...',
    '我理解你的疑问，让我来帮你解答。',
    '这个问题很有趣，让我为你详细说明。',
  ],
  answer: [
    '根据我的理解，这个问题的答案是...',
    '我可以为你提供一些建议...',
    '让我为你分析一下这个问题...',
  ],
  joke: [
    '哈哈，你真有幽默感！',
    '这个笑话很有趣！',
    '你让我笑了！',
  ],
  help: [
    '我很乐意帮助你！',
    '有什么我可以为你做的吗？',
    '请告诉我你需要什么帮助。',
  ],
};

const keywords = {
  greeting: ['你好', '嗨', 'hello', 'hi', '早上好', '晚上好', '下午好'],
  question: ['什么', '怎么', '为什么', '如何', '?', '？'],
  joke: ['笑话', '搞笑', '幽默', '笑', '哈哈'],
  help: ['帮助', '帮忙', '求助', '支持'],
};

export function generateAIResponse(userMessage: string): AIResponse {
  const message = userMessage.toLowerCase();
  
  // 检查关键词
  for (const [type, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (message.includes(word)) {
        const responsesList = responses[type as keyof typeof responses];
        const randomResponse = responsesList[Math.floor(Math.random() * responsesList.length)];
        return { text: randomResponse, type: type as AIResponse['type'] };
      }
    }
  }
  
  // 默认回复
  const defaultResponses = [
    '我收到了你的消息，让我想想怎么回复你...',
    '这是一个很有趣的话题！',
    '谢谢你的分享，我学到了新东西。',
    '我理解你的想法，让我为你提供一些建议。',
  ];
  
  const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  return { text: randomResponse, type: 'answer' };
}

export function getTypingDelay(messageLength: number): number {
  // 根据消息长度计算打字延迟
  const baseDelay = 1000;
  const perCharDelay = 50;
  return baseDelay + (messageLength * perCharDelay);
} 