<script setup lang="ts">
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'
import { login, setToken, sendSmsCode, loginBySms, getWechatOAuthUrl, wechatMiniLogin } from '@/api'

type LoginType = 'password' | 'sms'

const loginType = ref<LoginType>('password')
const phone = ref('')
const password = ref('')
const code = ref('')
const loading = ref(false)
const showPassword = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

const canSendCode = computed(() => {
  return phone.value.length === 11 && /^1[3-9]\d{9}$/.test(phone.value) && countdown.value === 0 && !sendingCode.value
})

const validatePasswordForm = (): boolean => {
  if (!phone.value.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return false
  }
  
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return false
  }
  
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return false
  }
  
  if (password.value.length < 6) {
    uni.showToast({ title: '密码长度至少6个字符', icon: 'none' })
    return false
  }
  
  return true
}

const validateSmsForm = (): boolean => {
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
  
  return true
}

const handlePasswordLogin = async () => {
  if (!validatePasswordForm()) return
  
  loading.value = true
  try {
    const res = await login(phone.value.trim(), password.value)
    
    setToken(res.data.token)
    storage.set('fengleme_user_info', res.data.userInfo)
    
    uni.showToast({ title: '登录成功', icon: 'success' })
    
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (e: any) {
    console.error('登录失败', e)
    uni.showToast({ 
      title: e.message || '登录失败，请检查账号密码', 
      icon: 'none' 
    })
  } finally {
    loading.value = false
  }
}

const handleSmsLogin = async () => {
  if (!validateSmsForm()) return
  
  loading.value = true
  try {
    const res = await loginBySms(phone.value.trim(), code.value)
    
    setToken(res.data.token)
    storage.set('fengleme_user_info', res.data.userInfo)
    
    if (res.data.isNewUser) {
      uni.showToast({ title: '注册成功', icon: 'success' })
    } else {
      uni.showToast({ title: '登录成功', icon: 'success' })
    }
    
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (e: any) {
    console.error('登录失败', e)
    uni.showToast({ 
      title: e.message || '登录失败', 
      icon: 'none' 
    })
  } finally {
    loading.value = false
  }
}

const handleLogin = () => {
  if (loginType.value === 'password') {
    handlePasswordLogin()
  } else {
    handleSmsLogin()
  }
}

const sendCode = async () => {
  if (!canSendCode.value) return
  
  sendingCode.value = true
  try {
    await sendSmsCode(phone.value, 'login')
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

const switchLoginType = (type: LoginType) => {
  loginType.value = type
  password.value = ''
  code.value = ''
}

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/auth/register' })
}

const forgotPassword = () => {
  uni.navigateTo({ url: '/pages/auth/forgot-password' })
}

const handleWechatLogin = async () => {
  // #ifdef H5
  try {
    const res = await getWechatOAuthUrl()
    if (res.data && res.data.oauth_url) {
      window.location.href = res.data.oauth_url
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '获取授权链接失败', icon: 'none' })
  }
  // #endif
  
  // #ifdef MP-WEIXIN
  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
      try {
        const res = await wechatMiniLogin(loginRes.code)
        setToken(res.data.token)
        storage.set('fengleme_user_info', res.data.userInfo)
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' })
        }, 1500)
      } catch (e: any) {
        uni.showToast({ title: e.message || '登录失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '微信授权失败', icon: 'none' })
    }
  })
  // #endif
}
</script>

<template>
  <view class="container">
    <view class="header">
      <text class="title">欢迎回来</text>
      <text class="subtitle">登录你的疯友账号</text>
    </view>
    
    <view class="form">
      <view class="login-type-tabs">
        <view 
          class="tab-item" 
          :class="{ active: loginType === 'password' }"
          @click="switchLoginType('password')"
        >
          <text class="tab-text">密码登录</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: loginType === 'sms' }"
          @click="switchLoginType('sms')"
        >
          <text class="tab-text">验证码登录</text>
        </view>
      </view>
      
      <view class="form-item">
        <view class="form-label">手机号</view>
        <view class="input-wrapper">
          <uni-icons type="person" size="20" color="#8E8E93" class="input-icon"></uni-icons>
          <input 
            v-model="phone" 
            class="form-input with-icon" 
            type="number"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </view>
      </view>
      
      <view v-if="loginType === 'password'" class="form-item">
        <view class="form-label">密码</view>
        <view class="input-wrapper">
          <uni-icons type="locked" size="20" color="#8E8E93" class="input-icon"></uni-icons>
          <input 
            :type="showPassword ? 'text' : 'password'"
            v-model="password" 
            class="form-input with-icon"
            placeholder="请输入密码"
            maxlength="20"
          />
          <view class="eye-icon" @click="showPassword = !showPassword">
            <uni-icons :type="showPassword ? 'eye-slash' : 'eye'" size="20" color="#8E8E93"></uni-icons>
          </view>
        </view>
      </view>
      
      <view v-else class="form-item">
        <view class="form-label">验证码</view>
        <view class="input-row">
          <view class="input-wrapper flex-1">
            <uni-icons type="email" size="20" color="#8E8E93" class="input-icon"></uni-icons>
            <input 
              v-model="code" 
              class="form-input code-input with-icon" 
              type="number"
              placeholder="请输入验证码"
              maxlength="6"
            />
          </view>
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
      
      <view class="forgot-password" @click="forgotPassword">
        <text class="forgot-link">忘记密码？</text>
      </view>
      
      <view class="btn-container">
        <view class="btn primary" :class="{ disabled: loading }" @click="handleLogin">
          <text class="btn-text">{{ loading ? '登录中...' : '立即登录' }}</text>
        </view>
      </view>
      
      <view class="divider">
        <view class="divider-line"></view>
        <text class="divider-text">其他登录方式</text>
        <view class="divider-line"></view>
      </view>
      
      <view class="third-party-login">
        <view class="third-party-btn" @click="handleWechatLogin">
          <text class="third-party-icon">💬</text>
          <text class="third-party-text">微信登录</text>
        </view>
      </view>
      
      <view class="register-link">
        <text class="link-text">还没有账号？</text>
        <text class="link-btn" @click="goToRegister">立即注册</text>
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

.login-type-tabs {
  display: flex;
  background: #F5F7FA;
  border-radius: 12rpx;
  padding: 6rpx;
  margin-bottom: 32rpx;
}

.tab-item {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  transition: all 0.3s;
  
  &.active {
    background: #FFFFFF;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }
}

.tab-text {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
  
  .active & {
    color: #22D7FF;
    font-weight: 600;
  }
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

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 24rpx;
  z-index: 1;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.flex-1 {
  flex: 1;
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
    outline: none;
    border-color: #22D7FF;
    background: #FFFFFF;
  }
}

.form-input.with-icon {
  padding-left: 64rpx;
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

.eye-icon {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32rpx;
}

.forgot-password {
  text-align: right;
  margin-bottom: 32rpx;
}

.forgot-link {
  font-size: 26rpx;
  color: #22D7FF;
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

.divider {
  display: flex;
  align-items: center;
  margin: 40rpx 0;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: #E5E5E5;
}

.divider-text {
  padding: 0 24rpx;
  font-size: 24rpx;
  color: #999999;
}

.third-party-login {
  display: flex;
  justify-content: center;
  gap: 40rpx;
}

.third-party-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  
  &:active {
    opacity: 0.8;
  }
}

.third-party-icon {
  font-size: 64rpx;
}

.third-party-text {
  font-size: 24rpx;
  color: #666666;
}

.register-link {
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
