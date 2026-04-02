# 枫乐美 (FengLeMe) - Code Wiki

## 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [核心架构](#核心架构)
- [API模块](#api模块)
- [工具函数库](#工具函数库)
- [页面路由](#页面路由)
- [样式系统](#样式系统)
- [组件系统](#组件系统)
- [数据存储](#数据存储)
- [项目运行](#项目运行)
- [依赖关系图](#依赖关系图)

---

## 项目概述

**枫乐美 (FengLeMe)** 是一款基于 uni-app + Vue 3 + TypeScript 开发的跨平台移动应用。该应用以"专治各种想不开"为理念，提供发疯签到、疯情指数测试、疯险自检、紧急救援等功能，帮助用户以轻松幽默的方式释放压力。

### 核心功能

| 功能模块 | 描述 |
|---------|------|
| 发疯签到 | 每日签到获取疯度积分，支持连续签到奖励 |
| 疯情指数 | 基于情绪标签计算疯情等级 |
| 疯险自检 | 多维度风险评估（法律/社交/医疗） |
| 紧急救援 | 紧急联系人管理、SOS求助、专业干预 |
| 人生计算器 | 根据出生日期和生活方式预测人生余额 |
| 成就系统 | 任务成就解锁与奖励领取 |
| 排行榜 | 多维度排名（积分/疯情/风险/躺平） |

---

## 技术栈

### 前端框架

| 技术 | 版本 | 用途 |
|-----|------|------|
| Vue | 3.4.21 | 核心框架 |
| uni-app | 3.0.0-4020920240930001 | 跨平台开发框架 |
| TypeScript | 5.4.5 | 类型安全 |
| Vite | 5.2.8 | 构建工具 |
| SCSS | 1.75.0 | 样式预处理 |

### 支持平台

- **H5**: Web 应用
- **微信小程序**: mp-weixin
- **Android/iOS**: App Plus

### 核心依赖

```json
{
  "@dcloudio/uni-app": "3.0.0-4020920240930001",
  "@dcloudio/uni-components": "3.0.0-4020920240930001",
  "@dcloudio/uni-h5": "3.0.0-4020920240930001",
  "@dcloudio/uni-mp-weixin": "3.0.0-4020920240930001",
  "vue": "^3.4.21"
}
```

---

## 项目结构

```
fengleme-app/
├── api/                    # API接口层
│   ├── index.ts           # 统一导出
│   ├── user.ts            # 用户相关接口
│   ├── checkin.ts         # 签到接口
│   ├── mood.ts            # 疯情指数接口
│   ├── risk.ts            # 疯险自检接口
│   ├── rescue.ts          # 紧急救援接口
│   ├── ranking.ts         # 排行榜接口
│   ├── achievement.ts     # 成就系统接口
│   ├── statistics.ts      # 统计数据接口
│   ├── messages.ts        # 消息中心接口
│   ├── feedback.ts        # 反馈接口
│   ├── life.ts            # 人生计算器接口
│   ├── reminder.ts        # 提醒接口
│   ├── safety.ts          # 安全接口
│   ├── system.ts          # 系统接口
│   └── userLog.ts         # 用户日志接口
├── components/            # 公共组件
│   ├── LoginRequired/     # 登录验证组件
│   └── OnboardingGuide.vue # 新手引导组件
├── pages/                 # 页面目录
│   ├── index/             # 首页（签到页）
│   ├── auth/              # 认证相关页面
│   ├── mood/              # 疯情指数页
│   ├── risk/              # 疯险自检页
│   ├── rescue/            # 紧急救援页
│   ├── ranking/           # 排行榜页
│   ├── mine/              # 个人中心页
│   ├── profile/           # 个人资料页
│   ├── settings/          # 设置页
│   ├── messages/          # 消息中心页
│   ├── achievements/      # 成就系统页
│   ├── feedback/          # 反馈页
│   ├── faq/               # 常见问题页
│   ├── friends/           # 疯友院页
│   ├── life/              # 人生计算器页
│   ├── task/              # 任务中心页
│   └── guide/             # 引导页
├── utils/                 # 工具函数库
│   ├── index.ts           # 统一导出
│   ├── request.ts         # HTTP请求封装
│   ├── storage.ts         # 本地存储封装
│   ├── validate.ts        # 表单验证
│   ├── format.ts          # 格式化工具
│   ├── config.ts          # 配置常量
│   ├── constants.ts       # 存储键常量
│   ├── theme.ts           # 主题管理
│   ├── safety.ts          # 敏感词检测
│   ├── taskSystem.ts      # 任务系统
│   ├── notification.ts    # 通知工具
│   ├── debounce.ts        # 防抖节流
│   └── anonymousSync.ts   # 匿名数据同步
├── styles/                # 样式文件
│   ├── index.scss         # 主样式入口
│   ├── variables.scss     # SCSS变量
│   ├── theme.scss         # 主题样式
│   ├── mixins.scss        # 混入样式
│   └── common.scss        # 公共样式
├── static/                # 静态资源
│   ├── icons/             # 图标资源
│   └── tabbar/            # 底部导航图标
├── uni_modules/           # uni-app模块
│   ├── uni-icons/         # 图标组件
│   └── uni-scss/          # 样式变量
├── App.vue                # 应用入口组件
├── main.ts                # 应用入口文件
├── pages.json             # 页面路由配置
├── manifest.json          # 应用配置
├── vite.config.ts         # Vite配置
├── tsconfig.json          # TypeScript配置
└── uni.scss               # 全局样式变量
```

---

## 核心架构

### 应用入口

**文件**: [main.ts](file:///workspace/main.ts)

```typescript
import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  return { app }
}
```

### 应用生命周期

**文件**: [App.vue](file:///workspace/App.vue)

| 生命周期 | 功能 |
|---------|------|
| onLaunch | 初始化主题模式、获取系统信息、设置iOS导航栏颜色 |
| onShow | 应用显示时的处理 |
| onHide | 应用隐藏时的处理 |

### 架构分层

```
┌─────────────────────────────────────────────────────────┐
│                    Pages (页面层)                        │
│  index / mood / risk / rescue / mine / ranking / ...    │
├─────────────────────────────────────────────────────────┤
│                 Components (组件层)                      │
│         LoginRequired / OnboardingGuide                 │
├─────────────────────────────────────────────────────────┤
│                    API (接口层)                          │
│  user / checkin / mood / risk / rescue / ranking / ...  │
├─────────────────────────────────────────────────────────┤
│                   Utils (工具层)                         │
│   request / storage / validate / format / theme / ...   │
├─────────────────────────────────────────────────────────┤
│                   Styles (样式层)                        │
│        theme / variables / mixins / common              │
└─────────────────────────────────────────────────────────┘
```

---

## API模块

### 接口统一导出

**文件**: [api/index.ts](file:///workspace/api/index.ts)

```typescript
export * from './user'
export * from './checkin'
export * from './messages'
export * from './ranking'
export * from './feedback'
export * from './mood'
export * from './life'
export * from './risk'
export * from './rescue'
export * from './safety'
export * from './system'
export * from './reminder'
export * from './achievement'
export * from './statistics'
export * from './userLog'
```

### 用户模块 (user.ts)

**文件**: [api/user.ts](file:///workspace/api/user.ts)

#### 接口定义

| 接口名称 | 方法 | 路径 | 描述 |
|---------|------|------|------|
| register | POST | /api/user/register | 用户注册 |
| login | POST | /api/user/login | 用户登录 |
| sendSmsCode | POST | /api/auth/sendSmsCode | 发送短信验证码 |
| loginBySms | POST | /api/auth/loginBySms | 短信登录 |
| resetPassword | POST | /api/auth/resetPassword | 重置密码 |
| getUserInfo | GET | /api/user/info | 获取用户信息 |
| updateUserInfo | POST | /api/user/update | 更新用户信息 |
| bindEmail | POST | /api/user/bind-email | 绑定邮箱 |
| bindPhone | POST | /api/user/bind-phone | 绑定手机 |
| logout | POST | /api/user/logout | 退出登录 |
| getCheckinSettings | GET | /api/user/getCheckinSettings | 获取签到设置 |
| saveCheckinSettings | POST | /api/user/saveCheckinSettings | 保存签到设置 |
| changePassword | POST | /api/user/changePassword | 修改密码 |
| syncAnonymousData | POST | /api/user/syncAnonymousData | 同步匿名数据 |

#### 数据类型

```typescript
interface UserInfo {
  id: number
  nickname: string
  avatar: string
  phone?: string
  email?: string
  gender: number
  signature: string
  crazy_points: number
  continuous_days: number
  total_days: number
  level: string
  last_checkin_date?: string
  join_date: string
}

interface LoginResult {
  token: string
  userInfo: UserInfo
  isNewUser?: boolean
}
```

### 签到模块 (checkin.ts)

**文件**: [api/checkin.ts](file:///workspace/api/checkin.ts)

| 接口名称 | 方法 | 路径 | 描述 |
|---------|------|------|------|
| getCheckinStats | GET | /api/checkin/stats | 获取签到统计 |
| doCheckin | POST | /api/checkin/do | 执行签到 |
| getCheckinHistory | GET | /api/checkin/history | 签到历史 |

```typescript
interface CheckinStats {
  isCheckedIn: boolean
  todayCount: number
  continuousDays: number
  totalDays: number
  crazyPoints: number
  level: string
  lastCheckinDate?: string
}

interface CheckinResult {
  points: number
  todayRank: number
  continuousDays: number
  totalDays: number
  crazyPoints: number
  level: string
  message: string
}
```

### 疯情指数模块 (mood.ts)

**文件**: [api/mood.ts](file:///workspace/api/mood.ts)

| 接口名称 | 方法 | 路径 | 描述 |
|---------|------|------|------|
| calculateMoodIndex | POST | /api/mood/calculate | 计算疯情指数 |

```typescript
interface MoodCalculateRequest {
  text: string
  emotionTags: string[]
}

interface MoodCalculateResponse {
  index: number
  level: 'normal' | 'mild' | 'moderate' | 'severe'
  levelText: string
  comment: string
}
```

### 疯险自检模块 (risk.ts)

**文件**: [api/risk.ts](file:///workspace/api/risk.ts)

| 接口名称 | 方法 | 路径 | 描述 |
|---------|------|------|------|
| calculateRisk | POST | /api/risk/calculate | 计算风险指数 |

```typescript
interface RiskCalculateResponse {
  legal: RiskItem    // 法律风险
  social: RiskItem   // 社交风险
  medical: RiskItem  // 医疗风险
  total: number
  conclusion: string
  alternatives: string[]
  comment: string
}
```

### 紧急救援模块 (rescue.ts)

**文件**: [api/rescue.ts](file:///workspace/api/rescue.ts)

| 接口名称 | 方法 | 路径 | 描述 |
|---------|------|------|------|
| sendSOS | POST | /api/rescue/sos | 发送SOS求助 |
| getContacts | GET | /api/rescue/contacts | 获取紧急联系人 |
| addContact | POST | /api/rescue/contacts | 添加紧急联系人 |
| updateContact | POST | /api/rescue/contacts/:id | 更新联系人 |
| deleteContact | POST | /api/rescue/contacts/:id/delete | 删除联系人 |
| getHotlines | GET | /api/rescue/hotlines | 获取热线电话 |

### 排行榜模块 (ranking.ts)

**文件**: [api/ranking.ts](file:///workspace/api/ranking.ts)

| 接口名称 | 方法 | 路径 | 描述 |
|---------|------|------|------|
| getRankingList | GET | /api/ranking/list | 排行榜列表 |
| getMyRank | GET | /api/ranking/my | 我的排名 |

```typescript
// 排行榜类型
type RankType = 'points' | 'mood' | 'risk' | 'lying'
```

### 成就系统模块 (achievement.ts)

**文件**: [api/achievement.ts](file:///workspace/api/achievement.ts)

| 接口名称 | 方法 | 路径 | 描述 |
|---------|------|------|------|
| getAchievementList | GET | /api/achievement/list | 成就列表 |
| getMyAchievements | GET | /api/achievement/myAchievements | 我的成就 |
| receiveAchievementReward | POST | /api/achievement/receiveReward | 领取奖励 |
| checkAchievements | POST | /api/achievement/checkAchievements | 检查成就 |

### 统计模块 (statistics.ts)

**文件**: [api/statistics.ts](file:///workspace/api/statistics.ts)

| 接口名称 | 方法 | 路径 | 描述 |
|---------|------|------|------|
| getStatisticsOverview | GET | /api/statistics/overview | 统计概览 |
| getCheckinTrend | GET | /api/statistics/checkinTrend | 签到趋势 |
| getCheckinHourDistribution | GET | /api/statistics/checkinHourDistribution | 签到时段分布 |
| getRiskTrend | GET | /api/statistics/riskTrend | 风险趋势 |
| getMoodTrend | GET | /api/statistics/moodTrend | 疯情趋势 |
| getRankingHistory | GET | /api/statistics/rankingHistory | 排名历史 |

---

## 工具函数库

### HTTP请求封装 (request.ts)

**文件**: [utils/request.ts](file:///workspace/utils/request.ts)

#### 核心功能

- 统一的请求/响应处理
- Token自动注入
- Loading状态管理
- 错误统一处理
- 网络状态检测
- 401自动跳转登录

#### 导出方法

```typescript
// GET请求
export const get = <T = any>(url: string, data?: any, config?: Partial<RequestConfig>)

// POST请求
export const post = <T = any>(url: string, data?: any, config?: Partial<RequestConfig>)

// PUT请求
export const put = <T = any>(url: string, data?: any, config?: Partial<RequestConfig>)

// DELETE请求
export const del = <T = any>(url: string, data?: any, config?: Partial<RequestConfig>)
```

#### 请求配置

```typescript
interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
  timeout?: number      // 默认15000ms
  showLoading?: boolean // 默认true
  showError?: boolean   // 默认true
}

interface ResponseData<T = any> {
  code: number
  message: string
  data: T
}
```

### 本地存储封装 (storage.ts)

**文件**: [utils/storage.ts](file:///workspace/utils/storage.ts)

#### 核心特性

- 自动添加前缀 `fengleme_`
- 支持过期时间检测
- 支持同步/异步操作
- 统一错误处理

#### API

```typescript
const storage = {
  // 同步方法
  set(key: string, value: any): void
  get<T = any>(key: string, maxAge?: number): T | null
  remove(key: string): void
  clear(): void
  getInfo(): UniApp.GetStorageInfoSuccess
  
  // 异步方法
  setAsync(key: string, value: any): Promise<void>
  getAsync<T = any>(key: string, maxAge?: number): Promise<T | null>
}
```

### 表单验证 (validate.ts)

**文件**: [utils/validate.ts](file:///workspace/utils/validate.ts)

```typescript
// 手机号验证 (1[3-9]开头的11位数字)
export const validatePhone = (phone: string): boolean

// 邮箱验证
export const validateEmail = (email: string): boolean

// 必填验证
export const validateRequired = (value: string): boolean

// 日期验证
export const validateDate = (date: string): boolean
```

### 格式化工具 (format.ts)

**文件**: [utils/format.ts](file:///workspace/utils/format.ts)

```typescript
// 日期格式化
export const formatDate = (
  timestamp: number | string, 
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string

// 价格格式化
export const formatPrice = (price: number): string  // ¥XX.XX

// 数字格式化 (万/亿)
export const formatNumber = (num: number): string

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  fn: T, 
  delay: number = 300
)

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  fn: T, 
  delay: number = 300
)
```

### 主题管理 (theme.ts)

**文件**: [utils/theme.ts](file:///workspace/utils/theme.ts)

#### 主题模式

```typescript
type ThemeMode = 'light' | 'dark' | 'system'
```

#### ThemeManager 类

```typescript
class ThemeManager {
  getMode(): ThemeMode                    // 获取当前模式
  getActualTheme(): 'light' | 'dark'      // 获取实际主题
  setMode(mode: ThemeMode): void          // 设置主题模式
  subscribe(listener: Function): void     // 订阅主题变化
  unsubscribe(listener: Function): void   // 取消订阅
}

export const themeManager = new ThemeManager()
```

### 敏感词检测 (safety.ts)

**文件**: [utils/safety.ts](file:///workspace/utils/safety.ts)

```typescript
// 敏感词列表
export const sensitiveWords: string[]

// 检测是否包含敏感词
export const checkSensitiveWords = (text: string): boolean

// 获取匹配的敏感词
export const getMatchedWords = (text: string): string[]

// 热线电话
export const hotlineNumbers = {
  national: '400-161-9995',
  beijing: '010-82951332',
  shanghai: '021-12320',
  guangzhou: '020-81899120'
}
```

### 任务系统 (taskSystem.ts)

**文件**: [utils/taskSystem.ts](file:///workspace/utils/taskSystem.ts)

#### 任务类型

```typescript
type TaskType = 'daily' | 'achievement' | 'challenge'
type PointsSource = 'signIn' | 'test' | 'emergency' | 'share' | 'riskTest'
```

#### TaskSystem 类核心方法

| 方法 | 返回类型 | 描述 |
|-----|---------|------|
| getDailyTasks() | DailyTask[] | 获取每日任务 |
| getAchievementTasks() | AchievementTask[] | 获取成就任务 |
| getChallengeTasks() | ChallengeTask[] | 获取挑战任务 |
| completeTask(taskId) | number | 完成任务，返回获得积分 |
| getDailyEarned() | number | 今日获得积分 |
| getTotalCrazyPoints() | number | 总疯度积分 |
| getPointsHistory() | PointsHistoryItem[] | 积分历史 |
| getWeeklyPoints() | number | 本周积分 |
| getMonthlyPoints() | number | 本月积分 |
| getWeeklyTrend() | object[] | 周趋势数据 |
| getPointsSourceStats() | PointsSourceStat[] | 积分来源统计 |
| claimDailyRankingReward(rank) | number | 领取每日排名奖励 |
| claimWeeklyRankingReward(rank) | object | 领取周排名奖励 |
| claimMonthlyRankingReward(rank) | object | 领取月排名奖励 |

---

## 页面路由

### 路由配置

**文件**: [pages.json](file:///workspace/pages.json)

### TabBar 配置

| 页面 | 路径 | 图标 | 文字 |
|-----|------|------|------|
| 首页 | pages/index/index | home | 首页 |
| 签到设置 | pages/mood/index | mood | 签到设置 |
| 疯友院 | pages/friends/index | rescue | 疯友院 |
| 我的 | pages/mine/index | mine | 我的 |

### 页面列表

| 页面名称 | 路径 | 导航栏标题 | 下拉刷新 |
|---------|------|-----------|---------|
| 引导页 | pages/guide/index | (自定义) | 否 |
| 首页 | pages/index/index | 疯了么 | 否 |
| 任务中心 | pages/task/index | 任务中心 | 否 |
| 登录 | pages/auth/login | 登录 | 否 |
| 注册 | pages/auth/register | 注册 | 否 |
| 重置密码 | pages/auth/forgot-password | 重置密码 | 否 |
| 签到设置 | pages/mood/index | 签到设置 | 否 |
| 疯险自检 | pages/risk/index | 疯险自检 | 否 |
| 疯友院 | pages/friends/index | 疯友院 | 否 |
| 疯神榜 | pages/rescue/index | 疯神榜 | 是 |
| 人生计算器 | pages/life/index | 人生计算器 | 否 |
| 排行榜 | pages/ranking/index | 发疯排行榜 | 否 |
| 我的 | pages/mine/index | 我的 | 否 |
| 紧急联系人 | pages/rescue/contacts | 紧急联系人 | 否 |
| 在线镇静剂 | pages/rescue/games | 在线镇静剂 | 否 |
| 专业干预 | pages/rescue/professional | 专业干预 | 否 |
| 专业咨询 | pages/rescue/webview | 专业咨询 | 否 |
| 设置 | pages/settings/index | 设置 | 否 |
| 编辑资料 | pages/profile/edit | 编辑资料 | 否 |
| 修改密码 | pages/profile/change-password | 修改密码 | 否 |
| 账户安全 | pages/profile/security | 账户安全 | 否 |
| 消息中心 | pages/messages/index | 消息中心 | 是 |
| 宝贵意见 | pages/feedback/index | 宝贵意见 | 否 |
| 成就系统 | pages/achievements/index | 成就系统 | 是 |
| 常见问题 | pages/faq/index | 常见问题 | 否 |

### 全局样式配置

```json
{
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "疯了么",
    "navigationBarBackgroundColor": "#ffffff",
    "backgroundColor": "#f5f5f5",
    "lazyCodeLoading": "requiredComponents"
  }
}
```

---

## 样式系统

### 主题变量

**文件**: [styles/theme.scss](file:///workspace/styles/theme.scss)

#### CSS变量定义

```scss
:root {
  // 主色调
  --color-primary: #22D7FF;
  --color-primary-gradient: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
  --color-primary-dark: #00C8EB;

  // 背景色
  --color-bg: #F8FAFB;
  --color-card: #FFFFFF;
  --color-card-hover: #F5F5F5;

  // 文字颜色
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;

  // 边框
  --color-border: #E5E5E5;
  --color-divider: #F0F0F0;

  // 状态色
  --color-danger: #EF4444;
  --color-warning: #F59E0B;
  --color-success: #10B981;

  // 圆角
  --radius-sm: 8rpx;
  --radius-md: 12rpx;
  --radius-lg: 16rpx;
  --radius-xl: 20rpx;
  --radius-xxl: 24rpx;

  // 间距
  --spacing-xs: 8rpx;
  --spacing-sm: 12rpx;
  --spacing-md: 16rpx;
  --spacing-lg: 20rpx;
  --spacing-xl: 24rpx;
  --spacing-xxl: 32rpx;

  // 字号
  --font-size-xs: 20rpx;
  --font-size-sm: 22rpx;
  --font-size-md: 26rpx;
  --font-size-lg: 28rpx;
  --font-size-xl: 32rpx;
  --font-size-xxl: 36rpx;
  --font-size-title: 38rpx;

  // 过渡动画
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
  --transition-slow: 0.4s ease;
}
```

#### 暗色主题

```scss
.dark {
  --color-primary: #66E5FF;
  --color-bg: #121212;
  --color-card: #1E1E1E;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #B0B0B0;
  --color-border: #333333;
}
```

### SCSS变量

**文件**: [styles/variables.scss](file:///workspace/styles/variables.scss)

```scss
// 主色调
$blue-primary: #22D7FF;
$blue-light: #66E5FF;
$blue-dark: #00B8E6;

// 功能色
$success: #34C759;
$warning: #FF9500;
$error: #FF3B30;
$info: #007AFF;

// 文字颜色
$text-primary: #1C1C1E;
$text-secondary: #3A3A3C;
$text-placeholder: #8E8E93;

// 边框
$border-color: #E5E5EA;
$border-radius: 12rpx;
$border-radius-lg: 20rpx;
$border-radius-xl: 28rpx;
$border-radius-2xl: 36rpx;

// 间距
$spacing-xs: 8rpx;
$spacing-sm: 16rpx;
$spacing-md: 24rpx;
$spacing-lg: 32rpx;
$spacing-xl: 40rpx;
$spacing-2xl: 60rpx;

// 字号
$font-size-xs: 20rpx;
$font-size-sm: 24rpx;
$font-size-md: 28rpx;
$font-size-lg: 32rpx;
$font-size-xl: 36rpx;
$font-size-2xl: 48rpx;
$font-size-3xl: 64rpx;

// 阴影
$shadow-sm: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
$shadow-md: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
$shadow-lg: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
$shadow-xl: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);

// 渐变色
$gradient-primary: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
$gradient-sunset: linear-gradient(135deg, #FA709A 0%, #FEE140 100%);
$gradient-ocean: linear-gradient(135deg, #2193B0 0%, #6DD5ED 100%);
```

---

## 组件系统

### 登录验证组件 (LoginRequired)

**文件**: [components/LoginRequired/LoginRequired.vue](file:///workspace/components/LoginRequired/LoginRequired.vue)

#### Props

| 属性 | 类型 | 默认值 | 描述 |
|-----|------|-------|------|
| title | string | '此功能需要登录' | 标题 |
| description | string | '登录后即可查看完整内容' | 描述文字 |
| icon | string | '🔒' | 图标 |

#### 使用示例

```vue
<template>
  <LoginRequired 
    v-if="!isLogin" 
    title="功能需要登录"
    description="登录后解锁更多精彩"
  />
</template>
```

### 新手引导组件 (OnboardingGuide)

**文件**: [components/OnboardingGuide.vue](file:///workspace/components/OnboardingGuide.vue)

用于首次使用时的引导流程。

---

## 数据存储

### 存储键常量

**文件**: [utils/constants.ts](file:///workspace/utils/constants.ts)

```typescript
export const STORAGE_KEYS = {
  CHECKIN_DATA: 'checkin_data',
  CHECKIN_HISTORY: 'checkin_history',
  DAILY_CHECKIN_COUNT: 'daily_checkin_count',
  MOOD_HISTORY: 'mood_history',
  RISK_HISTORY: 'risk_history',
  LIFE_HISTORY: 'life_history',
  USAGE_STATS: 'usage_stats',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  TASK_SYSTEM_DATA: 'task_system_data',
  THEME: 'theme',
  ACTUAL_THEME: 'actual_theme'
} as const
```

### 存储前缀

所有存储键自动添加前缀 `fengleme_`，避免与其他应用冲突。

### 匿名用户数据

未登录用户的数据存储在 `fengleme_anonymous_data` 键下：

```typescript
interface AnonymousData {
  continuousDays: number
  totalDays: number
  crazyPoints: number
  level: string
  isCheckedIn: boolean
  lastCheckinDate: string
}
```

---

## 项目运行

### 环境要求

- Node.js >= 16.x
- npm >= 8.x

### 安装依赖

```bash
npm install
```

### 开发模式

#### H5开发

```bash
npm run dev:h5
```

访问 http://localhost:8080

#### 微信小程序开发

```bash
npm run dev:mp-weixin
```

使用微信开发者工具打开 `dist/dev/mp-weixin` 目录。

### 生产构建

#### H5构建

```bash
npm run build:h5
```

#### 微信小程序构建

```bash
npm run build:mp-weixin
```

### 环境配置

**文件**: [utils/config.ts](file:///workspace/utils/config.ts)

```typescript
const API_CONFIG = {
  development: 'https://flm.lvafan.cn',
  staging: 'https://flm.lvafan.cn',
  production: 'https://flm.lvafan.cn'
}

export const BASE_URL = API_CONFIG[ENV] || API_CONFIG.production
```

### Vite配置

**文件**: [vite.config.ts](file:///workspace/vite.config.ts)

```typescript
export default defineConfig({
  plugins: [uni()],
  server: {
    port: 8080,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://flm.lvafan.cn',
        changeOrigin: true,
        secure: true
      }
    }
  },
  resolve: {
    alias: {
      '@': '/'
    }
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

---

## 依赖关系图

### 模块依赖关系

```
┌─────────────────────────────────────────────────────────────┐
│                         Pages                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  index  │ │  mine   │ │  mood   │ │ rescue  │ ...       │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
└───────┼──────────┼──────────┼──────────┼───────────────────┘
        │          │          │          │
        v          v          v          v
┌─────────────────────────────────────────────────────────────┐
│                      Components                              │
│  ┌──────────────┐  ┌──────────────────┐                     │
│  │ LoginRequired│  │ OnboardingGuide  │                     │
│  └──────────────┘  └──────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
        │
        v
┌─────────────────────────────────────────────────────────────┐
│                          API                                 │
│  ┌──────┐ ┌─────────┐ ┌───────┐ ┌───────┐ ┌──────────┐     │
│  │ user │ │ checkin │ │ mood  │ │ risk  │ │ rescue   │ ... │
│  └──┬───┘ └────┬────┘ └───┬───┘ └───┬───┘ └────┬─────┘     │
└─────┼──────────┼──────────┼──────────┼──────────┼───────────┘
      │          │          │          │          │
      v          v          v          v          v
┌─────────────────────────────────────────────────────────────┐
│                         Utils                                │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐          │
│  │ request │ │ storage │ │ validate │ │ format  │          │
│  └─────────┘ └─────────┘ └──────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐          │
│  │ theme   │ │ safety  │ │ constants│ │taskSystem│         │
│  └─────────┘ └─────────┘ └──────────┘ └─────────┘          │
└─────────────────────────────────────────────────────────────┘
        │
        v
┌─────────────────────────────────────────────────────────────┐
│                        Styles                                │
│  ┌─────────┐ ┌───────────┐ ┌─────────┐ ┌────────┐          │
│  │ theme   │ │ variables │ │ mixins  │ │ common │          │
│  └─────────┘ └───────────┘ └─────────┘ └────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### API调用流程

```
Page Component
      │
      │ import { getUserInfo } from '@/api'
      v
API Module (api/user.ts)
      │
      │ import { get } from '@/utils/request'
      v
Request Utils (utils/request.ts)
      │
      │ import { storage } from './storage'
      │ import { BASE_URL } from './config'
      v
┌─────────────────────────────┐
│  1. 获取Token               │
│  2. 构建请求头              │
│  3. 显示Loading             │
│  4. 发起uni.request         │
│  5. 处理响应                │
│  6. 隐藏Loading             │
│  7. 返回数据/错误           │
└─────────────────────────────┘
```

---

## 附录

### 应用配置

**文件**: [manifest.json](file:///workspace/manifest.json)

```json
{
  "name": "疯了么",
  "appid": "__UNI__3D410E0",
  "description": "专治各种想不开。检测发疯指数，规划疯狂人生。",
  "versionName": "1.0.0",
  "versionCode": "100",
  "vueVersion": "3"
}
```

### TypeScript配置

**文件**: [tsconfig.json](file:///workspace/tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

*文档生成时间: 2026-04-02*
