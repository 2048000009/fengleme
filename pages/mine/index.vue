<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storage } from '@/utils/storage'
import { getUserInfo, updateUserInfo, isLogin, getUnreadCount, logout, clearLoginData } from '@/api'

const USER_INFO_KEY = 'fengleme_user_info'
const OPENID_KEY = 'fengleme_openid'

interface UserInfo {
  id: number
  nickname: string
  avatar: string
  gender: number
  signature: string
  phone?: string
  email?: string
  crazy_points?: number
  continuous_days?: number
  total_days?: number
  level?: string
  join_date?: string
  isLogin: boolean
}

const userInfo = ref<UserInfo>({
  id: 0,
  nickname: '',
  avatar: '',
  gender: 0,
  signature: '',
  isLogin: false
})
const loading = ref(false)
const unreadCount = ref(0)
const anonymousStats = ref({
  continuousDays: 0,
  totalDays: 0,
  crazyPoints: 0,
  level: '初入疯途'
})
let refreshTimer: number | null = null

const loadUserData = async () => {
  loading.value = true
  try {
    if (isLogin()) {
      const res = await getUserInfo()
      userInfo.value = {
        ...res.data,
        isLogin: true
      }
      storage.set(USER_INFO_KEY, userInfo.value)
      
      await fetchUnreadCount()
      
      if (!refreshTimer) {
        refreshTimer = setInterval(() => {
          if (isLogin()) {
            fetchUnreadCount()
          }
        }, 60000) as unknown as number
      }
    } else {
      resetUserInfo()
      // 加载匿名用户数据
      const anonymousData = storage.get('fengleme_anonymous_data')
      if (anonymousData) {
        anonymousStats.value = {
          continuousDays: anonymousData.continuousDays || 0,
          totalDays: anonymousData.totalDays || 0,
          crazyPoints: anonymousData.crazyPoints || 0,
          level: anonymousData.level || '初入疯途'
        }
      } else {
        anonymousStats.value = {
          continuousDays: 0,
          totalDays: 0,
          crazyPoints: 0,
          level: '初入疯途'
        }
      }
    }
  } catch (e) {
    console.error('获取用户信息失败', e)
    resetUserInfo()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserData()
})

onShow(() => {
  loadUserData()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

const resetUserInfo = () => {
  userInfo.value = {
    id: 0,
    nickname: '',
    avatar: '',
    gender: 0,
    signature: '',
    isLogin: false
  }
  storage.set(USER_INFO_KEY, userInfo.value)
}

const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res.data.count || 0
  } catch (e) {
    console.error('获取未读消息数失败', e)
    unreadCount.value = 0
  }
}

const handleUpdateUserInfo = async (data: Partial<UserInfo>) => {
  try {
    uni.showLoading({ title: '保存中...' })
    await updateUserInfo(data)
    uni.showToast({ title: '保存成功', icon: 'success' })
    userInfo.value = { ...userInfo.value, ...data }
    storage.set(USER_INFO_KEY, userInfo.value)
  } catch (e) {
    console.error('更新用户信息失败', e)
    uni.showToast({ title: '保存失败', icon: 'none' })
    throw e
  } finally {
    uni.hideLoading()
  }
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/auth/login' })
}

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/auth/register' })
}

const goToEditProfile = () => {
  if (!userInfo.value.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.navigateTo({ 
    url: '/pages/profile/edit',
    success: (res) => {
      res.eventChannel.emit('userInfo', userInfo.value)
    }
  })
}

const goToSettings = () => {
  uni.navigateTo({ url: '/pages/settings/index' })
}

const goToMessages = () => {
  if (!userInfo.value.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/messages/index' })
}

const goToFeedback = () => {
  uni.navigateTo({ url: '/pages/feedback/index' })
}

const goToFaq = () => {
  uni.navigateTo({ url: '/pages/faq/index' })
}

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '退出中...' })
          await logout()
          clearLoginData()
          resetUserInfo()
          uni.showToast({ title: '已退出登录', icon: 'success' })
        } catch (e) {
          console.error('退出失败', e)
          uni.showToast({ title: '退出失败，请重试', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

const goToRanking = () => {
  uni.navigateTo({ url: '/pages/ranking/index' })
}

const goToTask = () => {
  uni.navigateTo({ url: '/pages/task/index' })
}

const goToChangePassword = () => {
  uni.navigateTo({ url: '/pages/profile/change-password' })
}

const goToSecurity = () => {
  uni.navigateTo({ url: '/pages/profile/security' })
}

defineExpose({
  handleUpdateUserInfo,
  fetchUnreadCount
})
</script>

<template>
  <view class="container">
    <view class="header-bg"></view>
    
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>
    
    <template v-else>
      <view v-if="!userInfo.isLogin" class="login-container">
        <view class="user-card">
          <view class="avatar">
            <text class="avatar-text">疯</text>
          </view>
          <view class="user-info">
            <text class="nickname">匿名疯友</text>
            <text class="user-id">体验模式 · 数据仅保存在本地</text>
          </view>
          <view class="level-badge">
            <text class="level-text">{{ anonymousStats.level || '初入疯途' }}</text>
          </view>
        </view>

        <view class="stats-card">
          <view class="stats-item">
            <text class="stats-value">{{ anonymousStats.crazyPoints || 0 }}</text>
            <text class="stats-label">疯情指数</text>
          </view>
          <view class="stats-divider"></view>
          <view class="stats-item">
            <text class="stats-value">{{ anonymousStats.continuousDays || 0 }}</text>
            <text class="stats-label">连续签到</text>
          </view>
          <view class="stats-divider"></view>
          <view class="stats-item">
            <text class="stats-value">{{ anonymousStats.totalDays || 0 }}</text>
            <text class="stats-label">总签到</text>
          </view>
        </view>
        
        <view class="login-btn-container">
          <view class="login-btn" @click="goToLogin">
            <text class="login-btn-text">立即登录</text>
          </view>
          <view class="register-btn" @click="goToRegister">
            <text class="register-btn-text">注册账号</text>
          </view>
        </view>

        <view class="menu-card">
          <view class="menu-item" @click="goToTask">
            <uni-icons type="list" size="20" color="#22D7FF" class="menu-icon"></uni-icons>
            <text class="menu-label">任务中心</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="goToRanking">
            <uni-icons type="star" size="20" color="#FF9500" class="menu-icon"></uni-icons>
            <text class="menu-label">疯神榜</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="goToFeedback">
            <uni-icons type="help" size="20" color="#FF6B6B" class="menu-icon"></uni-icons>
            <text class="menu-label">宝贵意见</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="goToFaq">
            <uni-icons type="info" size="20" color="#9C27B0" class="menu-icon"></uni-icons>
            <text class="menu-label">常见问题</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>
      
      <template v-else>
        <view class="user-card" @click="goToEditProfile">
          <view class="avatar">
            <image v-if="userInfo.avatar && userInfo.avatar.trim()" :src="userInfo.avatar" class="avatar-img" mode="aspectFill" />
            <text v-else class="avatar-text">{{ userInfo.nickname ? userInfo.nickname.charAt(0) : '醒' }}</text>
          </view>
          <view class="user-info">
            <text class="nickname">{{ userInfo.nickname || '用户' + userInfo.id }}</text>
            <text class="user-id">ID: {{ userInfo.id }}</text>
          </view>
          <view class="level-badge">
            <text class="level-text">{{ userInfo.level || '初级疯友' }}</text>
          </view>
        </view>

        <view class="stats-card">
          <view class="stats-item">
            <text class="stats-value">{{ userInfo.crazy_points || 0 }}</text>
            <text class="stats-label">疯情指数</text>
          </view>
          <view class="stats-divider"></view>
          <view class="stats-item">
            <text class="stats-value">{{ userInfo.continuous_days || 0 }}</text>
            <text class="stats-label">连续签到</text>
          </view>
          <view class="stats-divider"></view>
          <view class="stats-item">
            <text class="stats-value">{{ userInfo.total_days || 0 }}</text>
            <text class="stats-label">总签到</text>
          </view>
        </view>

        <view class="menu-card">
          <view class="menu-item" @click="goToEditProfile">
            <uni-icons type="compose" size="20" color="#22D7FF" class="menu-icon"></uni-icons>
            <text class="menu-label">编辑资料</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="goToChangePassword">
            <uni-icons type="locked" size="20" color="#FF9500" class="menu-icon"></uni-icons>
            <text class="menu-label">修改密码</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="goToSecurity">
            <uni-icons type="auth" size="20" color="#52C41A" class="menu-icon"></uni-icons>
            <text class="menu-label">账户安全</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="goToSettings">
            <uni-icons type="gear" size="20" color="#8E8E93" class="menu-icon"></uni-icons>
            <text class="menu-label">系统设置</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="goToMessages">
            <uni-icons type="chat" size="20" color="#007AFF" class="menu-icon"></uni-icons>
            <text class="menu-label">消息中心</text>
            <view class="menu-right">
              <view v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
              <text class="menu-arrow">›</text>
            </view>
          </view>
          <view class="menu-item" @click="goToTask">
            <uni-icons type="list" size="20" color="#22D7FF" class="menu-icon"></uni-icons>
            <text class="menu-label">任务中心</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="goToRanking">
            <uni-icons type="trophy" size="20" color="#FF9500" class="menu-icon"></uni-icons>
            <text class="menu-label">疯神榜</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="goToFeedback">
            <uni-icons type="help" size="20" color="#FF6B6B" class="menu-icon"></uni-icons>
            <text class="menu-label">宝贵意见</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="goToFaq">
            <uni-icons type="info" size="20" color="#9C27B0" class="menu-icon"></uni-icons>
            <text class="menu-label">常见问题</text>
            <text class="menu-arrow">›</text>
          </view>
          <view class="menu-item" @click="handleLogout">
            <uni-icons type="close" size="20" color="#FF4D4F" class="menu-icon"></uni-icons>
            <text class="menu-label" style="color: #ff4d4f;">退出登录</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </template>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #F5F5F7;
  padding-bottom: calc(32rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  position: relative;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  background: linear-gradient(180deg, #22D7FF 0%, #00C8EB 100%);
  border-radius: 0 0 60rpx 60rpx;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  position: relative;
  z-index: 1;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.login-container {
  padding: 32rpx;
  position: relative;
  z-index: 1;
}

.user-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 24rpx;
  position: relative;
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
  border: 4rpx solid rgba(255, 255, 255, 0.8);
}

.avatar-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
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

.level-badge {
  background: linear-gradient(135deg, #FFE4B5 0%, #FFD700 100%);
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.level-text {
  font-size: 22rpx;
  color: #8B4513;
  font-weight: 600;
}

.signature {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
}

.login-btn-container {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.login-btn {
  flex: 1;
  height: 88rpx;
  background: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(34, 215, 255, 0.35);
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.register-btn {
  flex: 1;
  height: 88rpx;
  background: #FFFFFF;
  border: 2rpx solid #22D7FF;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.login-btn-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.register-btn-text {
  font-size: 30rpx;
  color: #22D7FF;
  font-weight: 600;
}

.stats-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stats-value {
  font-size: 40rpx;
  font-weight: 800;
  color: #22D7FF;
  margin-bottom: 8rpx;
}

.stats-label {
  font-size: 24rpx;
  color: #999;
}

.stats-divider {
  width: 2rpx;
  height: 50rpx;
  background: #E5E5E5;
}

.menu-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #F5F5F5;
  transition: background 0.2s;
  
  &:active {
    background: #F5F5F5;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  margin-right: 16rpx;
}

.menu-label {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #CCC;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.badge {
  min-width: 36rpx;
  height: 36rpx;
  background: #FF4D4F;
  border-radius: 18rpx;
  padding: 0 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>