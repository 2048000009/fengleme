# 枫乐美 - FengLeMe App

基于 uniapp + Vue 3 + TypeScript + uView Plus 的跨平台移动应用项目。

## 技术栈

- **框架**: uniapp (Vue 3)
- **语言**: TypeScript
- **UI组件库**: uView Plus
- **构建工具**: Vite
- **样式**: SCSS

## 项目结构

```
fengleme-app/
├── src/
│   ├── api/           # API接口层
│   │   ├── index.ts
│   │   ├── user.ts    # 用户相关接口
│   │   └── common.ts  # 通用接口
│   ├── components/    # 公共组件
│   ├── pages/         # 页面
│   │   └── index/
│   │       └── index.vue
│   ├── static/        # 静态资源
│   ├── styles/        # 样式文件
│   │   ├── index.scss
│   │   ├── variables.scss
│   │   ├── mixins.scss
│   │   └── common.scss
│   ├── utils/         # 工具函数
│   │   ├── index.ts
│   │   ├── request.ts # 请求封装
│   │   ├── storage.ts # 本地存储
│   │   ├── validate.ts # 验证工具
│   │   └── format.ts  # 格式化工具
│   ├── App.vue        # 应用入口
│   └── main.ts        # 主入口文件
├── pages.json         # 页面路由配置
├── manifest.json      # 应用配置
├── package.json       # 依赖管理
├── tsconfig.json      # TypeScript配置
├── vite.config.ts     # Vite配置
└── uni.scss           # uniapp全局样式变量
```

## 快速开始

### 安装依赖

```bash
npm install
```

### H5开发

```bash
npm run dev:h5
```

### 微信小程序开发

```bash
npm run dev:mp-weixin
```

### 构建H5

```bash
npm run build:h5
```

### 构建微信小程序

```bash
npm run build:mp-weixin
```

## 主题色

项目配置了蓝白和黄黑两套主题色系：

### 蓝白主题
- 主色: `#1890ff`
- 浅蓝: `#40a9ff`
- 深蓝: `#096dd9`
- 背景: `#e6f7ff`

### 黄黑主题
- 主色: `#faad14`
- 浅黄: `#ffc53d`
- 深黄: `#d48806`
- 背景: `#fffbe6`

## API请求

项目已封装好 `uni.request` 请求，使用方式：

```typescript
import { get, post } from '@/utils/request'
import { login, getUserInfo } from '@/api/user'

// 基础调用
get('/api/data').then(res => {
  console.log(res.data)
})

// 使用接口模块
login({ username: 'admin', password: '123456' })
  .then(res => {
    console.log(res.token)
  })
```

## 工具函数

项目提供了丰富的工具函数：

- `request.ts`: HTTP请求封装
- `storage.ts`: 本地存储封装
- `validate.ts`: 表单验证（手机号、邮箱、身份证等）
- `format.ts`: 格式化工具（日期、价格、数字、防抖、节流等）

## License

MIT
