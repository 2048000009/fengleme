<script setup lang="ts">
import { ref } from 'vue'
import { storage } from '@/utils/storage'
import { register, setToken } from '@/api'

const OPENID_KEY = 'fengleme_openid'

const nickname = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreement = ref(false)
const rememberPassword = ref(false)
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const nicknameCount = ref(0)
const passwordStrength = ref({ level: '无', color: '#999', text: '请输入密码' })

const validateForm = (): boolean => {
  if (!nickname.value.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return false
  }
  
  if (nickname.value.length < 2 || nickname.value.length > 20) {
    uni.showToast({ title: '昵称长度为2-20个字符', icon: 'none' })
    return false
  }
  
  if (!phone.value.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return false
  }
  
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return false
  }
  
  if (!email.value.trim()) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return false
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
    return false
  }
  
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return false
  }
  
  if (password.value.length < 6 || password.value.length > 20) {
    uni.showToast({ title: '密码长度为6-20个字符', icon: 'none' })
    return false
  }
  
  if (password.value !== confirmPassword.value) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return false
  }
  
  if (!agreement.value) {
    uni.showToast({ title: '请阅读并同意用户协议', icon: 'none' })
    return false
  }
  
  return true
}

const getPasswordStrength = (pwd: string) => {
  if (!pwd) {
    return { level: '无', color: '#999', text: '请输入密码' }
  }
  
  let score = 0
  if (pwd.length >= 6) score++
  if (pwd.length >= 8) score++
  if (pwd.length >= 10) score++
  if (/[a-z]/.test(pwd)) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++
  
  if (score <= 2) {
    return { level: '弱', color: '#ff4d4f', text: '密码强度：弱（建议增加长度或复杂度）' }
  } else if (score <= 4) {
    return { level: '中', color: '#ff9800', text: '密码强度：中（建议添加数字或符号）' }
  } else {
    return { level: '强', color: '#52c41a', text: '密码强度：强（符合安全要求）' }
  }
}

const handleRegister = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    const res = await register({
      nickname: nickname.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
      password: password.value
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
        <view class="form-label">昵称</view>
        <view class="input-wrapper">
          <input 
            v-model="nickname" 
            class="form-input" 
            placeholder="请输入昵称（2-20个字符）"
            maxlength="20"
            @input="nicknameCount = nickname.length"
          />
          <text class="char-count">{{ nicknameCount }}/20</text>
        </view>
      </view>
      
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
        <view class="form-label">邮箱</view>
        <input 
          v-model="email" 
          class="form-input" 
          type="text"
          placeholder="请输入邮箱"
        />
      </view>
      
      <view class="form-item">
        <view class="form-label">密码</view>
        <view class="input-wrapper">
          <input 
            :type="showPassword ? 'text' : 'password'"
            v-model="password" 
            class="form-input"
            placeholder="请输入密码（6-20个字符）"
            maxlength="20"
            @input="passwordStrength = getPasswordStrength(password)"
          />
          <view class="eye-icon" @click="showPassword = !showPassword">
            <text>{{ showPassword ? '🙈' : '👁️' }}</text>
          </view>
        </view>
        
        <view class="password-requirements" v-if="password">
          <view class="requirement-item" :class="{ met: password.length >= 6 }">
            <text class="requirement-icon">{{ password.length >= 6 ? '✓' : '○' }}</text>
            <text class="requirement-text">至少6个字符</text>
          </view>
          <view class="requirement-item" :class="{ met: /[a-z]/.test(password) }">
            <text class="requirement-icon">{{ /[a-z]/.test(password) ? '✓' : '○' }}</text>
            <text class="requirement-text">包含小写字母</text>
          </view>
          <view class="requirement-item" :class="{ met: /[A-Z]/.test(password) }">
            <text class="requirement-icon">{{ /[A-Z]/.test(password) ? '✓' : '○' }}</text>
            <text class="requirement-text">包含大写字母</text>
          </view>
          <view class="requirement-item" :class="{ met: /[0-9]/.test(password) }">
            <text class="requirement-icon">{{ /[0-9]/.test(password) ? '✓' : '○' }}</text>
            <text class="requirement-text">包含数字</text>
          </view>
          <view class="requirement-item" :class="{ met: /[^a-zA-Z0-9]/.test(password) }">
            <text class="requirement-icon">{{ /[^a-zA-Z0-9]/.test(password) ? '✓' : '○' }}</text>
            <text class="requirement-text">包含特殊字符</text>
          </view>
        </view>
        
        <view class="password-strength" v-if="password">
          <view class="strength-bar">
            <view 
              class="strength-segment" 
              :class="{ active: passwordStrength.level === '弱' }"
              :style="{ background: passwordStrength.level === '弱' ? '#ff4d4f' : '#e5e5e5' }"
            ></view>
            <view 
              class="strength-segment" 
              :class="{ active: passwordStrength.level === '中' || passwordStrength.level === '强' }"
              :style="{ background: passwordStrength.level === '中' || passwordStrength.level === '强' ? '#ff9800' : '#e5e5e5' }"
            ></view>
            <view 
              class="strength-segment" 
              :class="{ active: passwordStrength.level === '强' }"
              :style="{ background: passwordStrength.level === '强' ? '#52c41a' : '#e5e5e5' }"
            ></view>
          </view>
          <text class="strength-text" :style="{ color: passwordStrength.color }">
            {{ passwordStrength.text }}
          </text>
        </view>
      </view>
      
      <view class="form-item">
        <view class="form-label">确认密码</view>
        <view class="input-wrapper">
          <input 
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="confirmPassword" 
            class="form-input" 
            placeholder="请再次输入密码"
            maxlength="20"
          />
          <view class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">
            <text>{{ showConfirmPassword ? '🙈' : '👁️' }}</text>
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
      
      <view class="remember-password">
        <view class="checkbox" :class="{ checked: rememberPassword }" @click="rememberPassword = !rememberPassword">
          <text v-if="rememberPassword" class="check-icon">✓</text>
        </view>
        <text class="remember-text">记住密码</text>
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

.input-wrapper {
  position: relative;
}

.char-count {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24rpx;
  color: #999999;
}

.eye-icon {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32rpx;
  cursor: pointer;
  user-select: none;
}

.password-requirements {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #F8F9FA;
  border-radius: 12rpx;
}

.requirement-item {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.requirement-icon {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  margin-right: 12rpx;
  
  &.met {
    color: #52c41a;
  }
  
  &:not(.met) {
    color: #e5e5e5;
  }
}

.requirement-text {
  font-size: 24rpx;
  color: #666666;
}

.password-strength {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #F8F9FA;
  border-radius: 12rpx;
}

.strength-bar {
  display: flex;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.strength-segment {
  flex: 1;
  height: 8rpx;
  border-radius: 4rpx;
  background: #e5e5e5;
  transition: all 0.3s;
  
  &.active {
    height: 12rpx;
  }
}

.strength-text {
  font-size: 24rpx;
  font-weight: 500;
  text-align: center;
}

.remember-password {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding: 16rpx 24rpx;
  background: #F8F9FA;
  border-radius: 12rpx;
}

.remember-text {
  font-size: 26rpx;
  color: #666666;
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