# 个人中心疯度档案优化 Spec

## Why
当前个人中心的数据结构未同步首页新增的"疯度值"系统，需要让个人中心展示完整的疯友档案信息，与首页的签到系统形成数据联动和统一体验。

## What Changes
- 同步签到数据结构（新增 crazyPoints、joinDate 字段）
- 个人中心新增"疯度档案"模块，展示总疯度、疯度等级、加入日期
- 增加基于疯度值的成就徽章体系
- 首页底部简化显示，点击可跳转个人中心查看详情

## Impact
- Affected specs: 首页签到系统、个人中心
- Affected code: pages/mine/index.vue, pages/index/index.vue

## ADDED Requirements

### Requirement: 疯度档案展示
系统 SHALL 在个人中心提供完整的疯度档案展示页面。

#### Scenario: 用户查看个人中心
- **WHEN** 用户进入个人中心页面
- **THEN** 显示疯度档案区域，包含：总疯度值、疯度等级、加入日期、连续签到天数

### Requirement: 疯度徽章体系
系统 SHALL 提供基于疯度值解锁的成就徽章。

#### Scenario: 疯度值达标解锁徽章
- **WHEN** 用户总疯度值达到指定门槛
- **THEN** 对应徽章从锁定状态变为解锁状态

| 疯度值门槛 | 徽章名称 | 图标 |
|-----------|---------|------|
| 100 | 初露头角 | 🌱 |
| 500 | 渐入佳境 | 🌿 |
| 1000 | 小有名气 | 🌳 |
| 3000 | 声名鹊起 | 🔥 |
| 10000 | 疯名远扬 | 👑 |

## MODIFIED Requirements

### Requirement: 个人中心数据读取
**MODIFIED**: 读取签到数据时，同步读取新的字段（crazyPoints、joinDate）。

### Requirement: 首页签到显示
**MODIFIED**: 首页底部信息栏简化为显示"疯度等级图标 + 等级名称"，增加点击跳转个人中心功能。

## REMOVED Requirements
无

## 数据结构更新

### checkinData 完整结构
```typescript
interface CheckinData {
  lastDate: string          // 最后签到日期
  continuousDays: number    // 连续签到天数
  totalDays: number         // 累计签到天数
  crazyPoints: number       // 总疯度值
  joinDate: string          // 加入疯友联盟日期
}
```

### CrazyLevel 等级体系
| 连续天数或疯度值 | 等级名称 | 图标 | 描述 |
|----------------|---------|------|------|
| <1天 或 0 | 潜水路人 | 🚶 | 还没开始发疯，快来报到 |
| ≥1天 或 ≥1 | 初入疯途 | 🌱 | 恭喜你，正式成为疯友 |
| ≥7天 或 ≥300 | 疯途新秀 | 🚀 | 踏上疯途，小有名气 |
| ≥30天 或 ≥1000 | 小疯初成 | 🌟 | 初具疯形，未来可期 |
| ≥100天 或 ≥3000 | 疯林盟主 | 🏆 | 一方霸主，疯名远扬 |
| ≥365天 或 ≥10000 | 疯神降临 | 👑 | 疯界天花板，疯得惊天动地 |
