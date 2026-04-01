# Tasks - 疯友急救页面重构

## [ ] Task 1: 重构急救页面基础结构
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 重写 pages/rescue/index.vue 基础结构
  - 实现"今日发疯打卡"核心功能
  - 设计急救医疗风格的页面布局
- **Acceptance Criteria Addressed**: 页面基础结构完成，打卡功能可用

## [ ] Task 2: 实现打卡功能逻辑
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 实现打卡/取消打卡逻辑
  - 存储打卡数据到本地 storage
  - 展示今日打卡状态
- **Acceptance Criteria Addressed**: 打卡功能完整可用

## [ ] Task 3: 实现急救工具箱
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 实现紧急联系人卡片和拨打功能
  - 实现解压小游戏入口（跳转至 games.vue）
  - 实现专业咨询入口（显示热线电话）
- **Acceptance Criteria Addressed**: 急救工具完整可用

## [ ] Task 4: 实现打卡记录展示
- **Priority**: P1
- **Depends On**: Task 2
- **Description**:
  - 从 storage 读取历史打卡记录
  - 展示最近7条打卡记录
  - 每条记录显示日期、时间、心情状态
- **Acceptance Criteria Addressed**: 历史记录展示功能可用

## [ ] Task 5: 实现心情指数选择
- **Priority**: P1
- **Depends On**: Task 2
- **Description**:
  - 打卡时让用户选择心情指数（1-5）
  - 不同心情对应不同颜色和文案
  - 心情数据存储到打卡记录中
- **Acceptance Criteria Addressed**: 心情选择功能可用

## [ ] Task 6: 更新 API 接口占位
- **Priority**: P1
- **Depends On**: Task 1-5
- **Description**:
  - 在 api/rescue.ts 中补充打卡相关接口
  - 预留后端 API 调用结构
- **Acceptance Criteria Addressed**: API 接口结构完整

## [ ] Task 7: 视觉和动效优化
- **Priority**: P2
- **Depends On**: Task 1-6
- **Description**:
  - 添加打卡成功的动画效果
  - 添加急救工具箱的交互反馈
  - 优化整体视觉效果
- **Acceptance Criteria Addressed**: 视觉体验符合急救主题

## Task Dependencies
- Task 2 依赖 Task 1
- Task 3 依赖 Task 1
- Task 4 依赖 Task 2
- Task 5 依赖 Task 2
- Task 6 依赖 Task 1-5
- Task 7 依赖 Task 1-6
