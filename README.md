# SugarAssistant

一个专为糖尿病患者设计的智能助手应用，提供血糖管理、饮食建议和健康监测功能。

## 功能特性

- 🤖 **AI智能对话** - 基于DeepSeek的智能问答系统
- 🎤 **语音识别** - 支持语音输入，方便快捷
- 🍎 **食物数据库** - 详细的升糖指数和含糖量信息
- 📊 **健康监测** - 血糖记录和趋势分析
- 💡 **个性化建议** - 基于用户数据的健康建议

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制 `env.example` 文件为 `.env` 并配置必要的API密钥：

```bash
cp env.example .env
```

#### 必需配置

**DeepSeek API (必需)**
- 获取API密钥：https://platform.deepseek.com/
- 配置 `DEEPSEEK_API_KEY`

**百度语音API (可选，用于语音识别)**
- 获取API密钥：https://ai.baidu.com/tech/speech
- 配置 `BAIDU_APP_ID`、`BAIDU_API_KEY`、`BAIDU_SECRET_KEY`

#### 配置示例

```env
# DeepSeek API Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# Baidu Speech API Configuration (可选)
BAIDU_APP_ID=your_baidu_app_id_here
BAIDU_API_KEY=your_baidu_api_key_here
BAIDU_SECRET_KEY=your_baidu_secret_key_here

# App Configuration
APP_NAME=SugarAssistant
APP_VERSION=1.0.0
```

### 3. 语音识别配置

#### 百度语音API设置

1. 访问 [百度AI开放平台](https://ai.baidu.com/tech/speech)
2. 注册账号并创建应用
3. 获取以下信息：
   - **App ID**: 应用ID
   - **API Key**: 接口密钥
   - **Secret Key**: 安全密钥
4. 在 `.env` 文件中配置这些信息

#### 语音识别功能

- **有百度API配置**: 使用真实的语音识别服务
- **无百度API配置**: 使用模拟识别服务（演示功能）

### 4. 运行应用

```bash
# 开发模式
npm start

# iOS模拟器
npm run ios

# Android模拟器
npm run android
```

## 语音识别故障排除

### 常见问题

1. **权限问题**
   - 确保应用有麦克风权限
   - iOS: 设置 > 隐私与安全 > 麦克风
   - Android: 设置 > 应用 > 权限

2. **网络问题**
   - 检查网络连接
   - 确保可以访问百度API

3. **配置问题**
   - 检查 `.env` 文件中的百度API配置
   - 确保API密钥正确且有效

4. **录音问题**
   - 确保录音时间在1-30秒之间
   - 在安静环境中录音
   - 说话清晰，音量适中

### 调试信息

应用会在控制台输出详细的调试信息：

```
🎤 语音识别服务状态: { baiduAvailable: true, fallbackAvailable: true, primaryService: 'baidu' }
🔧 语音识别配置信息: { isConfigured: true, hasAppId: true, hasApiKey: true, hasSecretKey: true }
🎤 开始录音...
✅ 音频预处理完成
🔄 开始语音识别...
✅ 语音识别成功: 你好，今天天气怎么样？
```

## 开发指南

### 项目结构

```
SugarAssistant/
├── app/                 # 页面组件
├── components/          # 可复用组件
├── utils/              # 工具函数
├── config/             # 配置文件
├── data/               # 静态数据
└── types/              # TypeScript类型定义
```

### 主要技术栈

- **React Native** - 跨平台移动应用框架
- **Expo** - 开发工具和平台服务
- **TypeScript** - 类型安全的JavaScript
- **DeepSeek API** - AI对话服务
- **百度语音API** - 语音识别服务

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如果您遇到问题或有建议，请：

1. 查看 [常见问题](#语音识别故障排除)
2. 检查控制台日志获取详细错误信息
3. 提交 Issue 描述问题

---

**注意**: 本应用仅用于健康管理和教育目的，不能替代专业医疗建议。如有健康问题，请咨询医生。
