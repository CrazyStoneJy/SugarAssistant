# EAS (Expo Application Services) 集成指南

## 概述

EAS是Expo的构建和部署服务，允许你在云端构建原生应用，无需本地配置Xcode或Android Studio。

## 已完成的配置

### 1. 安装EAS CLI
```bash
npm install -g eas-cli
```

### 2. 项目配置
- ✅ 已生成 `eas.json` 配置文件
- ✅ 已更新 `app.json` 添加必要的配置
- ✅ 已添加构建脚本到 `package.json`

### 3. 项目信息
- **项目ID**: `3e83a019-4543-4780-b5d1-2dc655b9f17e`
- **Bundle ID**: `com.crazystonejy.sugarassistant`
- **Package Name**: `com.crazystonejy.sugarassistant`

## 构建配置

### eas.json 配置说明

```json
{
  "cli": {
    "version": ">= 16.17.4",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 构建配置说明

1. **development** - 开发版本
   - 包含开发客户端
   - 内部分发
   - 用于调试和测试

2. **preview** - 预览版本
   - 内部分发
   - 用于测试和演示

3. **production** - 生产版本
   - 自动版本号递增
   - 用于应用商店发布

## 使用方法

### 1. 登录EAS账户
```bash
eas login
```

### 2. 构建应用

#### 构建Android版本
```bash
# 开发版本
eas build --platform android --profile development

# 预览版本
npm run build:preview

# 生产版本
npm run build:production
```

#### 构建iOS版本
```bash
# 开发版本
eas build --platform ios --profile development

# 预览版本
npm run build:preview

# 生产版本
npm run build:production
```

#### 构建所有平台
```bash
npm run build:all
```

### 3. 提交到应用商店

#### 提交Android版本
```bash
npm run submit:android
```

#### 提交iOS版本
```bash
npm run submit:ios
```

### 4. 更新应用
```bash
npm run update
```

## 构建脚本说明

| 脚本 | 命令 | 说明 |
|------|------|------|
| `build:android` | `eas build --platform android` | 构建Android版本 |
| `build:ios` | `eas build --platform ios` | 构建iOS版本 |
| `build:all` | `eas build --platform all` | 构建所有平台 |
| `build:preview` | `eas build --profile preview` | 构建预览版本 |
| `build:production` | `eas build --profile production` | 构建生产版本 |
| `submit:android` | `eas submit --platform android` | 提交Android版本 |
| `submit:ios` | `eas submit --platform ios` | 提交iOS版本 |
| `update` | `eas update` | 更新应用 |

## 构建流程

### 1. 开发构建
```bash
# 构建开发版本
eas build --platform android --profile development

# 下载并安装到设备
# 构建完成后会提供下载链接
```

### 2. 预览构建
```bash
# 构建预览版本
npm run build:preview

# 用于内部测试和演示
```

### 3. 生产构建
```bash
# 构建生产版本
npm run build:production

# 用于应用商店发布
```

## 环境变量配置

### 1. 创建环境文件
```bash
# 复制环境变量模板
cp env.example .env

# 编辑环境变量
nano .env
```

### 2. 配置EAS环境变量
```bash
# 设置EAS环境变量
eas secret:create --scope project --name API_KEY --value "your-api-key"
eas secret:create --scope project --name API_SECRET --value "your-api-secret"
```

## 证书和签名

### Android证书
EAS会自动处理Android证书的生成和管理。

### iOS证书
EAS会自动处理iOS证书的生成和管理。

## 构建优化

### 1. 减小应用大小
- 使用 `expo-optimize` 优化资源
- 移除未使用的依赖
- 压缩图片资源

### 2. 提高构建速度
- 使用缓存
- 并行构建
- 增量构建

## 常见问题

### 1. 构建失败
```bash
# 查看构建日志
eas build:list
eas build:view [BUILD_ID]
```

### 2. 证书问题
```bash
# 重新生成证书
eas credentials
```

### 3. 环境变量问题
```bash
# 查看环境变量
eas secret:list
```

## 监控和分析

### 1. 构建状态
访问 [Expo Dashboard](https://expo.dev) 查看构建状态。

### 2. 应用分析
- 使用Expo Analytics
- 集成Crashlytics
- 性能监控

## 最佳实践

### 1. 版本管理
- 使用语义化版本号
- 自动版本号递增
- 构建标签管理

### 2. 测试流程
- 开发版本测试
- 预览版本测试
- 生产版本测试

### 3. 发布流程
- 代码审查
- 自动化测试
- 分阶段发布

## 下一步

1. **首次构建**: 运行 `npm run build:preview` 进行首次构建
2. **测试应用**: 下载并测试构建的应用
3. **配置证书**: 根据需要配置证书和签名
4. **设置CI/CD**: 配置自动化构建流程
5. **发布应用**: 准备应用商店发布

## 相关链接

- [EAS文档](https://docs.expo.dev/build/introduction/)
- [构建配置](https://docs.expo.dev/build-reference/eas-json/)
- [应用提交](https://docs.expo.dev/submit/introduction/)
- [Expo Dashboard](https://expo.dev) 