# SugarAssistant - AI聊天助手

一个类似ChatGPT的聊天对话应用，支持文字和语音聊天功能。

## 功能特性

### 🤖 AI聊天
- 智能对话：支持DeepSeek API和模拟AI回复
- 真实AI：集成DeepSeek API提供智能对话
- 环境变量：支持从.env文件读取API配置
- 自动降级：未配置API时自动使用模拟AI
- 动态打字延迟：根据回复长度模拟真实打字效果

### 🎤 语音功能
- 语音输入：支持语音录制和语音转文字
- 百度语音API：集成百度语音识别服务
- 自动回退：API不可用时自动使用模拟识别
- 语音转文本：实时将语音转换为文字
- 语音播放：AI回复支持语音播放功能
- 录音动画：录音时显示脉冲动画效果
- 识别状态：显示语音识别进度和结果

### 💬 聊天界面
- 微信风格UI：参考微信的聊天界面设计
- 消息气泡：用户和AI消息区分显示
- 实时滚动：自动滚动到最新消息
- 加载状态：显示AI思考中的状态
- 智能输入：支持语音/键盘切换

### 📱 移动端优化
- 键盘适配：自动调整输入框位置
- 触摸反馈：按钮点击提供触觉反馈
- 多行输入：支持长文本输入
- 权限管理：自动请求录音权限

## 技术栈

- **React Native** - 跨平台移动应用开发
- **Expo** - 开发工具和平台服务
- **TypeScript** - 类型安全的JavaScript
- **Expo AV** - 音频录制和播放
- **Expo Speech** - 文字转语音功能

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm start
```

3. 在设备上运行：
- iOS: 按 `i` 键
- Android: 按 `a` 键
- Web: 按 `w` 键

## 项目结构

```
SugarAssistant/
├── app/
│   ├── chat.tsx              # 聊天页面（主页面）
│   ├── _layout.tsx           # 应用布局
│   └── +not-found.tsx       # 404页面
├── components/
│   ├── ChatMessage.tsx       # 聊天消息组件
│   ├── WeChatInput.tsx       # 微信风格输入组件
│   ├── VoiceInput.tsx        # 语音输入组件
│   └── ...                   # 其他UI组件
├── utils/
│   ├── aiResponse.ts         # 模拟AI回复逻辑
│   ├── deepseekApi.ts        # DeepSeek API集成
│   ├── apiConfig.ts          # API配置管理
│   └── speechToText.ts       # 语音转文本功能
├── config/
│   └── env.ts               # 环境变量配置
└── ...
```

## 使用说明

### API配置

#### 环境变量配置
1. 在项目根目录创建`.env`文件
2. 添加以下内容：
   ```
   # DeepSeek API配置
   DEEPSEEK_API_KEY=your_api_key_here
   DEEPSEEK_MODEL=deepseek-chat
   DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
   
   # 百度语音API配置
   BAIDU_APP_ID=your_baidu_app_id_here
   BAIDU_API_KEY=your_baidu_api_key_here
   BAIDU_SECRET_KEY=your_baidu_secret_key_here
   ```
3. 重启开发服务器：`npm start -- --clear`
4. 系统会自动读取环境变量

**注意**：
- 确保.env文件在项目根目录
- 重启开发服务器后环境变量才会生效
- 如果未配置环境变量，系统会自动使用模拟AI
- 百度语音API需要从[百度AI开放平台](https://ai.baidu.com/tech/speech)获取密钥

### 文字聊天
1. 在输入框中输入消息
2. 点击发送按钮或按回车键发送
3. AI会根据消息内容智能回复（DeepSeek API或模拟AI）
4. 支持对话上下文，保持连贯性

### 语音聊天
1. 点击语音按钮切换到语音模式
2. 长按"按住说话"按钮开始录音
3. 松开按钮停止录音，系统自动识别语音并转换为文字
4. 识别完成后自动发送文字消息

### 语音播放
- 点击AI消息右上角的音量图标
- AI回复会以语音形式播放

## 自定义配置

### AI回复规则
在 `utils/aiResponse.ts` 中可以：
- 添加新的关键词和回复类型
- 修改回复内容
- 调整打字延迟算法

### 界面样式
在 `components/` 目录下可以：
- 修改消息气泡样式
- 调整语音按钮外观
- 自定义加载动画

## 权限说明

应用需要以下权限：
- **麦克风权限**：用于语音录制功能
- **音频播放权限**：用于语音播放功能

## 百度语音API集成

### 功能特性
- ✅ 实时语音录制和识别
- ✅ 百度语音API集成
- ✅ 自动回退到模拟识别
- ✅ 语音识别状态显示
- ✅ 错误处理和重试机制

### 配置步骤
1. 访问[百度AI开放平台](https://ai.baidu.com/)
2. 注册并创建应用，选择"语音技术"
3. 获取App ID、API Key和Secret Key
4. 在`.env`文件中配置密钥
5. 重启应用即可使用

### 使用说明
- 点击语音按钮切换到语音模式
- 长按"按住说话"开始录音
- 松开按钮停止录音并识别
- 识别结果自动发送为文字消息

### 技术实现
- `utils/baiduSpeechApi.ts`: 百度语音API实现
- `utils/speechToText.ts`: 语音转文字主逻辑
- `components/VoiceInput.tsx`: 语音输入组件
- 支持Token缓存和错误重试

## 开发计划

- [x] 集成真实的AI API（DeepSeek）- 已完成
- [x] 添加语音转文字功能（百度语音API）- 已完成
- [ ] 支持图片和文件发送
- [x] 添加聊天历史保存 - 已完成
- [ ] 支持多语言切换

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License
