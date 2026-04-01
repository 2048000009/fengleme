# 前后端完全对接验收清单

## 后端API开发验收

### Mood控制器
- [ ] `POST /api/mood/calculate` 接口已实现
- [ ] 接口接收text和emotionTags参数
- [ ] 接口返回index、level、levelText、comment
- [ ] 测试记录保存到数据库
- [ ] 路由配置正确

### Life控制器
- [ ] `POST /api/life/calculate` 接口已实现
- [ ] 接口接收birthDate和lifestyle参数
- [ ] 接口返回years、months、totalMonths、suggestion
- [ ] 计算记录保存到数据库
- [ ] 路由配置正确

### Risk控制器
- [ ] `POST /api/risk/calculate` 接口已实现
- [ ] 接口接收answers数组参数
- [ ] 接口返回legal、social、medical评分
- [ ] 接口返回alternatives建议和comment
- [ ] 自检记录保存到数据库
- [ ] 路由配置正确

### Rescue控制器
- [ ] `GET /api/rescue/contacts` 获取联系人列表
- [ ] `POST /api/rescue/contacts` 添加联系人
- [ ] `POST /api/rescue/contacts/:id` 更新联系人
- [ ] `POST /api/rescue/contacts/:id/delete` 删除联系人
- [ ] `POST /api/rescue/sos` 发送SOS求救
- [ ] `GET /api/rescue/hotlines` 获取心理热线
- [ ] 所有路由配置正确

### Safety控制器
- [ ] `POST /api/safety/check-sensitive-words` 接口已实现
- [ ] 敏感词库已建立
- [ ] 接口返回hasSensitiveWords和matchedWords
- [ ] 路由配置正确

### 数据库表
- [ ] mood_test记录表已创建
- [ ] life_calc记录表已创建
- [ ] risk_check记录表已创建
- [ ] rescue_contacts表已创建
- [ ] hotlines表已创建

## 前端页面对接验收

### 首页 (pages/index/index.vue)
- [ ] 已删除本地storage相关import
- [ ] 已删除CHECKIN_KEY等本地存储key
- [ ] 已删除loadCheckinData等本地存储方法
- [ ] 保留并使用API import
- [ ] loadData方法正确调用login、getUserInfo、getCheckinStats
- [ ] checkIn方法调用doCheckin API
- [ ] 页面数据使用API返回的数据
- [ ] 页面加载正常
- [ ] 自动登录成功
- [ ] 签到功能正常
- [ ] 数据正确显示

### 排行榜 (pages/ranking/index.vue)
- [ ] 已添加API import
- [ ] 已删除generateRankingData模拟数据方法
- [ ] 已删除nicknames、avatarColors等模拟数据
- [ ] 实现loadRankingData调用API
- [ ] 使用API数据渲染列表
- [ ] 实现我的排名显示
- [ ] 排行榜数据正确显示
- [ ] 我的排名正确显示
- [ ] 切换tab正常

### 消息系统 (pages/messages/index.vue)
- [ ] 页面已创建/修改
- [ ] 已添加API import
- [ ] 实现消息列表UI
- [ ] 调用getMessageList获取消息
- [ ] 实现下拉刷新和上拉加载
- [ ] 调用getUnreadCount获取未读数
- [ ] tabbar显示红点提示
- [ ] 实现markMessageRead标记已读
- [ ] 实现markAllRead全部已读
- [ ] 消息列表正常显示
- [ ] 未读数正确显示
- [ ] 标记已读功能正常

### 反馈系统 (pages/feedback/index.vue)
- [ ] 页面已创建/修改
- [ ] 已添加API import
- [ ] 实现反馈表单UI
- [ ] 调用submitFeedback提交反馈
- [ ] 表单验证正常
- [ ] 提交成功提示
- [ ] 实现反馈历史列表
- [ ] 调用getFeedbackList获取列表
- [ ] 反馈提交成功
- [ ] 反馈列表正常显示

### 疯情测试 (pages/mood/index.vue)
- [ ] 已添加API import
- [ ] 保留前端测试题目
- [ ] 用户完成测试后调用calculateMoodIndex
- [ ] 显示API返回的结果
- [ ] 测试流程正常
- [ ] 结果正确显示
- [ ] 数据保存到后端

### 人生计算器 (pages/life/index.vue)
- [ ] 已添加API import
- [ ] 保留前端输入表单
- [ ] 用户提交后调用calculateLifeBalance
- [ ] 显示API返回的结果
- [ ] 计算流程正常
- [ ] 结果正确显示
- [ ] 数据保存到后端

### 疯险自检 (pages/risk/index.vue)
- [ ] 已添加API import
- [ ] 保留前端测试题目
- [ ] 用户完成后调用calculateRisk
- [ ] 显示API返回的评分和建议
- [ ] 自检流程正常
- [ ] 结果正确显示
- [ ] 数据保存到后端

### 急救中心 (pages/rescue/index.vue)
- [ ] 已添加API import
- [ ] 调用getContacts获取联系人
- [ ] 调用API添加、编辑、删除联系人
- [ ] 点击SOS调用sendSOS
- [ ] 调用getHotlines获取热线
- [ ] 联系人管理正常
- [ ] SOS功能正常
- [ ] 热线显示正常

### 我的页面 (pages/mine/index.vue)
- [ ] 已添加API import
- [ ] 页面加载调用getUserInfo
- [ ] 用户信息正确显示
- [ ] 实现编辑资料调用updateUserInfo
- [ ] 消息中心入口正常
- [ ] 编辑资料功能正常

## 错误处理验收

### request.ts
- [ ] 401错误正确处理
- [ ] 网络错误提示友好
- [ ] 登录过期跳转正常

### 各页面错误处理
- [ ] API调用有try-catch
- [ ] 显示友好的错误提示
- [ ] 有重试机制

## 整体测试验收

### 功能测试
- [ ] 所有页面正常访问
- [ ] 所有API调用正常
- [ ] 数据正确显示

### 兼容性测试
- [ ] 不同网络环境正常
- [ ] 登录状态过期处理正常
- [ ] 异常情况处理正常

### 性能测试
- [ ] 页面加载速度 < 2秒
- [ ] API响应时间正常
- [ ] 大数据量处理正常
