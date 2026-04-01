<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { storage } from '@/utils/storage'

const currentStep = ref(0)
const showGuide = ref(true)
const GUIDE_KEY = 'onboard_completed'
const isAnimating = ref(false)

const steps = [
  {
    icon: '🤪',
    title: '欢迎来到"疯了么"',
    desc: '一款让你每天证明自己"还活着"\n同时释放压力的趣味签到APP',
    bgColor: 'linear-gradient(180deg, #22D7FF 0%, #00C8EB 100%)',
    feature: '每日签到 · 积累疯度 · 记录生活'
  },
  {
    icon: '🎮',
    title: '疯批签到',
    desc: '点击首页大大的签到按钮\n完成今日的"发疯"打卡！',
    bgColor: 'linear-gradient(180deg, #FF6B6B 0%, #FF4D4F 100%)',
    feature: '每次签到获得15疯度\n连续签到奖励更多哦～'
  },
  {
    icon: '🚨',
    title: '疯友守护',
    desc: '添加紧急联系人\n连续未签到会通知他们关心你',
    bgColor: 'linear-gradient(180deg, #9C27B0 0%, #7B1FA2 100%)',
    feature: '登录后可使用全部功能\n数据同步云端更安全'
  }
]

const isLastStep = computed(() => currentStep.value === steps.length - 1)
const isFirstStep = computed(() => currentStep.value === 0)

const step = computed(() => steps[currentStep.value])

const nextStep = () => {
  if (isAnimating.value) return
  
  isAnimating.value = true
  
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
    setTimeout(() => {
      isAnimating.value = false
    }, 300)
  }
}

const prevStep = () => {
  if (isAnimating.value) return
  
  isAnimating.value = true
  
  if (currentStep.value > 0) {
    currentStep.value--
    setTimeout(() => {
      isAnimating.value = false
    }, 300)
  }
}

const handleStart = () => {
  storage.set(GUIDE_KEY, true)
  uni.switchTab({ url: '/pages/index/index' })
}

const handleSkip = () => {
  storage.set(GUIDE_KEY, true)
  uni.switchTab({ url: '/pages/index/index' })
}

onLoad(() => {
  const hasCompletedOnboard = storage.get(GUIDE_KEY)
  console.log('Guide onLoad, hasCompleted:', hasCompletedOnboard)
  if (hasCompletedOnboard) {
    showGuide.value = false
    uni.switchTab({ url: '/pages/index/index' })
  }
})
</script>

<template>
  <view v-if="showGuide" class="guide-container">
    <view class="guide-bg" :style="{ background: step.bgColor }"></view>
    
    <view class="guide-content">
      <view class="skip-btn" @click="handleSkip">
        <text class="skip-text">跳过</text>
      </view>
      
      <view class="card-wrapper">
        <view class="icon-container" :class="{ animating: isAnimating }">
          <text class="step-icon">{{ step.icon }}</text>
        </view>
        
        <view class="text-section">
          <text class="step-title">{{ step.title }}</text>
          <text class="step-desc">{{ step.desc }}</text>
          
          <view class="feature-box">
            <text class="feature-text">{{ step.feature }}</text>
          </view>
        </view>
      </view>
      
      <view class="indicator-row">
        <view 
          v-for="(item, index) in steps" 
          :key="index"
          class="indicator-dot"
          :class="{ active: index === currentStep }"
        ></view>
      </view>
      
      <view class="btn-row">
        <view 
          v-if="!isFirstStep" 
          class="btn btn-secondary" 
          @click="prevStep"
        >
          <text class="btn-secondary-text">上一步</text>
        </view>
        
        <view 
          v-if="!isLastStep" 
          class="btn btn-primary" 
          @click="nextStep"
        >
          <text class="btn-primary-text">下一步</text>
        </view>
        
        <view 
          v-if="isLastStep" 
          class="btn btn-start" 
          @click="handleStart"
        >
          <text class="btn-start-text">开始发疯 🚀</text>
        </view>
      </view>
      
      <view class="tip-text">
        <text class="tip">登录后可使用全部功能并同步数据</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.guide-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.guide-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.guide-content {
  position: relative;
  z-index: 1;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 60rpx 48rpx;
  padding-top: calc(100rpx + constant(safe-area-inset-top));
  padding-top: calc(100rpx + env(safe-area-inset-top));
  padding-bottom: calc(40rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.skip-btn {
  align-self: flex-end;
  padding: 16rpx 32rpx;
  
  &:active {
    opacity: 0.7;
  }
}

.skip-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.card-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 60rpx 0;
}

.icon-container {
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
  backdrop-filter: blur(10rpx);
  transition: transform 0.3s ease-out;
  
  &.animating {
    animation: bounceOut 0.3s ease-out;
  }
}

@keyframes bounceOut {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.85); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.step-icon {
  font-size: 120rpx;
}

.text-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.step-title {
  font-size: 48rpx;
  font-weight: 800;
  color: #FFFFFF;
  text-align: center;
}

.step-desc {
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  line-height: 1.6;
  white-space: pre-line;
}

.feature-box {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 24rpx 36rpx;
  margin-top: 16rpx;
  backdrop-filter: blur(5rpx);
}

.feature-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  line-height: 1.5;
}

.indicator-row {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 48rpx;
}

.indicator-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s;
  
  &.active {
    width: 48rpx;
    border-radius: 8rpx;
    background: #FFFFFF;
  }
}

.btn-row {
  display: flex;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.btn {
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.97);
    opacity: 0.9;
  }
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5rpx);
}

.btn-secondary-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.btn-primary {
  background: #FFFFFF;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.btn-primary-text {
  font-size: 32rpx;
  color: #22D7FF;
  font-weight: 700;
}

.btn-start {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  box-shadow: 0 8rpx 32rpx rgba(255, 215, 0, 0.4);
}

.btn-start-text {
  font-size: 34rpx;
  color: #FFFFFF;
  font-weight: 800;
}

.tip-text {
  text-align: center;
}

.tip {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}
</style>
