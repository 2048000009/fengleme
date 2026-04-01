<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { wechatLogin, setToken } from '@/api'
import { storage } from '@/utils/storage'

const loading = ref(true)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  // #ifdef H5
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')
  
  if (!code) {
    error.value = '授权失败：未获取到授权码'
    loading.value = false
    return
  }
  
  try {
    const res = await wechatLogin(code, state || '')
    
    setToken(res.data.token)
    storage.set('fengleme_user_info', res.data.userInfo)
    
    success.value = true
    loading.value = false
    
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (e: any) {
    error.value = e.message || '登录失败'
    loading.value = false
  }
  // #endif
  
  // #ifndef H5
  error.value = '此页面仅支持H5环境'
  loading.value = false
  // #endif
})

const goBack = () => {
  uni.navigateTo({ url: '/pages/auth/login' })
}
</script>

<template>
  <view class="container">
    <view v-if="loading" class="status-container">
      <view class="loading-icon">⏳</view>
      <text class="status-text">正在登录中...</text>
      <text class="status-desc">请稍候，正在获取您的微信信息</text>
    </view>
    
    <view v-else-if="success" class="status-container success">
      <view class="status-icon">✅</view>
      <text class="status-text">登录成功</text>
      <text class="status-desc">正在跳转到首页...</text>
    </view>
    
    <view v-else class="status-container error">
      <view class="status-icon">❌</view>
      <text class="status-text">登录失败</text>
      <text class="status-desc">{{ error }}</text>
      <view class="retry-btn" @click="goBack">
        <text class="retry-text">返回登录</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F7FA 0%, #FFFFFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.loading-icon {
  font-size: 100rpx;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.status-icon {
  font-size: 100rpx;
  margin-bottom: 32rpx;
}

.status-text {
  font-size: 36rpx;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 16rpx;
}

.status-desc {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 48rpx;
}

.success {
  .status-icon {
    color: #22D7FF;
  }
}

.error {
  .status-icon {
    color: #FF4D4F;
  }
}

.retry-btn {
  padding: 24rpx 64rpx;
  background: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
  border-radius: 48rpx;
  
  &:active {
    opacity: 0.9;
  }
}

.retry-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
