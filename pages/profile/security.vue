<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo, bindPhone, bindEmail, logout, clearToken } from '@/api'

interface UserInfo {
  id: number
  nickname: string
  avatar: string
  phone?: string
  email?: string
  isLogin: boolean
}

const userInfo = ref<UserInfo>({
  id: 0,
  nickname: '',
  avatar: '',
  phone: '',
  email: '',
  isLogin: false
})

const showPhoneModal = ref(false)
const showEmailModal = ref(false)
const tempPhone = ref('')
const tempEmail = ref('')
const loading = ref(false)

onMounted(async () => {
  try {
    const res = await getUserInfo()
    userInfo.value = {
      ...res.data,
      isLogin: true
    }
    tempPhone.value = userInfo.value.phone || ''
    tempEmail.value = userInfo.value.email || ''
  } catch (e) {
    console.error('获取用户信息失败', e)
    uni.showToast({ title: '获取用户信息失败', icon: 'none' })
  }
})

const handleBindPhone = async () => {
  if (!tempPhone.value.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(tempPhone.value.trim())) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }
  
  loading.value = true
  try {
    await bindPhone(tempPhone.value.trim())
    userInfo.value.phone = tempPhone.value.trim()
    showPhoneModal.value = false
    uni.showToast({ title: '手机号绑定成功', icon: 'success' })
  } catch (e) {
    console.error('绑定手机号失败', e)
    uni.showToast({ title: '绑定失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const handleBindEmail = async () => {
  if (!tempEmail.value.trim()) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(tempEmail.value.trim())) {
    uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
    return
  }
  
  loading.value = true
  try {
    await bindEmail(tempEmail.value.trim())
    userInfo.value.email = tempEmail.value.trim()
    showEmailModal.value = false
    uni.showToast({ title: '邮箱绑定成功', icon: 'success' })
  } catch (e) {
    console.error('绑定邮箱失败', e)
    uni.showToast({ title: '绑定失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const handleUnbindPhone = () => {
  uni.showModal({
    title: '解绑手机号',
    content: '确定要解绑当前手机号吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await bindPhone('')
          userInfo.value.phone = ''
          uni.showToast({ title: '解绑成功', icon: 'success' })
        } catch (e) {
          console.error('解绑手机号失败', e)
          uni.showToast({ title: '解绑失败，请重试', icon: 'none' })
        }
      }
    }
  })
}

const handleUnbindEmail = () => {
  uni.showModal({
    title: '解绑邮箱',
    content: '确定要解绑当前邮箱吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await bindEmail('')
          userInfo.value.email = ''
          uni.showToast({ title: '解绑成功', icon: 'success' })
        } catch (e) {
          console.error('解绑邮箱失败', e)
          uni.showToast({ title: '解绑失败，请重试', icon: 'none' })
        }
      }
    }
  })
}

const handleLogout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await logout()
          clearToken()
          uni.showToast({ title: '已退出登录', icon: 'success' })
          setTimeout(() => {
            uni.switchTab({ url: '/pages/index/index' })
          }, 1500)
        } catch (e) {
          console.error('退出登录失败', e)
          uni.showToast({ title: '退出失败，请重试', icon: 'none' })
        }
      }
    }
  })
}

const handleDeleteAccount = () => {
  uni.showModal({
    title: '注销账户',
    content: '注销账户后，您的所有数据将被永久删除，此操作不可恢复。确定要继续吗？',
    confirmColor: '#ff4d4f',
    confirmText: '确定注销',
    success: async (res) => {
      if (res.confirm) {
        uni.showModal({
          title: '二次确认',
          content: '请再次确认：此操作不可恢复！',
          confirmColor: '#ff4d4f',
          confirmText: '我确认注销',
          success: async (res2) => {
            if (res2.confirm) {
              uni.showLoading({ title: '注销中...' })
              try {
                await logout()
                clearToken()
                uni.showToast({ title: '账户已注销', icon: 'success' })
                setTimeout(() => {
                  uni.switchTab({ url: '/pages/index/index' })
                }, 1500)
              } catch (e) {
                console.error('注销账户失败', e)
                uni.showToast({ title: '注销失败，请重试', icon: 'none' })
              } finally {
                uni.hideLoading()
              }
            }
          }
        })
      }
    }
  })
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <svg class="back-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/>
          <path d="m12 19-7-7 7-7"/>
        </svg>
      </view>
      <text class="header-title">账户安全</text>
      <view class="header-placeholder"></view>
    </view>

    <view class="content">
      <view class="section">
        <view class="section-header">
          <text class="section-title">手机号</text>
        </view>
        <view class="card">
          <view class="info-row">
            <text class="info-label">当前手机号</text>
            <text class="info-value">{{ userInfo.phone || '未绑定' }}</text>
          </view>
          <view class="action-buttons">
            <view class="btn secondary" @click="showPhoneModal = true">
              <text class="btn-text">{{ userInfo.phone ? '更换' : '绑定' }}</text>
            </view>
            <view v-if="userInfo.phone" class="btn danger" @click="handleUnbindPhone">
              <text class="btn-text">解绑</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">邮箱</text>
        </view>
        <view class="card">
          <view class="info-row">
            <text class="info-label">当前邮箱</text>
            <text class="info-value">{{ userInfo.email || '未绑定' }}</text>
          </view>
          <view class="action-buttons">
            <view class="btn secondary" @click="showEmailModal = true">
              <text class="btn-text">{{ userInfo.email ? '更换' : '绑定' }}</text>
            </view>
            <view v-if="userInfo.email" class="btn danger" @click="handleUnbindEmail">
              <text class="btn-text">解绑</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">账户操作</text>
        </view>
        <view class="card">
          <view class="menu-item" @click="handleLogout">
            <view class="menu-icon">🚪</view>
            <view class="menu-info">
              <text class="menu-title">退出登录</text>
              <text class="menu-desc">退出当前登录状态</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
          <view class="menu-item danger" @click="handleDeleteAccount">
            <view class="menu-icon">🗑️</view>
            <view class="menu-info">
              <text class="menu-title">注销账户</text>
              <text class="menu-desc">永久删除账户和所有数据</text>
            </view>
            <view class="menu-arrow">›</view>
          </view>
        </view>
      </view>
    </view>

    <view class="modal-mask" v-if="showPhoneModal" @click="showPhoneModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ userInfo.phone ? '更换手机号' : '绑定手机号' }}</text>
        </view>
        <view class="modal-body">
          <view class="form-group">
            <view class="form-label">手机号</view>
            <input 
              class="form-input"
              v-model="tempPhone"
              type="number"
              placeholder="请输入手机号"
              maxlength="11"
            />
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showPhoneModal = false">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm" @click="handleBindPhone">
            <text class="modal-btn-text">{{ loading ? '提交中...' : '确定' }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="modal-mask" v-if="showEmailModal" @click="showEmailModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ userInfo.email ? '更换邮箱' : '绑定邮箱' }}</text>
        </view>
        <view class="modal-body">
          <view class="form-group">
            <view class="form-label">邮箱地址</view>
            <input 
              class="form-input"
              v-model="tempEmail"
              type="text"
              placeholder="请输入邮箱地址"
              maxlength="50"
            />
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showEmailModal = false">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm" @click="handleBindEmail">
            <text class="modal-btn-text">{{ loading ? '提交中...' : '确定' }}</text>
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

.section {
  margin-bottom: 40rpx;
}

.section-header {
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.8;
  }
  
  &.secondary {
    background: #22D7FF;
    color: #FFFFFF;
  }
  
  &.danger {
    background: #FF3B30;
    color: #FFFFFF;
  }
}

.btn-text {
  color: #FFFFFF;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #F5F5F5;
  transition: background 0.2s;
  
  &:active {
    background: #F5F5F5;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  &.danger {
    background: #FFF1F0;
  }
}

.menu-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 16rpx;
}

.menu-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.menu-desc {
  font-size: 24rpx;
  color: #999;
}

.menu-arrow {
  font-size: 36rpx;
  color: #CCC;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  width: 100%;
  padding-bottom: calc(32rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.modal-header {
  padding: 32rpx;
  border-bottom: 1rpx solid #E5E5E5;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.modal-body {
  padding: 32rpx;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: #F5F5F7;
  border: 2rpx solid #E5E5E5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  
  &:focus {
    outline: none;
    border-color: #22D7FF;
    background: #FFFFFF;
  }
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 32rpx;
}

.modal-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  
  &.cancel {
    background: #F5F5F7;
    color: #666;
  }
  
  &.confirm {
    background: #22D7FF;
    color: #FFFFFF;
  }
}

.modal-btn-text {
  color: inherit;
}
</style>