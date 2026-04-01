<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import themeManager from '@/utils/theme'
import { storage } from '@/utils/storage'
import OnboardingGuide from '@/components/OnboardingGuide.vue'

const showOnboarding = ref(false)
const GUIDE_KEY = 'fengleme_onboard_completed'

onLaunch(() => {
  console.log('App Launch')
  themeManager.setMode(themeManager.getMode())
  
  const systemInfo = uni.getSystemInfoSync()
  console.log('System Info:', systemInfo)
  
  if (systemInfo.platform === 'ios') {
    uni.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#00D4AA',
      animation: {
        duration: 250,
        timingFunc: 'easeIn'
      }
    })
  }
  
  const hasCompletedOnboard = storage.get(GUIDE_KEY)
  if (!hasCompletedOnboard) {
    showOnboarding.value = true
  }
})

onMounted(() => {
  setTimeout(() => {
    const hasCompletedOnboard = storage.get(GUIDE_KEY)
    if (!hasCompletedOnboard) {
      showOnboarding.value = true
    }
  }, 500)
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})

const handleGuideClose = () => {
  showOnboarding.value = false
}

const handleGuideSkip = () => {
  showOnboarding.value = false
}
</script>

<template>
  <view id="app">
    <slot />
    
    <OnboardingGuide 
      v-if="showOnboarding" 
      @close="handleGuideClose" 
      @skip="handleGuideSkip" 
    />
  </view>
</template>

<style lang="scss">
@import '@/styles/theme.scss';
@import '@/styles/index.scss';
@import '@/static/icons/icon.css';

page {
  background-color: var(--color-bg);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: 'kern' 1;
}

view, text, button, image {
  box-sizing: border-box;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

button {
  border: none;
  outline: none;
  background: none;
  padding: 0;
  line-height: inherit;
  &::after {
    border: none;
  }
}

input, textarea {
  -webkit-user-select: auto;
  user-select: auto;
}

scroll-view {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

scroll-view::-webkit-scrollbar {
  display: none;
}
</style>
