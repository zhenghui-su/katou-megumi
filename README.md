# 加藤惠专属网站 - Katou Megumi Monorepo

这是一个献给《路人女主的养成方法》中加藤惠的专属网站项目，采用 Monorepo 架构构建。

暂未更新完整文档

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
│   ├── mobile/                # 移动端应用（待开发）
│   └── shared/                # 共享组件库（待开发）
└── README.md                   # 项目说明
```

## 技术栈

### Web 应用

- **构建工具**: Rsbuild
- **前端框架**: React 18
- **UI 库**: Material-UI (MUI)
- **路由**: React Router
- **动画**: Framer Motion
- **样式**: Emotion + CSS
- **语言**: TypeScript

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装 web 应用依赖
cd packages/web
npm install
```

### 开发模式

```bash
# 在根目录运行（推荐）
npm run dev

# 或者在 web 目录运行
cd packages/web
npm run dev
```

### 构建项目

```bash
# 构建所有项目
npm run build

# 或者只构建 web 应用
cd packages/web
npm run build
```

## 功能特性

### 已实现功能

- ✅ 响应式设计
- ✅ 现代化 UI 界面
- ✅ 流畅的页面动画
- ✅ 首页介绍
- ✅ 图片画廊
- ✅ 角色介绍页面
- ✅ 导航菜单

### 待开发功能

- 🚧 经典语录页面
- 🚧 视频播放功能
- 🚧 移动端应用
- 🚧 用户评论系统
- 🚧 搜索功能
- 🚧 多语言支持

## 自定义内容

### 替换图片

1. 将你的加藤惠图片放入 `packages/web/src/assets/` 目录
2. 修改 `packages/web/src/pages/Gallery.tsx` 中的图片路径
3. 更新图片的标题和描述

### 替换视频

1. 将视频文件放入 `packages/web/src/assets/` 目录
2. 在相应页面中引用视频文件

### 修改主题色彩

编辑 `packages/web/src/main.tsx` 中的 Material-UI 主题配置：

```typescript
const theme = createTheme({
	palette: {
		primary: {
			main: '#ff6b9d', // 主色调
		},
		secondary: {
			main: '#4fc3f7', // 辅助色
		},
	},
});
```

## 部署

### 构建生产版本

```bash
npm run build
```

构建完成后，`packages/web/dist/` 目录包含可部署的静态文件。

### 部署选项

- **Vercel**: 推荐，支持自动部署
- **Netlify**: 简单易用的静态网站托管
- **GitHub Pages**: 免费的静态网站托管
- **自建服务器**: 使用 Nginx 等 Web 服务器

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 许可证

本项目仅供学习和个人使用，请尊重原作品的版权。

---

💖 献给最可爱的加藤惠
