# 前后端完全对接任务清单

## Task 1: 后端API补充开发
**Priority**: P0  
**Depends On**: None  
**Description**: 补充后端缺失的API接口

- [x] SubTask 1.1: 创建Mood控制器 - 疯情指数计算API
  - 实现 `POST /api/mood/calculate` 接口
  - 接收text和emotionTags参数
  - 返回index、level、levelText、comment
  - 保存测试记录到数据库

- [x] SubTask 1.2: 创建Life控制器 - 人生计算器API
  - 实现 `POST /api/life/calculate` 接口
  - 接收birthDate和lifestyle参数
  - 返回years、months、totalMonths、suggestion
  - 保存计算记录到数据库

- [x] SubTask 1.3: 创建Risk控制器 - 疯险自检API
  - 实现 `POST /api/risk/calculate` 接口
  - 接收answers数组参数
  - 返回legal、social、medical评分和alternatives建议
  - 保存自检记录到数据库

- [x] SubTask 1.4: 创建Rescue控制器 - 紧急联系人API
  - 实现 `GET /api/rescue/contacts` 获取联系人列表
  - 实现 `POST /api/rescue/contacts` 添加联系人
  - 实现 `POST /api/rescue/contacts/:id` 更新联系人
  - 实现 `POST /api/rescue/contacts/:id/delete` 删除联系人
  - 实现 `POST /api/rescue/sos` 发送SOS求救
  - 实现 `GET /api/rescue/hotlines` 获取心理热线

- [x] SubTask 1.5: 创建Safety控制器 - 敏感词检测API
  - 实现 `POST /api/safety/check-sensitive-words` 接口
  - 建立敏感词库
  - 返回hasSensitiveWords和matchedWords

- [x] SubTask 1.6: 数据库表创建
  - 创建mood_test记录表
  - 创建life_calc记录表
  - 创建risk_check记录表
  - 创建rescue_contacts表
  - 创建hotlines表

## Task 2: 首页代码清理与API对接
**Priority**: P0  
**Depends On**: None  
**Description**: 清理首页本地storage代码，统一使用API

- [x] SubTask 2.1: 删除本地storage相关代码
  - 删除 `import storage from '@/utils/storage'`
  - 删除 `CHECKIN_KEY` 等本地存储key定义
  - 删除 `loadCheckinData` 等本地存储方法
  - 删除本地存储的checkinData、checkinHistory等变量

- [x] SubTask 2.2: 统一使用API获取数据
  - 保留 `import { login, getUserInfo } from '@/api'`
  - 保留 `import { getCheckinStats, doCheckin } from '@/api'`
  - 使用 `userInfo` 和 `checkinStats` ref变量
  - 确保 `loadData` 方法正确调用API

- [x] SubTask 2.3: 修复签到逻辑
  - 使用 `doCheckin()` API替代本地逻辑
  - 更新页面状态使用API返回的数据
  - 移除本地积分计算逻辑

- [x] SubTask 2.4: 测试验证
  - 验证页面加载正常
  - 验证自动登录成功
  - 验证签到功能正常
  - 验证数据正确显示

## Task 3: 排行榜API对接
**Priority**: P0  
**Depends On**: None  
**Description**: 替换模拟数据为真实后端数据，保留疯神榜功能

- [x] SubTask 3.1: 修改ranking/index.vue
  - 添加 `import { getRankingList, getMyRank } from '@/api'`
  - 保留疯神榜UI和功能
  - 删除 `generateRankingData` 模拟数据方法

- [x] SubTask 3.2: 实现真实数据加载
  - 创建 `loadRankingData` 方法调用API
  - 使用API返回的数据渲染列表
  - 处理加载状态和错误

- [x] SubTask 3.3: 实现我的排名显示
  - 调用 `getMyRank()` 获取我的排名
  - 显示真实排名和分数
  - 处理未上榜情况

- [x] SubTask 3.4: 测试验证
  - 验证排行榜数据正确显示
  - 验证我的排名正确显示
  - 验证切换tab正常

## Task 4: 消息系统API对接
**Priority**: P1  
**Depends On**: None  
**Description**: 实现消息列表、未读数、标记已读功能

- [x] SubTask 4.1: 创建消息列表页面
  - 创建/修改 `pages/messages/index.vue`
  - 添加 `import { getMessageList, markMessageRead, markAllRead } from '@/api'`
  - 实现消息列表展示UI

- [x] SubTask 4.2: 实现消息列表加载
  - 调用 `getMessageList()` 获取消息
  - 实现下拉刷新和上拉加载更多
  - 处理空状态显示

- [x] SubTask 4.3: 实现未读消息数获取
  - 调用 `getUnreadCount()` 获取未读数
  - 在tabbar显示红点提示
  - 定时刷新未读数

- [x] SubTask 4.4: 实现标记已读功能
  - 点击消息调用 `markMessageRead(id)`
  - 实现"全部已读"按钮调用 `markAllRead()`
  - 更新本地消息状态

- [x] SubTask 4.5: 测试验证
  - 验证消息列表正常显示
  - 验证未读数正确显示
  - 验证标记已读功能正常

## Task 5: 反馈系统API对接
**Priority**: P1  
**Depends On**: None  
**Description**: 实现反馈提交和列表查询

- [x] SubTask 5.1: 创建反馈提交页面
  - 创建/修改 `pages/feedback/index.vue`
  - 添加 `import { submitFeedback } from '@/api'`
  - 实现反馈表单UI

- [x] SubTask 5.2: 实现反馈提交功能
  - 调用 `submitFeedback(type, content, contact)`
  - 表单验证
  - 提交成功提示

- [x] SubTask 5.3: 实现反馈列表页面
  - 添加 `import { getFeedbackList } from '@/api'`
  - 实现反馈历史列表UI
  - 调用API获取反馈列表

- [x] SubTask 5.4: 测试验证
  - 验证反馈提交成功
  - 验证反馈列表正常显示

## Task 6: 疯情测试页面对接
**Priority**: P1  
**Depends On**: Task 1.1  
**Description**: mood页面接入后端API

- [x] SubTask 6.1: 修改mood/index.vue
  - 添加 `import { calculateMoodIndex } from '@/api'`
  - 保留前端测试题目和选项

- [x] SubTask 6.2: 实现测试结果提交
  - 用户完成测试后调用 `calculateMoodIndex()`
  - 显示API返回的结果
  - 保存测试记录

- [x] SubTask 6.3: 测试验证
  - 验证测试流程正常
  - 验证结果正确显示
  - 验证数据保存到后端

## Task 7: 人生计算器页面对接
**Priority**: P1  
**Depends On**: Task 1.2  
**Description**: life页面接入后端API

- [x] SubTask 7.1: 修改life/index.vue
  - 添加 `import { calculateLifeBalance } from '@/api'`
  - 保留前端输入表单

- [x] SubTask 7.2: 实现计算结果提交
  - 用户提交后调用 `calculateLifeBalance()`
  - 显示API返回的结果
  - 保存计算记录

- [x] SubTask 7.3: 测试验证
  - 验证计算流程正常
  - 验证结果正确显示
  - 验证数据保存到后端

## Task 8: 疯险自检页面对接
**Priority**: P1  
**Depends On**: Task 1.3  
**Description**: risk页面接入后端API

- [x] SubTask 8.1: 修改risk/index.vue
  - 添加 `import { calculateRisk } from '@/api'`
  - 保留前端测试题目

- [x] SubTask 8.2: 实现自检结果提交
  - 用户完成自检后调用 `calculateRisk()`
  - 显示API返回的评分和建议
  - 保存自检记录

- [x] SubTask 8.3: 测试验证
  - 验证自检流程正常
  - 验证结果正确显示
  - 验证数据保存到后端

## Task 9: 急救中心页面对接
**Priority**: P1  
**Depends On**: Task 1.4  
**Description**: rescue页面接入后端API

- [x] SubTask 9.1: 修改rescue/index.vue
  - 添加 `import { getContacts, sendSOS, getHotlines } from '@/api'`

- [x] SubTask 9.2: 实现紧急联系人管理
  - 调用 `getContacts()` 获取联系人列表
  - 调用API添加、编辑、删除联系人
  - 同步数据到后端

- [x] SubTask 9.3: 实现SOS求救功能
  - 点击SOS按钮调用 `sendSOS()`
  - 传递联系人和位置信息
  - 显示发送结果

- [x] SubTask 9.4: 实现心理热线显示
  - 调用 `getHotlines()` 获取热线列表
  - 显示热线信息

- [x] SubTask 9.5: 测试验证
  - 验证联系人管理正常
  - 验证SOS功能正常
  - 验证热线显示正常

## Task 10: 我的页面对接
**Priority**: P1  
**Depends On**: None  
**Description**: mine页面完善API调用

- [x] SubTask 10.1: 修改mine/index.vue
  - 确保已导入 `import { getUserInfo } from '@/api'`
  - 实现页面加载时调用API获取用户信息

- [x] SubTask 10.2: 实现编辑资料功能
  - 调用 `updateUserInfo()` 更新用户信息
  - 实现头像上传

- [x] SubTask 10.3: 实现消息中心入口
  - 点击消息中心跳转到消息列表页面
  - 显示未读消息数

- [x] SubTask 10.4: 测试验证
  - 验证用户信息正确显示
  - 验证编辑资料功能正常
  - 验证消息入口正常

## Task 11: 统一错误处理
**Priority**: P2  
**Depends On**: None  
**Description**: 完善网络错误、登录过期等场景处理

- [x] SubTask 11.1: 完善request.ts错误处理
  - 确保401错误正确处理
  - 确保网络错误提示友好
  - 添加请求重试机制

- [x] SubTask 11.2: 各页面添加错误处理
  - API调用添加try-catch
  - 显示友好的错误提示
  - 添加重试按钮

- [x] SubTask 11.3: 测试验证
  - 验证网络错误处理正常
  - 验证登录过期处理正常

## Task 12: 整体测试验证
**Priority**: P0  
**Depends On**: Task 1-11  
**Description**: 完整测试所有功能

- [x] SubTask 12.1: 功能测试
  - 测试所有页面正常访问
  - 测试所有API调用正常
  - 测试数据正确显示

- [x] SubTask 12.2: 兼容性测试
  - 测试不同网络环境
  - 测试登录状态过期
  - 测试异常情况

- [x] SubTask 12.3: 性能测试
  - 测试页面加载速度
  - 测试API响应时间
  - 测试大数据量处理

# Task Dependencies
- Task 6 依赖 Task 1.1 (Mood API)
- Task 7 依赖 Task 1.2 (Life API)
- Task 8 依赖 Task 1.3 (Risk API)
- Task 9 依赖 Task 1.4 (Rescue API)
- Task 12 依赖 Task 1-11
