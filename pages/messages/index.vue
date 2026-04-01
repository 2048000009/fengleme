<script setup lang="ts">
import { ref, onMounted, onUnmounted, onShow } from 'vue'
import { getMessageList, markMessageRead, markAllRead, getUnreadCount, isLogin } from '@/api'

interface Message {
  id: number
  title: string
  content: string
  type: 'system' | 'activity' | 'reminder'
  isRead: boolean
  createTime: string
}

const messages = ref<Message[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const unreadCount = ref(0)
const unreadTimer = ref<NodeJS.Timeout | null>(null)
const isLoggedIn = ref(false)

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/auth/login' })
}

onShow(() => {
  isLoggedIn.value = isLogin()
})

onMounted(() => {
  isLoggedIn.value = isLogin()
  if (isLoggedIn.value) {
    loadMessages()
    fetchUnreadCount()
    unreadTimer.value = setInterval(fetchUnreadCount, 30000)
  }
})

onUnmounted(() => {
  if (unreadTimer.value) {
    clearInterval(unreadTimer.value)
    unreadTimer.value = null
  }
})

const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res.data.count
  } catch (error) {
    console.error('获取未读数失败', error)
  }
}

const loadMessages = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true
  
  try {
    const res = await getMessageList(isRefresh ? 1 : page.value, 20)
    if (isRefresh) {
      messages.value = res.data.list
      page.value = 1
    } else {
      messages.value = [...messages.value, ...res.data.list]
    }
    if (res.data.list.length < 20) {
      hasMore.value = false
    }
    if (!isRefresh) {
      page.value++
    }
  } catch (error) {
    console.error('加载消息失败', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!loading.value && hasMore.value) {
    loadMessages()
  }
}

const onRefresh = () => {
  hasMore.value = true
  loadMessages(true)
}

const markAsRead = async (message: Message) => {
  if (!message.isRead) {
    try {
      await markMessageRead(message.id)
      message.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('标记已读失败', error)
    }
  }
}

const markAllAsRead = async () => {
  try {
    await markAllRead()
    messages.value.forEach(m => m.isRead = true)
    unreadCount.value = 0
    uni.showToast({ title: '已全部标记已读', icon: 'success' })
  } catch (error) {
    console.error('全部标记已读失败', error)
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const getMessageIcon = (type: string) => {
  const icons: Record<string, string> = {
    system: 'notification',
    activity: 'gift',
    reminder: 'calendar'
  }
  return icons[type] || 'chatbubble'
}

const getMessageColor = (type: string) => {
  const colors: Record<string, string> = {
    system: '#22D7FF',
    activity: '#FF6B6B',
    reminder: '#FF9500'
  }
  return colors[type] || '#8E8E93'
}

// 格式化时间显示
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 小于1小时显示"X分钟前"
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return minutes < 1 ? '刚刚' : `${minutes}分钟前`
  }
  // 小于24小时显示"X小时前"
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}小时前`
  }
  // 小于7天显示"X天前"
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }
  // 否则显示日期
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
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
          <text class="prompt-icon">📬</text>
          <text class="prompt-text">登录后才能查看消息中心</text>
        </view>
      </view>
    </view>
    
    <template v-else>
    <!-- 顶部栏 -->
    <view class="header">
      <view class="header-left">
        <text class="header-title">消息中心</text>
        <view v-if="unreadCount > 0" class="unread-badge">
          <text class="unread-badge-text">{{ unreadCount > 99 ? '99+' : unreadCount }}</text>
        </view>
      </view>
      <view class="header-right" @click="markAllAsRead">
        <text class="mark-all-text">全部已读</text>
      </view>
    </view>
    
    <scroll-view 
      class="message-list" 
      scroll-y 
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="loading"
      @refresherrefresh="onRefresh"
    >
      <view v-if="messages.length === 0 && !loading" class="empty-state">
        <text class="empty-icon">🚀</text>
        <text class="empty-title">去火星了</text>
        <text class="empty-text">还没有收到任何消息</text>
        <text class="empty-hint">下拉刷新看看有没有新消息</text>
      </view>
      
      <view 
        v-for="message in messages" 
        :key="message.id"
        class="message-item"
        :class="{ unread: !message.isRead }"
        @click="markAsRead(message)"
      >
        <view class="message-icon" :style="{ backgroundColor: getMessageColor(message.type) + '20' }">
          <uni-icons :type="getMessageIcon(message.type)" size="22" :color="getMessageColor(message.type)"></uni-icons>
        </view>
        <view class="message-content">
          <view class="message-header">
            <text class="message-title">{{ message.title }}</text>
            <text class="message-time">{{ formatTime(message.createTime) }}</text>
          </view>
          <text class="message-text">{{ message.content }}</text>
        </view>
        <view v-if="!message.isRead" class="unread-dot"></view>
      </view>
      
      <view v-if="loading && messages.length > 0" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>
      <view v-else-if="!hasMore && messages.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>
    </scroll-view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #F5F5F7;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #E5E5EA;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1C1C1E;
}

.unread-badge {
  margin-left: 16rpx;
  background: #FF3B30;
  border-radius: 20rpx;
  min-width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
}

.unread-badge-text {
  font-size: 22rpx;
  color: #ffffff;
  font-weight: 600;
}

.header-right {
  padding: 12rpx 20rpx;
}

.mark-all-text {
  font-size: 28rpx;
  color: #22D7FF;
}

.message-list {
  height: calc(100vh - 100rpx);
  padding: 16rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1C1C1E;
  margin-bottom: 12rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #8E8E93;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #C7C7CC;
}

.message-item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: flex-start;
  position: relative;

  &.unread {
    background: #F0FDF9;
  }

  &:active {
    opacity: 0.8;
  }
}

.message-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.icon-text {
  font-size: 36rpx;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.message-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1C1C1E;
}

.message-time {
  font-size: 22rpx;
  color: #8E8E93;
}

.message-text {
  font-size: 26rpx;
  color: #3A3A3C;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.unread-dot {
  width: 16rpx;
  height: 16rpx;
  background: #FF3B30;
  border-radius: 50%;
  position: absolute;
  top: 24rpx;
  right: 24rpx;
}

.loading-more,
.no-more {
  text-align: center;
  padding: 32rpx;
}

.loading-text,
.no-more-text {
  font-size: 24rpx;
  color: #8E8E93;
}
</style>
