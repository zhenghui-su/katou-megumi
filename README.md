# 加藤惠主题全栈应用 - Katou Megumi Monorepo

一个以《路人女主的养成方法》中加藤惠为主题的现代化全栈应用系统，包含 Web 端、移动端、后端 API 和管理后台，采用 Monorepo 架构和现代化技术栈构建。

## 项目结构

```
katou-megumi/
├── package.json                 # 根目录配置文件
├── packages/                    # 子项目目录
│   ├── web/                    # Web 应用
│   │   ├── src/
│   │   │   ├── components/     # React 组件
│   │   │   ├── pages/         # 页面组件
│   │   │   ├── styles/        # 样式文件
│   │   │   ├── assets/        # 静态资源
│   │   │   ├── App.tsx        # 主应用组件
│   │   │   └── main.tsx       # 应用入口
│   │   ├── index.html         # HTML 模板
│   │   ├── package.json       # Web 应用配置
│   │   ├── rsbuild.config.ts  # Rsbuild 配置
│   │   └── tsconfig.json      # TypeScript 配置
│   ├── mobile/                # 移动端应用（React Native + Expo）
│   │   ├── app/               # 应用页面
│   │   ├── components/        # 组件库
│   │   ├── utils/             # 工具函数
│   │   ├── constants/         # 常量配置
│   │   ├── hooks/             # 自定义 Hooks
│   │   ├── assets/            # 静态资源
│   │   ├── app.json           # Expo 配置
│   │   └── package.json       # 移动端配置
│   ├── backend/               # 后端 API 服务（NestJS）
│   │   ├── src/
│   │   │   ├── modules/       # 功能模块
│   │   │   ├── guards/        # 守卫
│   │   │   ├── entities/      # 数据实体
│   │   │   └── main.ts        # 应用入口
│   │   ├── nest-cli.json      # NestJS 配置
│   │   └── package.json       # 后端配置
│   ├── admin/                 # 管理后台（React + Ant Design）
│   │   ├── src/
│   │   │   ├── pages/         # 页面组件
│   │   │   ├── components/    # 组件库
│   │   │   ├── utils/         # 工具函数
│   │   │   └── contexts/      # 上下文
│   │   ├── rsbuild.config.ts  # Rsbuild 配置
│   │   └── package.json       # 管理后台配置
│   └── shared/                # 共享组件库
│       ├── src/
│       │   └── i18n/          # 国际化配置
│       └── package.json       # 共享库配置
└── README.md                   # 项目说明
```

## 技术栈

### Web 应用

- **前端框架**: React 19
- **构建工具**: Rsbuild
- **UI 库**: Material-UI (MUI) + Ant Design
- **路由**: React Router
- **动画**: Framer Motion
- **样式**: Emotion + CSS
- **语言**: TypeScript
- **国际化**: react-i18next
- **状态管理**: React Context

### 移动端应用

- **框架**: React Native + Expo
- **导航**: Expo Router
- **状态管理**: React Context
- **网络请求**: Axios
- **存储**: AsyncStorage
- **相机**: Expo Camera

### 后端服务

- **框架**: NestJS
- **数据库**: TypeORM + MySQL
- **认证**: JWT + Passport
- **文件上传**: Multer
- **API 文档**: Swagger
- **验证**: class-validator

### 管理后台

- **UI 框架**: Ant Design
- **构建工具**: Rsbuild
- **状态管理**: React Context

### 开发工具

- **包管理**: npm
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript
- **版本控制**: Git
- **开发环境**: Monorepo 架构

## 快速开始

### 环境要求

- Node.js >= 18
- Expo CLI（移动端开发）

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-username/katou-megumi.git
cd katou-megumi

# 安装依赖
pnpm install
```

### 启动开发服务器

#### Web 应用

```bash
cd packages/web
pnpm dev
```

访问 http://localhost:3000 查看 Web 应用。

#### 后端 API

```bash
cd packages/backend
pnpm start:dev
```

API 服务运行在 http://localhost:8080

#### 管理后台

```bash
cd packages/admin
pnpm dev
```

访问 http://localhost:3002 查看管理后台。

#### 移动端应用

```bash
cd packages/mobile
npx expo start
```

使用 Expo Go 应用扫描二维码在手机上预览。

### 构建项目

```bash
# 构建所有项目
npm run build

# 或者只构建 web 应用
cd packages/web
npm run build
```

## 功能特性

### Web 应用

- ✅ 响应式设计
- ✅ 首页介绍
- ✅ 图片画廊
- ✅ 角色介绍页面
- ✅ 导航菜单
- ✅ 多语言支持（中文、英文、日文）
- ✅ 暗色主题
- ✅ 移动端适配
- ✅ 二维码登录功能
- ✅ 用户认证系统

### 移动端应用

- ✅ React Native + Expo 架构
- ✅ 底部导航栏（首页、发现、我的）
- ✅ 扫码登录功能
- ✅ 用户个人资料页面
- ✅ 自定义 Alert 组件
- ✅ 发现页面分类筛选
- ✅ 登录/注册功能

### 后端 API

- ✅ NestJS 框架
- ✅ 用户认证模块（注册、登录、JWT）
- ✅ 二维码登录系统
- ✅ 用户管理 API
- ✅ 画廊管理 API
- ✅ 文件上传功能
- ✅ 管理员权限控制

### 管理后台

- ✅ React + Ant Design 界面
- ✅ 用户管理（增删改查、批量操作）
- ✅ 内容审核功能
- ✅ 系统统计仪表盘
- ✅ 图片/视频/音乐管理
- ✅ 通知系统

### 待开发功能

- ⏳ 社交功能（评论、点赞）
- ⏳ 音频播放器优化
- ⏳ 视频播放器优化
- ⏳ 实时通知推送
- ⏳ 数据分析功能

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 许可证

本项目仅供学习和个人使用，请尊重原作品的版权。

---

💖 献给最可爱的加藤惠
