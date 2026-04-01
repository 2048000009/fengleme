<script setup lang="ts">
import { ref, computed } from 'vue'
import { sendSmsCode, resetPassword } from '@/api'

const phone = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const step = ref(1)

const canSendCode = computed(() => {
  return phone.value.length === 11 && /^1[3-9]\d{9}$/.test(phone.value) && countdown.value === 0 && !sendingCode.value
})

const canSubmit = computed(() => {
  return phone.value.length === 11 && 
         code.value.length === 6 && 
         newPassword.value.length >= 6 && 
         confirmPassword.value === newPassword.value &&
         !loading.value
})

const sendCode = async () => {
  if (!canSendCode.value) return
  
  sendingCode.value = true
  try {
    const res = await sendSmsCode(phone.value, 'reset')
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

const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  if (newPassword.value.length < 6 || newPassword.value.length > 20) {
    uni.showToast({ title: '密码长度为6-20个字符', icon: 'none' })
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }
  
  loading.value = true
  try {
    await resetPassword(phone.value, code.value, newPassword.value, confirmPassword.value)
    uni.showToast({ title: '密码重置成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (e: any) {
    uni.showToast({ title: e.message || '重置失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<template>
  <view class="container">
    <view class="header">
      <text class="title">重置密码</text>
      <text class="subtitle">通过手机验证码重置您的密码</text>
    </view>
    
    <view class="form">
      <view class="form-item">
        <view class="form-label">手机号</view>
        <view class="input-row">
          <input 
            v-model="phone" 
            class="form-input" 
            type="number"
            placeholder="请输入注册手机号"
            maxlength="11"
          />
        </view>
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
      
      <view class="form-item">
        <view class="form-label">新密码</view>
        <view class="input-wrapper">
          <input 
            :type="showNewPassword ? 'text' : 'password'"
            v-model="newPassword" 
            class="form-input"
            placeholder="请输入新密码(6-20位)"
            maxlength="20"
          />
          <view class="eye-icon" @click="showNewPassword = !showNewPassword">
            <text>{{ showNewPassword ? '🙈' : '👁️' }}</text>
          </view>
        </view>
      </view>
      
      <view class="form-item">
        <view class="form-label">确认密码</view>
        <view class="input-wrapper">
          <input 
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="confirmPassword" 
            class="form-input"
            placeholder="请再次输入新密码"
            maxlength="20"
          />
          <view class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">
            <text>{{ showConfirmPassword ? '🙈' : '👁️' }}</text>
          </view>
        </view>
      </view>
      
      <view class="btn-container">
        <view class="btn primary" :class="{ disabled: !canSubmit }" @click="handleSubmit">
          <text class="btn-text">{{ loading ? '提交中...' : '重置密码' }}</text>
        </view>
      </view>
      
      <view class="back-link" @click="goBack">
        <text class="link-text">返回登录</text>
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

.input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.input-wrapper {
  position: relative;
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

.btn-container {
  margin-top: 48rpx;
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

.back-link {
  text-align: center;
  margin-top: 32rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #E5E5E5;
}

.link-text {
  font-size: 26rpx;
  color: #22D7FF;
}
</style>
