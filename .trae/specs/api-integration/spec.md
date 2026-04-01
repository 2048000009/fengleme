# 疯了么前后端完全对接规范

## Why
当前项目前端功能已实现，但前后端对接不完整：
- 首页代码混乱，同时存在本地存储和API调用两套逻辑
- 排行榜、测试功能等模块仍使用模拟数据
- 后端API已提供但前端未调用
- 需要完全打通前后端数据流，实现真正的数据持久化

## What Changes
- **修复首页代码冲突**：清理本地storage逻辑，统一使用API
- **对接排行榜API**：替换模拟数据为真实后端数据
- **对接消息系统**：实现消息列表、未读数、标记已读
- **对接反馈系统**：实现反馈提交和列表查询
- **补充后端缺失API**：疯情测试、人生计算、疯险自检、紧急联系人
- **修复其他页面**：mood、life、risk、rescue页面对接API
- **统一错误处理**：完善网络错误、登录过期等场景处理

## Impact
- 所有前端页面数据将从后端获取
- 用户数据实现跨设备同步
- 排行榜显示真实用户排名
- 消息系统可正常使用

## ADDED Requirements

### Requirement: 首页代码清理与API对接
首页 SHALL 统一使用API获取数据，移除本地storage逻辑

#### Scenario: 页面加载
- **WHEN** 用户打开首页
- **THEN** 调用 `/api/user/login` 自动登录
- **AND** 调用 `/api/user/info` 获取用户信息
- **AND** 调用 `/api/checkin/stats` 获取签到状态

#### Scenario: 用户签到
- **WHEN** 用户点击签到按钮
- **THEN** 调用 `/api/checkin/do` 执行签到
- **AND** 更新页面显示签到结果

### Requirement: 排行榜API对接
排行榜 SHALL 从后端获取真实数据

#### Scenario: 加载排行榜
- **WHEN** 用户进入排行榜页面
- **THEN** 调用 `/api/ranking/list` 获取排行榜列表
- **AND** 调用 `/api/ranking/my` 获取我的排名
- **AND** 显示真实用户数据

### Requirement: 消息系统API对接
消息系统 SHALL 完整对接后端API

#### Scenario: 获取消息列表
- **WHEN** 用户进入消息中心
- **THEN** 调用 `/api/messages/list` 获取消息列表
- **AND** 支持分页加载

#### Scenario: 获取未读数
- **WHEN** 页面加载或定时刷新
- **THEN** 调用 `/api/messages/unread` 获取未读消息数
- **AND** 在tabbar显示红点提示

#### Scenario: 标记已读
- **WHEN** 用户阅读消息
- **THEN** 调用 `/api/messages/read` 标记单条已读
- **OR** 调用 `/api/messages/read-all` 标记全部已读

### Requirement: 反馈系统API对接
反馈系统 SHALL 对接后端API

#### Scenario: 提交反馈
- **WHEN** 用户提交反馈
- **THEN** 调用 `/api/feedback/submit` 提交反馈内容
- **AND** 显示提交成功提示

#### Scenario: 查看反馈历史
- **WHEN** 用户进入反馈列表
- **THEN** 调用 `/api/feedback/list` 获取历史反馈

### Requirement: 后端API补充
后端 SHALL 提供以下缺失的API接口

#### API List:
- `POST /api/mood/calculate` - 疯情指数计算
- `POST /api/life/calculate` - 人生计算器
- `POST /api/risk/calculate` - 疯险自检
- `GET /api/rescue/contacts` - 获取紧急联系人
- `POST /api/rescue/contacts` - 添加紧急联系人
- `POST /api/rescue/contacts/:id` - 更新紧急联系人
- `POST /api/rescue/contacts/:id/delete` - 删除紧急联系人
- `POST /api/rescue/sos` - 发送SOS求救
- `GET /api/rescue/hotlines` - 获取心理热线
- `POST /api/safety/check-sensitive-words` - 敏感词检测

### Requirement: 其他页面对接
mood、life、risk、rescue页面 SHALL 对接相应API

#### Scenario: 疯情测试
- **WHEN** 用户完成疯情测试
- **THEN** 调用 `/api/mood/calculate` 提交测试数据
- **AND** 显示计算结果

#### Scenario: 人生计算
- **WHEN** 用户提交人生计算
- **THEN** 调用 `/api/life/calculate` 提交数据
- **AND** 显示计算结果

#### Scenario: 疯险自检
- **WHEN** 用户完成疯险自检
- **THEN** 调用 `/api/risk/calculate` 提交数据
- **AND** 显示评估结果

#### Scenario: 紧急联系人管理
- **WHEN** 用户管理紧急联系人
- **THEN** 调用相应 `/api/rescue/contacts` 接口
- **AND** 同步数据到后端

## MODIFIED Requirements
无修改现有需求，全部为新增对接功能

## REMOVED Requirements
### Requirement: 本地Storage数据存储
**Reason**: 数据需要同步到后端实现跨设备访问
**Migration**: 所有数据通过API获取和提交，本地仅缓存token
