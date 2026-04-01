<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMyAchievements, receiveAchievementReward, checkAchievements, type Achievement } from '@/api'

const achievements = ref<Achievement[]>([])
const loading = ref(false)
const refreshing = ref(false)

const loadAchievements = async () => {
  try {
    loading.value = true
    const res = await getMyAchievements()
    achievements.value = res.data || []
  } catch (error) {
    console.error('加载成就失败', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const checkNewAchievements = async () => {
  try {
    refreshing.value = true
    const res = await checkAchievements()
    if (res.data.count > 0) {
      uni.showToast({
        title: `解锁${res.data.count}个新成就！`,
        icon: 'success'
      })
      await loadAchievements()
    }
  } catch (error) {
    console.error('检查成就失败', error)
  } finally {
    refreshing.value = false
  }
}

const receiveReward = async (achievement: Achievement) => {
  try {
    uni.showLoading({ title: '领取中...' })
    await receiveAchievementReward(achievement.id)
    uni.showToast({
      title: `获得${achievement.reward_points}疯度`,
      icon: 'success'
    })
    await loadAchievements()
  } catch (error) {
    console.error('领取奖励失败', error)
    uni.showToast({
      title: '领取失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    checkin: '签到成就',
    continuous: '连续签到',
    total: '累计成就',
    level: '等级成就',
    special: '特殊成就'
  }
  return typeMap[type] || '其他成就'
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    checkin: '#22D7FF',
    continuous: '#FF6B6B',
    total: '#FFD93D',
    level: '#6BCB77',
    special: '#A66CFF'
  }
  return colorMap[type] || '#999999'
}

const getConditionText = (achievement: Achievement) => {
  const condition = achievement.condition
  if (!condition) return '未知条件'
  
  if (achievement.type === 'checkin' && condition.checkin_count) {
    return `累计签到${condition.checkin_count}天`
  }
  if (achievement.type === 'continuous' && condition.continuous_days) {
    return `连续签到${condition.continuous_days}天`
  }
  if (achievement.type === 'total' && condition.total_points) {
    return `累计疯度达到${condition.total_points}`
  }
  if (achievement.type === 'level' && condition.level) {
    return `等级达到${condition.level}级`
  }
  if (achievement.type === 'special' && condition.checkin_hour) {
    return `在特定时间段签到`
  }
  
  return '完成特定条件'
}

onMounted(() => {
  loadAchievements()
  checkNewAchievements()
})
</script>

<template>
  <view class="container">
    <view class="header">
      <text class="header-title">我的成就</text>
      <view class="header-actions">
        <view class="refresh-btn" :class="{ refreshing }" @click="checkNewAchievements">
          <text class="refresh-icon">{{ refreshing ? '⏳' : '🔄' }}</text>
          <text class="refresh-text">{{ refreshing ? '检查中' : '检查' }}</text>
        </view>
      </view>
    </view>

    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else class="achievement-list">
      <view
        v-for="achievement in achievements"
        :key="achievement.id"
        class="achievement-item"
        :class="{
          'achieved': achievement.is_achieved,
          'not-achieved': !achievement.is_achieved
        }"
      >
        <view class="achievement-icon">
          <text class="icon-emoji">{{ achievement.icon }}</text>
          <view v-if="!achievement.is_achieved" class="lock-overlay">
            <text class="lock-icon">🔒</text>
          </view>
        </view>
        
        <view class="achievement-info">
          <view class="achievement-header">
            <text class="achievement-name">{{ achievement.name }}</text>
            <view class="achievement-type" :style="{ background: getTypeColor(achievement.type) }">
              <text class="type-text">{{ getTypeText(achievement.type) }}</text>
            </view>
          </view>
          
          <text class="achievement-desc">{{ achievement.description }}</text>
          
          <view v-if="achievement.is_achieved" class="achievement-reward">
            <text class="reward-label">奖励</text>
            <text class="reward-value">+{{ achievement.reward_points }} 疯度</text>
          </view>
          
          <view v-else class="achievement-condition">
            <text class="condition-label">达成条件</text>
            <text class="condition-text">{{ getConditionText(achievement) }}</text>
          </view>
        </view>
        
        <view v-if="achievement.is_achieved && !achievement.is_received" class="achievement-action">
          <button class="receive-btn" @click="receiveReward(achievement)">
            <text class="receive-btn-text">领取奖励</text>
          </button>
        </view>
        
        <view v-else-if="achievement.is_achieved && achievement.is_received" class="achievement-status">
          <text class="status-text">已领取</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #e4e8ec 100%);
  padding: 30rpx;
  padding-top: calc(30rpx + constant(safe-area-inset-top));
  padding-top: calc(30rpx + env(safe-area-inset-top));
  padding-bottom: 30rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.header-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.header-actions {
  display: flex;
  gap: 16rpx;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.refreshing {
    opacity: 0.6;
    pointer-events: none;
  }
}

.refresh-icon {
  font-size: 20rpx;
}

.refresh-text {
  font-size: 22rpx;
  color: #666666;
  font-weight: 600;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999999;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.achievement-item {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  
  &.not-achieved {
    opacity: 0.6;
    background: rgba(240, 240, 240, 0.65);
  }
}

.achievement-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.icon-emoji {
  font-size: 48rpx;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-icon {
  font-size: 32rpx;
}

.achievement-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.achievement-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.achievement-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.achievement-type {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.type-text {
  font-size: 20rpx;
  color: #ffffff;
  font-weight: 600;
}

.achievement-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.5;
}

.achievement-reward {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 4rpx;
}

.reward-label {
  font-size: 22rpx;
  color: #999999;
}

.reward-value {
  font-size: 24rpx;
  color: #FFD93D;
  font-weight: 700;
}

.achievement-condition {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 4rpx;
}

.condition-label {
  font-size: 22rpx;
  color: #999999;
}

.condition-text {
  font-size: 24rpx;
  color: #666666;
}

.achievement-action {
  flex-shrink: 0;
}

.receive-btn {
  width: 120rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #22D7FF 0%, #00B894 100%);
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  
  &:active {
    transform: scale(0.95);
    opacity: 0.85;
  }
}

.receive-btn-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 600;
}

.achievement-status {
  flex-shrink: 0;
  padding: 0 20rpx;
}

.status-text {
  font-size: 24rpx;
  color: #999999;
  font-weight: 600;
}
</style>
