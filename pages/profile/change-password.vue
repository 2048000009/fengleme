<script setup lang="ts">
import { ref } from 'vue'
import { changePassword } from '@/api'

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const validateForm = (): boolean => {
  if (!oldPassword.value.trim()) {
    uni.showToast({ title: '请输入旧密码', icon: 'none' })
    return false
  }
  
  if (!newPassword.value) {
    uni.showToast({ title: '请输入新密码', icon: 'none' })
    return false
  }
  
  if (newPassword.value.length < 6 || newPassword.value.length > 20) {
    uni.showToast({ title: '新密码长度为6-20个字符', icon: 'none' })
    return false
  }
  
  if (newPassword.value === oldPassword.value) {
    uni.showToast({ title: '新密码不能与旧密码相同', icon: 'none' })
    return false
  }
  
  if (!confirmPassword.value) {
    uni.showToast({ title: '请确认新密码', icon: 'none' })
    return false
  }
  
  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return false
  }
  
  return true
}

const getPasswordStrength = (password: string): { level: string; color: string; text: string } => {
  if (!password) {
    return { level: '弱', color: '#ff4d4f', text: '请输入密码' }
  }
  
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (password.length >= 10) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  
  if (score <= 2) {
    return { level: '弱', color: '#ff4d4f', text: '密码强度：弱' }
  } else if (score <= 4) {
    return { level: '中', color: '#ff9800', text: '密码强度：中' }
  } else {
    return { level: '强', color: '#52c41a', text: '密码强度：强' }
  }
}

const handleChangePassword = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    await changePassword({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    })
    
    uni.showModal({
      title: '密码修改成功',
      content: '密码已修改成功，请重新登录',
      showCancel: false,
      success: () => {
        uni.navigateTo({ url: '/pages/auth/login' })
      }
    })
  } catch (e: any) {
    console.error('修改密码失败', e)
    uni.showToast({ 
      title: e.message || '修改密码失败，请重试', 
      icon: 'none' 
    })
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
      <view class="back-btn" @click="goBack">
        <uni-icons type="back" size="24" color="#333"></uni-icons>
      </view>
      <text class="header-title">修改密码</text>
      <view class="header-placeholder"></view>
    </view>

    <view class="content">
      <view class="card">
        <view class="form-group">
          <view class="form-label">旧密码</view>
          <view class="input-wrapper">
            <uni-icons type="locked" size="20" color="#8E8E93" class="input-icon"></uni-icons>
            <input 
              :type="showOldPassword ? 'text' : 'password'"
              v-model="oldPassword"
              class="form-input with-icon"
              placeholder="请输入旧密码"
              maxlength="20"
            />
            <view class="eye-icon" @click="showOldPassword = !showOldPassword">
              <uni-icons :type="showOldPassword ? 'eye-slash' : 'eye'" size="20" color="#8E8E93"></uni-icons>
            </view>
          </view>
        </view>

        <view class="form-group">
          <view class="form-label">新密码</view>
          <view class="input-wrapper">
            <uni-icons type="locked" size="20" color="#8E8E93" class="input-icon"></uni-icons>
            <input 
              :type="showNewPassword ? 'text' : 'password'"
              v-model="newPassword"
              class="form-input with-icon"
              placeholder="请输入新密码（6-20个字符）"
              maxlength="20"
              @input="() => {}"
            />
            <view class="eye-icon" @click="showNewPassword = !showNewPassword">
              <uni-icons :type="showNewPassword ? 'eye-slash' : 'eye'" size="20" color="#8E8E93"></uni-icons>
            </view>
          </view>
          <view class="password-strength" v-if="newPassword">
            <text :style="{ color: getPasswordStrength(newPassword).color }">
              {{ getPasswordStrength(newPassword).text }}
            </text>
          </view>
        </view>

        <view class="form-group">
          <view class="form-label">确认新密码</view>
          <view class="input-wrapper">
            <uni-icons type="locked" size="20" color="#8E8E93" class="input-icon"></uni-icons>
            <input 
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              class="form-input with-icon"
              placeholder="请再次输入新密码"
              maxlength="20"
            />
            <view class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">
              <uni-icons :type="showConfirmPassword ? 'eye-slash' : 'eye'" size="20" color="#8E8E93"></uni-icons>
            </view>
          </view>
        </view>

        <view class="tips">
          <view class="tip-item">• 密码长度为6-20个字符</view>
          <view class="tip-item">• 建议使用字母、数字和符号组合</view>
          <view class="tip-item">• 修改密码后需要重新登录</view>
        </view>

        <view class="btn-container">
          <view class="btn" :class="{ disabled: loading }" @click="handleChangePassword">
            <text class="btn-text">{{ loading ? '提交中...' : '确认修改' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #F5F5F7;
  padding-top: calc(32rpx + constant(safe-area-inset-top));
  padding-top: calc(32rpx + env(safe-area-inset-top));
  padding-bottom: calc(32rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 32rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #E5E5E5;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    opacity: 0.6;
  }
}

.back-icon {
  width: 48rpx;
  height: 48rpx;
  color: #333;
}

.header-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1A1A1A;
}

.header-placeholder {
  width: 64rpx;
}

.content {
  padding: 32rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.form-group {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 12rpx;
  display: block;
}

.input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.input-icon {
  position: absolute;
  left: 24rpx;
  z-index: 1;
}

.form-input {
  flex: 1;
  height: 88rpx;
  background: #F5F5F7;
  border: 2rpx solid #E5E5E5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
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

.eye-icon {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
}

.password-strength {
  margin-top: 12rpx;
  font-size: 24rpx;
}

.tips {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #FFF8E1;
  border-radius: 12rpx;
}

.tip-item {
  font-size: 24rpx;
  color: #666;
  line-height: 1.8;
  margin-bottom: 8rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.btn-container {
  margin-top: 48rpx;
}

.btn {
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
  
  &.disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}

.btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>