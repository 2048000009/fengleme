<script setup lang="ts">
import { ref, onMounted } from 'vue'
import themeManager, { type ThemeMode } from '@/utils/theme'
import { getUserInfo } from '@/api'

const currentTheme = ref<ThemeMode>('system')
const userInfo = ref<any>(null)

const themeOptions = [
  { value: 'light', label: '浅色模式', icon: '☀️', desc: '始终使用浅色主题' },
  { value: 'dark', label: '深色模式', icon: '🌙', desc: '始终使用深色主题' },
  { value: 'system', label: '跟随系统', icon: '📱', desc: '自动跟随系统主题切换' }
] as const

const setTheme = (mode: ThemeMode) => {
  uni.vibrateShort({ type: 'light' })
  themeManager.setMode(mode)
  currentTheme.value = mode
  uni.showToast({
    title: '主题已更改',
    icon: 'success'
  })
}

onMounted(async () => {
  currentTheme.value = themeManager.getMode()
  try {
    const res = await getUserInfo()
    userInfo.value = res.data
  } catch (e) {
    console.error('获取用户信息失败', e)
  }
})

const goBack = () => {
  uni.navigateBack()
}

const showAbout = () => {
  uni.showModal({
    title: '关于疯了么',
    content: '疯了么 - 让我们一起发疯\n版本：1.0.0\n© 2024 疯了么团队',
    showCancel: false
  })
}

const showPrivacy = () => {
  uni.showModal({
    title: '隐私政策',
    content: '我们重视您的隐私保护，不会收集您的个人信息。您的所有数据都存储在本地服务器，仅供功能使用。',
    showCancel: false
  })
}

const showTerms = () => {
  uni.showModal({
    title: '用户协议',
    content: '1. 本应用为娱乐性质，请理性使用\n2. 禁止发布违法违规内容\n3. 用户需对自己的行为负责\n4. 我们保护用户隐私信息',
    showCancel: false
  })
}
</script>

<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="back" size="24" color="var(--color-text-primary)"></uni-icons>
      </view>
      <text class="header-title">设置</text>
      <view class="header-placeholder"></view>
    </view>

    <view class="content">
      <view class="section">
        <view class="section-header">
          <text class="section-title">外观</text>
        </view>
        <view class="theme-card">
          <view
            v-for="option in themeOptions"
            :key="option.value"
            class="theme-option"
            :class="{ active: currentTheme === option.value }"
            @click="setTheme(option.value as ThemeMode)"
          >
            <view class="option-left">
              <text class="option-icon">{{ option.icon }}</text>
              <view class="option-info">
                <text class="option-label">{{ option.label }}</text>
                <text class="option-desc">{{ option.desc }}</text>
              </view>
            </view>
            <view class="option-check" v-if="currentTheme === option.value">
              <text class="check-icon">✓</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">关于</text>
        </view>
        <view class="about-card">
          <view class="about-item">
            <text class="about-label">应用名称</text>
            <text class="about-value">疯了么</text>
          </view>
          <view class="about-item">
            <text class="about-label">版本号</text>
            <text class="about-value">1.0.0</text>
          </view>
          <view class="about-item">
            <text class="about-label">应用介绍</text>
            <text class="about-value">专治各种想不开</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">免责声明</text>
        </view>
        <view class="disclaimer-card">
          <text class="disclaimer-text">
            本平台所有娱乐化内容仅供舒缓情绪参考，不能替代专业医疗诊断。如有严重心理困扰，请务必寻求专业帮助。
          </text>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">关于</text>
        </view>
        <view class="menu-list">
          <view class="menu-item" @click="showAbout">
            <uni-icons type="info" size="22" color="#007AFF" class="menu-icon"></uni-icons>
            <text class="menu-label">关于我们</text>
            <view class="menu-arrow">›</view>
          </view>
          <view class="menu-item" @click="showPrivacy">
            <uni-icons type="locked" size="22" color="#52C41A" class="menu-icon"></uni-icons>
            <text class="menu-label">隐私政策</text>
            <view class="menu-arrow">›</view>
          </view>
          <view class="menu-item" @click="showTerms">
            <uni-icons type="paperclip" size="22" color="#FF9500" class="menu-icon"></uni-icons>
            <text class="menu-label">用户协议</text>
            <view class="menu-arrow">›</view>
          </view>
        </view>
      </view>

      <view class="section" v-if="userInfo && userInfo.isLogin">
        <view class="section-header">
          <text class="section-title">账户</text>
        </view>
        <view class="menu-list">
          <view class="menu-item" @click="() => uni.navigateTo({ url: '/pages/profile/change-password' })">
            <uni-icons type="locked" size="22" color="#FF9500" class="menu-icon"></uni-icons>
            <text class="menu-label">修改密码</text>
            <view class="menu-arrow">›</view>
          </view>
          <view class="menu-item" @click="() => uni.navigateTo({ url: '/pages/profile/security' })">
            <uni-icons type="auth" size="22" color="#52C41A" class="menu-icon"></uni-icons>
            <text class="menu-label">账户安全</text>
            <view class="menu-arrow">›</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: var(--color-bg);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 32rpx;
  padding-top: calc(16rpx + constant(safe-area-inset-top));
  padding-top: calc(16rpx + env(safe-area-inset-top));
  background: var(--color-card);
  border-bottom: 2rpx solid var(--color-border);
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
  color: var(--color-text-primary);
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-placeholder {
  width: 64rpx;
}

.menu-list {
  background: var(--color-card);
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid var(--color-border);
  transition: background 0.2s;
  
  &:active {
    background: var(--color-bg-hover);
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
  color: var(--color-text-primary);
}

.menu-arrow {
  font-size: 36rpx;
  color: var(--color-text-secondary);
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
  font-size: 24rpx;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.theme-card {
  background: var(--color-card);
  border-radius: 20rpx;
  border: 2rpx solid var(--color-border);
  overflow: hidden;
}

.theme-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }

  &.active {
    background: rgba(0, 47, 167, 0.05);
  }

  &:active {
    opacity: 0.8;
  }
}

.option-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.option-icon {
  font-size: 40rpx;
}

.option-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.option-label {
  font-size: 28rpx;
  font-weight: 500;
  color: var(--color-text-primary);
}

.option-desc {
  font-size: 22rpx;
  color: var(--color-text-tertiary);
}

.option-check {
  width: 44rpx;
  height: 44rpx;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  font-size: 24rpx;
  font-weight: 700;
  color: #ffffff;
}

.about-card {
  background: var(--color-card);
  border-radius: 20rpx;
  border: 2rpx solid var(--color-border);
  overflow: hidden;
}

.about-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
}

.about-label {
  font-size: 28rpx;
  color: var(--color-text-primary);
}

.about-value {
  font-size: 28rpx;
  color: var(--color-text-tertiary);
}

.disclaimer-card {
  background: var(--color-card);
  border-radius: 20rpx;
  border: 2rpx solid var(--color-border);
  padding: 28rpx 32rpx;
}

.disclaimer-text {
  font-size: 26rpx;
  color: var(--color-text-secondary);
  line-height: 1.7;
}
</style>
