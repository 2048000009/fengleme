<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storage } from '@/utils/storage'
import taskSystem from '@/utils/taskSystem'
import { STORAGE_KEYS } from '@/utils/constants'
import { getRankingList, getMyRank } from '@/api'

type TabType = 'points' | 'mood' | 'risk' | 'lying'

interface RankingItem {
  id: number
  rank: number
  nickname: string
  avatar: string
  points: number
  level: number
  continuousDays: number
}

interface MyRankData {
  rank: number
  nickname: string
  avatar: string
  points: number
  level: number
  continuousDays: number
}

const currentTab = ref<TabType>('points')
const showRewardModal = ref(false)
const rewardType = ref<'daily' | 'weekly' | 'monthly'>('daily')
const rewardResult = ref<{ success: boolean; points: number; title: string } | null>(null)
const lastUpdateTime = ref(Date.now())
const isRefreshing = ref(false)
const isLoading = ref(false)
const loadingError = ref<string | null>(null)
let refreshTimer: number | null = null

const tabs = [
  { id: 'points', name: '疯度总榜', icon: '🔥' },
  { id: 'mood', name: '疯情表现榜', icon: '📊' },
  { id: 'risk', name: '疯险探索榜', icon: '⚠️' },
  { id: 'lying', name: '摆烂艺术榜', icon: '🛋️' }
]

const rankingData = ref<Record<TabType, RankingItem[]>>({
  points: [],
  mood: [],
  risk: [],
  lying: []
})

const myRankData = ref<MyRankData | null>(null)

const currentRanking = computed(() => {
  return rankingData.value[currentTab.value] || []
})

const myRank = computed(() => {
  if (myRankData.value) {
    return {
      rank: myRankData.value.rank,
      score: myRankData.value.points
    }
  }
  return null
})

const loadRankingData = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  loadingError.value = null
  
  try {
    const [listRes, myRankRes] = await Promise.all([
      getRankingList(currentTab.value, 1, 50),
      getMyRank(currentTab.value)
    ])
    
    if (listRes.code === 200 && listRes.data) {
      rankingData.value[currentTab.value] = listRes.data.list || []
    } else {
      loadingError.value = listRes.message || '获取排行榜数据失败'
    }
    
    if (myRankRes.code === 200 && myRankRes.data) {
      myRankData.value = myRankRes.data
    }
    
    lastUpdateTime.value = Date.now()
  } catch (error) {
    console.error('加载排行榜数据失败:', error)
    loadingError.value = '网络错误，请稍后重试'
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

const rewardStatus = computed(() => {
  if (!myRank.value) return null
  return taskSystem.getRankingRewardStatus(myRank.value.rank)
})

const switchTab = (tab: TabType) => {
  uni.vibrateShort({ type: 'light' })
  currentTab.value = tab
  // 切换标签时加载对应数据
  loadRankingData()
}

const claimReward = (type: 'daily' | 'weekly' | 'monthly') => {
  if (!myRank.value) return
  
  rewardType.value = type
  
  if (type === 'daily') {
    const points = taskSystem.claimDailyRankingReward(myRank.value.rank)
    if (points > 0) {
      rewardResult.value = { success: true, points, title: '每日奖励' }
    } else {
      rewardResult.value = { success: false, points: 0, title: '已领取' }
    }
  } else if (type === 'weekly') {
    rewardResult.value = taskSystem.claimWeeklyRankingReward(myRank.value.rank)
  } else if (type === 'monthly') {
    rewardResult.value = taskSystem.claimMonthlyRankingReward(myRank.value.rank)
  }
  
  showRewardModal.value = true
}

const closeRewardModal = () => {
  uni.vibrateShort({ type: 'light' })
  showRewardModal.value = false
  rewardResult.value = null
}

const refreshRanking = async () => {
  if (isRefreshing.value || isLoading.value) return
  
  isRefreshing.value = true
  uni.vibrateShort({ type: 'light' })
  
  await loadRankingData()
  
  isRefreshing.value = false
  
  if (!loadingError.value) {
    uni.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1500
    })
  }
}

const getTimeSinceUpdate = () => {
  const now = Date.now()
  const diff = now - lastUpdateTime.value
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/auth/login' })
}

onMounted(() => {
  isLoggedIn.value = isLogin()
  // 初始加载数据
  if (isLoggedIn.value) {
    loadRankingData()
  }
  
  // 设置自动刷新定时器
  refreshTimer = setInterval(() => {
    if (isLoggedIn.value) {
      const now = Date.now()
      const diff = now - lastUpdateTime.value
      if (diff >= 5 * 60 * 1000) {
        loadRankingData()
      }
    }
  }, 60 * 1000) as unknown as number
})

onShow(() => {
  isLoggedIn.value = isLogin()
  if (isLoggedIn.value && currentRanking.value.length === 0) {
    loadRankingData()
  }
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

const getRankStyle = (rank: number) => {
  if (rank === 1) return { bg: 'rgba(251, 191, 36, 0.85)', color: '#fff', isTop: true }
  if (rank === 2) return { bg: 'rgba(148, 163, 184, 0.85)', color: '#fff', isTop: true }
  if (rank === 3) return { bg: 'rgba(205, 127, 50, 0.85)', color: '#fff', isTop: true }
  return { bg: 'rgba(255, 255, 255, 0.6)', color: '#333333', isTop: false }
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#ef4444'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#22c55e'
  return '#10b981'
}

const getTabColor = computed(() => {
  const tab = tabs.find(t => t.id === currentTab.value)
  if (tab?.id === 'crazy') return 'rgba(239, 68, 68, 0.85)'
  if (tab?.id === 'mood') return 'rgba(102, 126, 234, 0.85)'
  if (tab?.id === 'risk') return 'rgba(245, 158, 11, 0.85)'
  return 'rgba(17, 153, 142, 0.85)'
})

// 获取用户等级颜色
const getLevelColor = (level: number) => {
  if (level >= 10) return '#ef4444'
  if (level >= 7) return '#f59e0b'
  if (level >= 4) return '#22c55e'
  return '#3b82f6'
}
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
          <text class="prompt-icon">🏆</text>
          <text class="prompt-text">登录后才能查看排行榜</text>
        </view>
      </view>
    </view>
    
    <template v-else>
      <view class="bg-layer">
        <view class="gradient-blob blob-1"></view>
        <view class="gradient-blob blob-2"></view>
        <view class="gradient-blob blob-3"></view>
      </view>
      
      <view class="content">
      <view class="header">
        <view class="header-left">
          <text class="header-title">发疯排行榜</text>
          <text class="header-subtitle">看看谁是疯批之王</text>
        </view>
        <view class="header-right">
          <view class="refresh-btn" @click="refreshRanking" :class="{ refreshing: isRefreshing }">
            <text class="refresh-icon">{{ isRefreshing ? '⏳' : '🔄' }}</text>
            <text class="refresh-text">{{ isRefreshing ? '刷新中' : '刷新' }}</text>
          </view>
        </view>
      </view>

      <view class="tab-bar">
        <view
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ active: currentTab === tab.id }"
          @click="switchTab(tab.id as TabType)"
        >
          <text class="tab-icon">{{ tab.icon }}</text>
          <text class="tab-name">{{ tab.name }}</text>
        </view>
      </view>

      <view v-if="myRankData && rewardStatus" class="my-rank-card">
        <view class="my-rank-left">
          <view class="my-avatar" :style="{ background: myRankData.avatar || getTabColor }">
            <text class="my-initial">{{ myRankData.nickname ? myRankData.nickname.charAt(0) : '我' }}</text>
          </view>
          <view class="my-info">
            <text class="my-rank-label">我的排名</text>
            <text class="my-rank-value">第 {{ myRankData.rank }} 名</text>
          </view>
        </view>
        <view class="my-rank-right">
          <text class="my-score" :style="{ color: getScoreColor(myRankData.points) }">{{ myRankData.points }}分</text>
          <view class="reward-btn" @click="claimReward('daily')">
            <text class="reward-btn-text">{{ rewardStatus.daily.canClaim ? '领奖' : '已领' }}</text>
          </view>
        </view>
      </view>

      <view v-if="myRank && rewardStatus" class="reward-section">
        <view class="reward-title">
          <text class="reward-title-text">🎁 排名奖励</text>
        </view>
        <view class="reward-list">
          <view 
            class="reward-item"
            :class="{ 
              'can-claim': rewardStatus.weekly.canClaim,
              'claimed': rewardStatus.weekly.claimed,
              'disabled': !rewardStatus.weekly.canClaim && !rewardStatus.weekly.claimed
            }"
            @click="claimReward('weekly')"
          >
            <view class="reward-item-left">
              <text class="reward-item-icon">🏆</text>
              <view class="reward-item-info">
                <text class="reward-item-name">每周奖励</text>
                <text class="reward-item-title" v-if="rewardStatus.weekly.title">{{ rewardStatus.weekly.title }}</text>
              </view>
            </view>
            <view class="reward-item-right">
              <text class="reward-item-points">+{{ rewardStatus.weekly.points }}</text>
              <text class="reward-item-status">{{ rewardStatus.weekly.claimed ? '已领取' : rewardStatus.weekly.canClaim ? '可领取' : '未达标' }}</text>
            </view>
          </view>
          <view 
            class="reward-item"
            :class="{ 
              'can-claim': rewardStatus.monthly.canClaim,
              'claimed': rewardStatus.monthly.claimed,
              'disabled': !rewardStatus.monthly.canClaim && !rewardStatus.monthly.claimed
            }"
            @click="claimReward('monthly')"
          >
            <view class="reward-item-left">
              <text class="reward-item-icon">👑</text>
              <view class="reward-item-info">
                <text class="reward-item-name">每月奖励</text>
                <text class="reward-item-title" v-if="rewardStatus.monthly.title">{{ rewardStatus.monthly.title }}</text>
              </view>
            </view>
            <view class="reward-item-right">
              <text class="reward-item-points">+{{ rewardStatus.monthly.points }}</text>
              <text class="reward-item-status">{{ rewardStatus.monthly.claimed ? '已领取' : rewardStatus.monthly.canClaim ? '可领取' : '未达标' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="isLoading && currentRanking.length === 0" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 错误状态 -->
      <view v-else-if="loadingError && currentRanking.length === 0" class="error-state">
        <text class="error-text">{{ loadingError }}</text>
        <view class="retry-btn" @click="loadRankingData">
          <text class="retry-text">重新加载</text>
        </view>
      </view>

      <view class="top-three" v-if="currentRanking.length >= 3">
        <view class="top-item second">
          <view class="top-crown">🥈</view>
          <view class="top-avatar-wrapper">
            <view class="top-avatar" :style="{ background: currentRanking[1].avatar || '#667eea', borderColor: '#C0C0C0' }">
              <text class="top-initial">{{ currentRanking[1].nickname ? currentRanking[1].nickname.charAt(0) : '?' }}</text>
            </view>
            <view class="top-glow silver-glow"></view>
          </view>
          <text class="top-name">{{ currentRanking[1].nickname }}</text>
          <view class="top-score-wrapper">
            <text class="top-score" :style="{ color: getScoreColor(currentRanking[1].points) }">{{ currentRanking[1].points }}分</text>
          </view>
        </view>
        <view class="top-item first">
          <view class="top-crown">👑</view>
          <view class="top-avatar-wrapper">
            <view class="top-avatar" :style="{ background: currentRanking[0].avatar || '#f5576c', borderColor: '#FFD700' }">
              <text class="top-initial">{{ currentRanking[0].nickname ? currentRanking[0].nickname.charAt(0) : '?' }}</text>
            </view>
            <view class="top-glow gold-glow"></view>
            <view class="top-particles"></view>
          </view>
          <text class="top-name">{{ currentRanking[0].nickname }}</text>
          <view class="top-score-wrapper">
            <text class="top-score" :style="{ color: getScoreColor(currentRanking[0].points) }">{{ currentRanking[0].points }}分</text>
          </view>
        </view>
        <view class="top-item third">
          <view class="top-crown">🥉</view>
          <view class="top-avatar-wrapper">
            <view class="top-avatar" :style="{ background: currentRanking[2].avatar || '#11998e', borderColor: '#CD7F32' }">
              <text class="top-initial">{{ currentRanking[2].nickname ? currentRanking[2].nickname.charAt(0) : '?' }}</text>
            </view>
            <view class="top-glow bronze-glow"></view>
          </view>
          <text class="top-name">{{ currentRanking[2].nickname }}</text>
          <view class="top-score-wrapper">
            <text class="top-score" :style="{ color: getScoreColor(currentRanking[2].points) }">{{ currentRanking[2].points }}分</text>
          </view>
        </view>
      </view>

      <view class="ranking-list" v-if="currentRanking.length > 3">
        <view
          v-for="item in currentRanking.slice(3)"
          :key="item.id || item.rank"
          class="ranking-item"
        >
          <view class="rank-badge" :style="{ background: getRankStyle(item.rank).bg }">
            <text class="rank-text" :style="{ color: getRankStyle(item.rank).color }">{{ item.rank }}</text>
          </view>
          <view class="item-avatar" :style="{ background: item.avatar || '#667eea' }">
            <text class="item-initial">{{ item.nickname ? item.nickname.charAt(0) : '?' }}</text>
          </view>
          <view class="item-info">
            <text class="item-name">{{ item.nickname }}</text>
            <view class="score-bar">
              <view class="score-fill" :style="{ width: Math.min(item.points, 100) + '%', background: getScoreColor(item.points) }"></view>
            </view>
          </view>
          <text class="item-score" :style="{ color: getScoreColor(item.points) }">{{ item.points }}</text>
        </view>
      </view>

      <view class="refresh-tip">
        <text class="tip-text">上次更新: {{ getTimeSinceUpdate() }} | 自动刷新: 5分钟</text>
      </view>
    </view>

    <view class="reward-modal" v-if="showRewardModal" @click="closeRewardModal">
      <view class="reward-modal-content" @click.stop>
        <view class="reward-modal-icon">
          <text class="reward-modal-emoji">{{ rewardResult?.success ? '🎉' : '📋' }}</text>
        </view>
        <text class="reward-modal-title">{{ rewardResult?.title }}</text>
        <text class="reward-modal-message" v-if="rewardResult?.success">
          恭喜你获得 <text class="reward-modal-points">+{{ rewardResult?.points }}</text> 疯度
        </text>
        <text class="reward-modal-message" v-else>
          {{ rewardResult?.title }}
        </text>
        <view class="reward-modal-btn" @click="closeRewardModal">
          <text class="reward-modal-btn-text">确定</text>
        </view>
      </view>
    </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.login-prompt {
  padding: 40rpx 32rpx;
  min-height: 100vh;
  background: #F5F5F7;
}

.login-prompt .user-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 32rpx;
}

.login-prompt .avatar {
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

.login-prompt .avatar-text {
  font-size: 48rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.login-prompt .user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.login-prompt .nickname {
  font-size: 36rpx;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 8rpx;
}

.login-prompt .user-id {
  font-size: 26rpx;
  color: #999;
}

.login-prompt .login-btn-container {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.login-prompt .login-btn {
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

.login-prompt .login-btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.login-prompt .menu-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin: 0 0 32rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  padding: 32rpx;
}

.login-prompt .prompt-desc {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.login-prompt .prompt-icon {
  font-size: 40rpx;
}

.login-prompt .prompt-text {
  font-size: 28rpx;
  color: #666;
  flex: 1;
}

.bg-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 50%, #d5dbe3 100%);
  z-index: 0;
}

.gradient-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80rpx);
}

.blob-1 {
  width: 500rpx;
  height: 500rpx;
  background: rgba(251, 191, 36, 0.25);
  top: -150rpx;
  right: -100rpx;
}

.blob-2 {
  width: 400rpx;
  height: 400rpx;
  background: rgba(245, 158, 11, 0.2);
  bottom: 200rpx;
  left: -120rpx;
}

.blob-3 {
  width: 350rpx;
  height: 350rpx;
  background: rgba(252, 211, 77, 0.2);
  bottom: -100rpx;
  right: -80rpx;
}

.content {
  position: relative;
  z-index: 1;
  padding: 30rpx;
  padding-top: calc(30rpx + constant(safe-area-inset-top));
  padding-top: calc(30rpx + env(safe-area-inset-top));
  padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0 24rpx;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 6rpx;
}

.header-subtitle {
  display: block;
  font-size: 24rpx;
  color: #666666;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  
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

.tab-bar {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 12rpx;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);
  border-radius: 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  
  &.active {
    background: rgba(251, 191, 36, 0.85);
    
    .tab-name {
      color: #fff;
    }
  }
}

.tab-icon {
  font-size: 24rpx;
  margin-bottom: 4rpx;
}

.tab-name {
  font-size: 22rpx;
  font-weight: 600;
  color: #333333;
}

.my-rank-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
}

.my-rank-left {
  display: flex;
  align-items: center;
}

.my-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.my-initial {
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
}

.my-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.my-rank-label {
  font-size: 22rpx;
  color: #666666;
}

.my-rank-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.my-score {
  font-size: 32rpx;
  font-weight: 800;
}

.reward-btn {
  margin-left: 16rpx;
  padding: 8rpx 20rpx;
  background: #22D7FF;
  border-radius: 20rpx;
  
  &:active {
    opacity: 0.8;
  }
}

.reward-btn-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 600;
}

.reward-section {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
}

.reward-title {
  text-align: center;
  margin-bottom: 16rpx;
}

.reward-title-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.reward-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.reward-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  
  &.can-claim {
    border-color: #22D7FF;
    background: rgba(34, 215, 255, 0.1);
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  &.claimed {
    opacity: 0.6;
    background: rgba(255, 255, 255, 0.3);
  }
  
  &.disabled {
    opacity: 0.4;
  }
}

.reward-item-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.reward-item-icon {
  font-size: 32rpx;
}

.reward-item-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.reward-item-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #1a1a2e;
}

.reward-item-title {
  font-size: 22rpx;
  color: #666666;
}

.reward-item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}

.reward-item-points {
  font-size: 28rpx;
  font-weight: 800;
  color: #22D7FF;
}

.reward-item-status {
  font-size: 20rpx;
  color: #999999;
}

.top-three {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 16rpx;
  margin-bottom: 24rpx;
  padding: 0 20rpx;
}

.top-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  &.first {
    order: 2;
    
    .top-avatar {
      width: 100rpx;
      height: 100rpx;
      border-width: 4rpx;
    }
    
    .top-initial {
      font-size: 36rpx;
    }
    
    .top-name {
      font-size: 26rpx;
      font-weight: 700;
    }
    
    .top-score {
      font-size: 28rpx;
      font-weight: 800;
      text-shadow: 0 0 10rpx rgba(255, 215, 0, 0.5);
    }
  }
  
  &.second {
    order: 1;
    
    .top-avatar {
      width: 80rpx;
      height: 80rpx;
      border-width: 3rpx;
    }
  }
  
  &.third {
    order: 3;
    
    .top-avatar {
      width: 80rpx;
      height: 80rpx;
      border-width: 3rpx;
    }
  }
}

.top-avatar-wrapper {
  position: relative;
  margin-bottom: 8rpx;
}

.top-avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-style: solid;
  position: relative;
  z-index: 2;
}

.top-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  z-index: 1;
  animation: glow-pulse 2s ease-in-out infinite;
}

.gold-glow {
  width: 120rpx;
  height: 120rpx;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 215, 0, 0) 70%);
}

.silver-glow {
  width: 100rpx;
  height: 100rpx;
  background: radial-gradient(circle, rgba(192, 192, 192, 0.4) 0%, rgba(192, 192, 192, 0) 70%);
}

.bronze-glow {
  width: 100rpx;
  height: 100rpx;
  background: radial-gradient(circle, rgba(205, 127, 50, 0.4) 0%, rgba(205, 127, 50, 0) 70%);
}

.top-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140rpx;
  height: 140rpx;
  z-index: 0;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    animation: particle-float 3s ease-in-out infinite;
  }
  
  &::before {
    width: 8rpx;
    height: 8rpx;
    background: rgba(255, 215, 0, 0.8);
    top: 10%;
    left: 20%;
    animation-delay: 0s;
  }
  
  &::after {
    width: 6rpx;
    height: 6rpx;
    background: rgba(255, 215, 0, 0.6);
    top: 80%;
    right: 15%;
    animation-delay: 1.5s;
  }
}

.top-initial {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
}

.top-crown {
  position: absolute;
  top: -16rpx;
  font-size: 28rpx;
  z-index: 3;
  animation: crown-bounce 2s ease-in-out infinite;
}

.top-name {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #1a1a2e;
  margin-top: 12rpx;
  text-align: center;
  max-width: 140rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-score-wrapper {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 4rpx;
}

.top-score {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
}

.top-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  color: #ffffff;
  font-size: 16rpx;
  font-weight: 700;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(238, 90, 90, 0.4);
  animation: badge-pulse 2s ease-in-out infinite;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);
  border-radius: 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
}

.rank-badge {
  width: 40rpx;
  height: 40rpx;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
}

.rank-text {
  font-size: 22rpx;
  font-weight: 700;
}

.item-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
}

.item-initial {
  font-size: 20rpx;
  font-weight: 700;
  color: #fff;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.item-name {
  font-size: 26rpx;
  font-weight: 500;
  color: #1a1a2e;
}

.score-bar {
  height: 6rpx;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3rpx;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 3rpx;
}

.item-score {
  font-size: 26rpx;
  font-weight: 700;
  min-width: 50rpx;
  text-align: right;
}

.refresh-tip {
  text-align: center;
  padding: 32rpx 0;
}

.tip-text {
  font-size: 24rpx;
  color: #999999;
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999999;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.error-text {
  font-size: 28rpx;
  color: #ef4444;
  margin-bottom: 24rpx;
}

.retry-btn {
  padding: 16rpx 32rpx;
  background: #22D7FF;
  border-radius: 32rpx;
  
  &:active {
    opacity: 0.85;
  }
}

.retry-text {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 600;
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes particle-float {
  0%, 100% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(-10rpx);
    opacity: 0.5;
  }
}

@keyframes crown-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4rpx);
  }
}

@keyframes badge-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4rpx 12rpx rgba(238, 90, 90, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6rpx 16rpx rgba(238, 90, 90, 0.6);
  }
}

.reward-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 48rpx;
}

.reward-modal-content {
  background: linear-gradient(180deg, #ffffff 0%, #f8fdfb 100%);
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  width: 100%;
  max-width: 560rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2rpx solid rgba(34, 215, 255, 0.2);
  box-shadow: 0 24rpx 48rpx rgba(0, 0, 0, 0.15);
  animation: modal-bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.reward-modal-icon {
  margin-bottom: 16rpx;
}

.reward-modal-emoji {
  font-size: 80rpx;
  animation: emoji-bounce 0.6s ease-in-out;
}

.reward-modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.reward-modal-message {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 32rpx;
}

.reward-modal-points {
  font-size: 32rpx;
  font-weight: 800;
  color: #22D7FF;
}

.reward-modal-btn {
  width: 100%;
  height: 88rpx;
  background: #22D7FF;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    opacity: 0.85;
  }
}

.reward-modal-btn-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
}

@keyframes modal-bounce {
  0% { 
    opacity: 0; 
    transform: scale(0.5);
  }
  50% { 
    transform: scale(1.05);
  }
  70% { 
    transform: scale(0.95);
  }
  100% { 
    opacity: 1; 
    transform: scale(1);
  }
}

@keyframes emoji-bounce {
  0%, 100% { 
    transform: scale(1) rotate(0deg);
  }
  25% { 
    transform: scale(1.1) rotate(-5deg);
  }
  75% { 
    transform: scale(1.1) rotate(5deg);
  }
}
</style>
