<script setup lang="ts">
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'
import { register, setToken, sendSmsCode } from '@/api'

const OPENID_KEY = 'fengleme_openid'

const phone = ref('')
const code = ref('')
const agreement = ref(false)
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

const canSendCode = computed(() => {
  return phone.value.length === 11 && /^1[3-9]\d{9}$/.test(phone.value) && countdown.value === 0 && !sendingCode.value
})

const validateForm = (): boolean => {
  if (!phone.value.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return false
  }
  
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return false
  }
  
  if (!code.value || code.value.length !== 6) {
    uni.showToast({ title: '请输入6位验证码', icon: 'none' })
    return false
  }
  
  if (!agreement.value) {
    uni.showToast({ title: '请阅读并同意用户协议', icon: 'none' })
    return false
  }
  
  return true
}

const sendCode = async () => {
  if (!canSendCode.value) return
  
  sendingCode.value = true
  try {
    await sendSmsCode(phone.value, 'register')
    uni.showToast({ title: '验证码已发送', icon: 'success' })
    countdown.value = 60
    startCountdown()
  } catch (e: any) {
    uni.showToast({ title: e.message || '发送失败', icon: 'none' })
  } finally {
    sendingCode.value = false
  }
}

const startCountdown = () => {
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleRegister = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    const res = await register({
      phone: phone.value.trim(),
      code: code.value,
      nickname: `疯友${Math.floor(Math.random() * 10000)}` // 自动生成昵称
    })
    
    setToken(res.data.token)
    storage.set('fengleme_user_info', res.data.userInfo)
    
    uni.showToast({ title: '注册成功', icon: 'success' })
    
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (e: any) {
    console.error('注册失败', e)
    let errorMsg = '注册失败，请重试'
    
    if (e.message) {
      errorMsg = e.message
    } else if (typeof e === 'string') {
      errorMsg = e
    } else if (e.data && typeof e.data === 'string' && e.data.includes('<!DOCTYPE')) {
      errorMsg = '服务器配置错误，请联系管理员'
    }
    
    uni.showModal({
      title: '注册失败',
      content: errorMsg,
      showCancel: false,
      confirmText: '知道了'
    })
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  uni.navigateBack()
}

const showAgreement = () => {
  uni.showModal({
    title: '用户协议',
    content: '1. 本应用为娱乐性质，请理性使用\n2. 禁止发布违法违规内容\n3. 用户需对自己的行为负责\n4. 我们保护用户隐私信息',
    showCancel: false,
    confirmText: '我已阅读'
  })
}
</script>

<template>
  <view class="container">
    <view class="header">
      <text class="title">注册疯友账号</text>
      <text class="subtitle">加入我们，开启发疯之旅</text>
    </view>
    
    <view class="form">
      <view class="form-item">
        <view class="form-label">手机号</view>
        <input 
          v-model="phone" 
          class="form-input" 
          type="number"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </view>
      
      <view class="form-item">
        <view class="form-label">验证码</view>
        <view class="input-row">
          <input 
            v-model="code" 
            class="form-input code-input" 
            type="number"
            placeholder="请输入验证码"
            maxlength="6"
          />
          <view 
            class="code-btn" 
            :class="{ disabled: !canSendCode }"
            @click="sendCode"
          >
            <text class="code-btn-text">
              {{ countdown > 0 ? `${countdown}s` : sendingCode ? '发送中...' : '获取验证码' }}
            </text>
          </view>
        </view>
      </view>
      
      <view class="agreement">
        <view class="checkbox" :class="{ checked: agreement }" @click="agreement = !agreement">
          <text v-if="agreement" class="check-icon">✓</text>
        </view>
        <text class="agreement-text">我已阅读并同意</text>
        <text class="agreement-link" @click="showAgreement">《用户协议》</text>
      </view>
      
      <view class="btn-container">
        <view class="btn primary" :class="{ disabled: loading }" @click="handleRegister">
          <text class="btn-text">{{ loading ? '注册中...' : '立即注册' }}</text>
        </view>
      </view>
      
      <view class="login-link">
        <text class="link-text">已有账号？</text>
        <text class="link-btn" @click="goToLogin">立即登录</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F7FA 0%, #FFFFFF 100%);
  padding: 40rpx 32rpx;
}

.header {
  text-align: center;
  padding: 80rpx 0 60rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: 800;
  color: #1A1A1A;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #999999;
}

.form {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: #F5F7FA;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333333;
  border: 2rpx solid transparent;
  transition: all 0.3s;
  
  &:focus {
    border-color: #22D7FF;
    background: #FFFFFF;
  }
}

.input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.code-input {
  flex: 1;
}

.code-btn {
  flex-shrink: 0;
  padding: 0 24rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.disabled {
    background: #E5E5E5;
    opacity: 0.6;
  }
}

.code-btn-text {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: 500;
  white-space: nowrap;
}

.agreement {
  display: flex;
  align-items: center;
  margin: 40rpx 0 32rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #E5E5E5;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
  transition: all 0.3s;
  
  &.checked {
    background: #22D7FF;
    border-color: #22D7FF;
  }
}

.check-icon {
  font-size: 24rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.agreement-text {
  font-size: 26rpx;
  color: #666666;
}

.agreement-link {
  font-size: 26rpx;
  color: #22D7FF;
  margin-left: 4rpx;
}

.btn-container {
  margin-top: 40rpx;
}

.btn {
  width: 100%;
  height: 96rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  
  &.primary {
    background: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
    box-shadow: 0 8rpx 24rpx rgba(34, 215, 255, 0.3);
    
    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
    
    &.disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  }
}

.btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.login-link {
  text-align: center;
  margin-top: 32rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #E5E5E5;
}

.link-text {
  font-size: 26rpx;
  color: #999999;
}

.link-btn {
  font-size: 26rpx;
  color: #22D7FF;
  font-weight: 500;
  margin-left: 8rpx;
}
</style>