<script setup lang="ts">
import { ref, computed, onShow } from 'vue'
import taskSystem from '@/utils/taskSystem'
import { isLogin } from '@/api'

const activeTab = ref('daily')
const isLoggedIn = ref(false)

const dailyTasks = computed(() => taskSystem.getDailyTasks())
const achievementTasks = computed(() => taskSystem.getAchievementTasks())
const challengeTasks = computed(() => taskSystem.getChallengeTasks())

const totalPoints = computed(() => taskSystem.getTotalCrazyPoints())
const todayPoints = computed(() => taskSystem.getDailyEarned())

const switchTab = (tab: string) => {
  activeTab.value = tab
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/auth/login' })
}

onShow(() => {
  isLoggedIn.value = isLogin()
})
</script>

<template>
  <view class="container">
    <view v-if="!isLoggedIn" class="login-prompt">
      <view class="user-card">
        <view class="avatar">
          <text class="avatar-text">疯</text>
        </view>
        <view class="user-info">
          <text class="nickname">匿名疯友</text>
          <text class="user-id">体验模式，数据仅保存在本地</text>
        </view>
      </view>
      <view class="login-btn-container">
        <view class="login-btn" @click="goToLogin">
          <text class="login-btn-text">立即登录</text>
        </view>
      </view>
      <view class="menu-card">
        <view class="prompt-desc">
          <text class="prompt-icon">📋</text>
          <text class="prompt-text">登录后才能使用任务中心</text>
        </view>
      </view>
    </view>
    
    <template v-else>
      <view class="header">
        <view class="stats-card">
          <view class="stat-item">
            <text class="stat-value">{{ totalPoints }}</text>
            <text class="stat-label">累计疯度</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ todayPoints }}</text>
            <text class="stat-label">今日获得</text>
          </view>
        </view>
      </view>

      <view class="tabs">
        <view 
          class="tab-item" 
          :class="{ 'active': activeTab === 'daily' }"
          @click="switchTab('daily')"
        >
          <text class="tab-text">每日任务</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ 'active': activeTab === 'achievement' }"
          @click="switchTab('achievement')"
        >
          <text class="tab-text">成就任务</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ 'active': activeTab === 'challenge' }"
          @click="switchTab('challenge')"
        >
          <text class="tab-text">限时挑战</text>
        </view>
      </view>

      <view class="content">
        <view v-if="activeTab === 'daily'" class="task-list">
          <view v-for="task in dailyTasks" :key="task.id" class="task-item">
            <view class="task-icon">{{ task.icon }}</view>
            <view class="task-info">
              <text class="task-name">{{ task.name }}</text>
              <text class="task-desc">{{ task.description }}</text>
            </view>
            <view class="task-points">
              <text class="points-value">+{{ task.crazyPoints }}</text>
              <text class="points-label">疯度</text>
            </view>
            <view v-if="task.completed" class="task-status completed">
              <text class="status-text">已完成</text>
            </view>
            <view v-else class="task-status">
              <text class="status-text">去完成</text>
            </view>
          </view>
        </view>

        <view v-if="activeTab === 'achievement'" class="task-list">
          <view v-for="task in achievementTasks" :key="task.id" class="task-item">
            <view class="task-icon">{{ task.icon }}</view>
            <view class="task-info">
              <text class="task-name">{{ task.name }}</text>
              <text class="task-desc">{{ task.description }}</text>
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: Math.min(100, (task.current / task.target) * 100) + '%' }"></view>
              </view>
              <text class="progress-text">{{ task.current }}/{{ task.target }}</text>
            </view>
            <view class="task-points">
              <text class="points-value">+{{ task.crazyPoints }}</text>
              <text class="points-label">疯度</text>
            </view>
            <view v-if="task.unlocked" class="task-status completed">
              <text class="status-text">已解锁</text>
            </view>
            <view v-else class="task-status">
              <text class="status-text">进行中</text>
            </view>
          </view>
        </view>

        <view v-if="activeTab === 'challenge'" class="task-list">
          <view v-for="task in challengeTasks" :key="task.id" class="task-item">
            <view class="task-icon">{{ task.icon }}</view>
            <view class="task-info">
              <text class="task-name">{{ task.name }}</text>
              <text class="task-desc">{{ task.description }}</text>
            </view>
            <view class="task-points">
              <text class="points-value">+{{ task.crazyPoints }}</text>
              <text class="points-label">疯度</text>
            </view>
            <view v-if="!task.available" class="task-status unavailable">
              <text class="status-text">未开放</text>
            </view>
            <view v-else-if="task.completed" class="task-status completed">
              <text class="status-text">已完成</text>
            </view>
            <view v-else class="task-status">
              <text class="status-text">去挑战</text>
            </view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #F5F5F7;
  padding-bottom: calc(32rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.login-prompt {
  padding: 40rpx 32rpx;
}

.user-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 32rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 48rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 36rpx;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 8rpx;
}

.user-id {
  font-size: 26rpx;
  color: #999;
}

.login-btn-container {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.login-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(34, 215, 255, 0.3);
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.login-btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.menu-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin: 0 0 32rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  padding: 32rpx;
}

.prompt-desc {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.prompt-icon {
  font-size: 40rpx;
}

.prompt-text {
  font-size: 28rpx;
  color: #666;
  flex: 1;
}

.header {
  padding: 32rpx;
  background: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
}

.stats-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 800;
  color: #22D7FF;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #8E8E93;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #E5E5EA;
}

.tabs {
  display: flex;
  background: #FFFFFF;
  padding: 16rpx 32rpx;
  gap: 16rpx;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.tab-item {
  flex: 1;
  padding: 16rpx 0;
  text-align: center;
  border-radius: 16rpx;
  transition: all 0.2s;
}

.tab-item.active {
  background: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
}

.tab-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #8E8E93;
}

.tab-item.active .tab-text {
  color: #FFFFFF;
  font-weight: 600;
}

.content {
  padding: 32rpx;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.task-item {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
}

.task-item:active {
  transform: scale(0.98);
}

.task-icon {
  font-size: 48rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F7;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.task-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1C1C1E;
}

.task-desc {
  font-size: 24rpx;
  color: #8E8E93;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background: #F5F5F7;
  border-radius: 4rpx;
  margin-top: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
  border-radius: 4rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 22rpx;
  color: #8E8E93;
  margin-top: 4rpx;
}

.task-points {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}

.points-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #22D7FF;
}

.points-label {
  font-size: 20rpx;
  color: #8E8E93;
}

.task-status {
  padding: 12rpx 24rpx;
  background: #F5F5F7;
  border-radius: 100rpx;
  flex-shrink: 0;
}

.task-status.completed {
  background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
}

.task-status.unavailable {
  background: #E5E5EA;
}

.status-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #8E8E93;
}

.task-status.completed .status-text {
  color: #FFFFFF;
}

.task-status.unavailable .status-text {
  color: #AEAEB2;
}
</style>
