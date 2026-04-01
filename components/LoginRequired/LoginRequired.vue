<script setup lang="ts">
import { isLogin } from '@/api'

const props = defineProps<{
  title?: string
  description?: string
  icon?: string
}>()

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/auth/login' })
}

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/auth/register' })
}
</script>

<template>
  <view class="container">
    <view class="content">
      <view class="icon-box">
        <text class="icon">{{ icon || '🔒' }}</text>
      </view>
      <text class="title">{{ title || '此功能需要登录' }}</text>
      <text class="description">{{ description || '登录后即可查看完整内容' }}</text>
      
      <view class="btn-container">
        <view class="login-btn" @click="goToLogin">
          <text class="login-btn-text">立即登录</text>
        </view>
        <view class="register-btn" @click="goToRegister">
          <text class="register-btn-text">注册账号</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F7;
  padding: 32rpx;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600rpx;
}

.icon-box {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  box-shadow: 0 12rpx 40rpx rgba(34, 215, 255, 0.3);
}

.icon {
  font-size: 80rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1C1C1E;
  margin-bottom: 16rpx;
}

.description {
  font-size: 28rpx;
  color: #8E8E93;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 48rpx;
}

.btn-container {
  display: flex;
  width: 100%;
  gap: 16rpx;
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

.login-btn-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
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

.register-btn-text {
  font-size: 30rpx;
  color: #22D7FF;
  font-weight: 600;
}
</style>
