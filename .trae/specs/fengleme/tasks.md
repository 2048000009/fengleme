# 疯了么 - 实施计划

## [x] Task 1: uniapp项目初始化与基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 使用uniapp cli创建项目
  - 配置pages.json路由系统
  - 搭建项目目录结构（pages、components、api、utils等）
  - 配置样式系统（采用蓝白/黄黑主色调，uView UI或类似原生风格组件库）
  - 创建API接口层，预留后端接口调用框架
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目能在H5和小程序模拟器正常启动
  - `human-judgement` TR-1.2: 项目结构清晰，符合uniapp最佳实践
  - `programmatic` TR-1.3: API接口层框架已搭建，包含请求封装
- **Notes**: 使用uView UI或uni-ui组件库，保证原生APP体验

## [x] Task 2: 设计与实现原生风格导航和主页
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 实现底部tabbar导航（原生风格）
  - 实现主页，展示产品Slogan和各功能入口卡片
  - 采用医疗元素UI设计，避免AI化过度设计
  - 实现首次使用免责声明弹窗（原生模态框风格）
- **Acceptance Criteria Addressed**: [AC-5, AC-6]
- **Test Requirements**:
  - `programmatic` TR-2.1: 主页能正常访问，tabbar导航切换流畅
  - `programmatic` TR-2.2: 首次访问显示免责声明弹窗
  - `human-judgement` TR-2.3: UI风格符合原生APP体验，包含医疗元素
- **Notes**: 导航栏、按钮等控件需贴近iOS/Android原生设计

## [x] Task 3: 实现"疯"情指数查询功能
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现输入压力事件的原生表单界面
  - 实现情绪关键词选择界面（标签选择或网格布局）
  - 开发"疯"情指数计算逻辑（前端实现）
  - 实现指数可视化图表（原生风格进度条、仪表盘）
  - 实现黑色幽默评语库和随机展示
  - 预留后端指数计算API接口
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-3.1: 输入表单和关键词选择功能正常
  - `programmatic` TR-3.2: 提交后显示指数（0-100）和危险等级
  - `programmatic` TR-3.3: 可视化图表正确渲染
  - `human-judgement` TR-3.4: 评语风格符合黑色幽默要求
  - `programmatic` TR-3.5: 预留后端API接口占位
- **Notes**: 指数计算算法可采用关键词匹配+随机因子的简单方式

## [x] Task 4: 实现"疯"友急救中心模块
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 实现急救中心触发逻辑（指数超阈值或主动点击）
  - 实现一键呼叫紧急联系人功能（界面+本地存储联系人）
  - 实现1-2个简单在线解压小游戏（如砸核桃模拟器，原生canvas实现）
  - 实现专业咨询入口转介按钮
  - 预留后端短信/消息推送API接口
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-4.1: 指数超阈值时自动进入急救中心
  - `programmatic` TR-4.2: 点击"我不行了"按钮进入急救中心
  - `programmatic` TR-4.3: 解压小游戏能正常运行
  - `programmatic` TR-4.4: 专业咨询按钮可点击跳转
  - `programmatic` TR-4.5: 预留后端API接口占位
- **Notes**: 小游戏优先实现简单的点击类交互

## [x] Task 5: 实现风险行为自检工具
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 实现疯狂想法输入界面（原生textarea）
  - 开发代价计算逻辑（法律、社会、治疗三方面，前端实现）
  - 实现代价可视化展示（卡片式或进度条）
  - 建立替代行为推荐库
  - 预留后端分析API接口
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `programmatic` TR-5.1: 想法输入和提交功能正常
  - `programmatic` TR-5.2: 三方面代价计算并显示
  - `programmatic` TR-5.3: 替代行为推荐正常展示
  - `programmatic` TR-5.4: 预留后端API接口占位
- **Notes**: 可预设常见疯狂想法和对应的替代方案

## [x] Task 6: 实现人生计算器功能
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 实现年龄和现状输入界面（原生picker选择器）
  - 开发"疯狂余额"计算逻辑（前端实现）
  - 实现余额可视化展示（进度条或倒计时样式）
  - 实现幽默建议文案库
  - 预留后端API接口
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `programmatic` TR-6.1: 输入表单和提交功能正常
  - `programmatic` TR-6.2: "疯狂余额"计算并显示
  - `human-judgement` TR-6.3: 建议文案风格符合要求
  - `programmatic` TR-6.4: 预留后端API接口占位
- **Notes**: 余额计算可基于平均寿命减去当前年龄的简单逻辑

## [x] Task 7: 实现风险控制与危机识别
- **Priority**: P0
- **Depends On**: Task 3, Task 5
- **Description**: 
  - 建立敏感词库（自残、自杀、伤害他人等）
  - 实现敏感词监控和触发逻辑（前端实现）
  - 实现紧急情况弹窗（显示生命热线，原生风格）
  - 确保紧急情况时屏蔽所有娱乐内容
  - 预留后端敏感词审核API接口
- **Acceptance Criteria Addressed**: [AC-6]
- **Test Requirements**:
  - `programmatic` TR-7.1: 敏感词输入后触发预警
  - `programmatic` TR-7.2: 预警时显示生命热线弹窗
  - `programmatic` TR-7.3: 预警时娱乐内容被屏蔽
  - `programmatic` TR-7.4: 预留后端API接口占位
- **Notes**: 这是重要的安全功能，必须优先保证

## [/] Task 8: 原生APP体验优化与适配
- **Priority**: P1
- **Depends On**: Task 1-7
- **Description**: 
  - 优化页面转场动画（原生风格）
  - 适配iOS和Android不同尺寸设备
  - 优化触摸反馈和交互体验
  - 测试在真机上的表现
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `human-judgement` TR-8.1: 页面转场流畅自然
  - `human-judgement` TR-8.2: 各设备布局合理
  - `human-judgement` TR-8.3: 整体体验接近原生APP
- **Notes**: 优先使用uniapp原生API而非H5特性

## [x] Task 9: 整体测试与优化
- **Priority**: P1
- **Depends On**: Task 1-8
- **Description**: 
  - 端到端功能测试
  - 性能优化（确保页面切换流畅）
  - UI/UX细节优化
  - Bug修复
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4, AC-5, AC-6]
- **Test Requirements**:
  - `programmatic` TR-9.1: 所有功能测试通过
  - `human-judgement` TR-9.2: 整体体验流畅自然，像原生APP
