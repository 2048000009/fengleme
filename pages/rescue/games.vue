<script setup lang="ts">
import { ref } from 'vue'

const currentGame = ref<'walnut' | null>(null)
const walnutCount = ref(0)
const walnuts = ref<Array<{
  id: number
  x: number
  y: number
  cracked: boolean
}>>([])
let nextWalnutId = 0

const startWalnutGame = () => {
  currentGame.value = 'walnut'
  walnutCount.value = 0
  walnuts.value = []
  spawnWalnuts()
}

const backToMenu = () => {
  currentGame.value = null
  walnuts.value = []
}

const spawnWalnuts = () => {
  for (let i = 0; i < 5; i++) {
    addWalnut()
  }
}

const addWalnut = () => {
  walnuts.value.push({
    id: nextWalnutId++,
    x: Math.random() * 80 + 10,
    y: Math.random() * 70 + 10,
    cracked: false
  })
}

const crackWalnut = (id: number) => {
  const walnut = walnuts.value.find(w => w.id === id && !w.cracked)
  if (walnut) {
    walnut.cracked = true
    walnutCount.value++
    
    setTimeout(() => {
      walnuts.value = walnuts.value.filter(w => w.id !== id)
      addWalnut()
    }, 500)
  }
}
</script>

<template>
  <view class="container">
    <view v-if="!currentGame" class="menu-container">
      <view class="header">
        <text class="title">在线镇静剂</text>
        <text class="subtitle">选择一个游戏放松一下</text>
      </view>

      <view class="game-list">
        <view class="game-card" @click="startWalnutGame">
          <view class="game-icon">🥜</view>
          <view class="game-info">
            <text class="game-name">砸核桃模拟器</text>
            <text class="game-desc">点击核桃砸开它，释放压力</text>
          </view>
          <view class="game-arrow">›</view>
        </view>

        <view class="game-card coming-soon">
          <view class="game-icon">🎈</view>
          <view class="game-info">
            <text class="game-name">戳气球</text>
            <text class="game-desc">即将上线...</text>
          </view>
        </view>

        <view class="game-card coming-soon">
          <view class="game-icon">🧱</view>
          <view class="game-info">
            <text class="game-name">拆积木</text>
            <text class="game-desc">即将上线...</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else-if="currentGame === 'walnut'" class="game-container">
      <view class="game-header">
        <button class="back-btn" @click="backToMenu">← 返回</button>
        <text class="game-title">砸核桃模拟器</text>
        <view class="score">
          <text class="score-label">已砸开</text>
          <text class="score-value">{{ walnutCount }}</text>
        </view>
      </view>

      <view class="canvas-wrapper">
        <view class="game-area">
          <view
            v-for="walnut in walnuts"
            :key="walnut.id"
            class="walnut"
            :class="{ cracked: walnut.cracked }"
            :style="{ left: walnut.x + '%', top: walnut.y + '%' }"
            @click="crackWalnut(walnut.id)"
          >
            <text class="walnut-icon">{{ walnut.cracked ? '💥' : '🥜' }}</text>
          </view>
        </view>
        <view class="hint">点击核桃砸开它</view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.menu-container {
  padding: 30rpx;
}

.header {
  text-align: center;
  padding: 40rpx 0 60rpx;
}

.title {
  display: block;
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.game-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.game-card {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }

  &.coming-soon {
    opacity: 0.6;
  }
}

.game-icon {
  font-size: 80rpx;
  margin-right: 24rpx;
}

.game-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.game-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.game-desc {
  font-size: 26rpx;
  color: #999;
}

.game-arrow {
  font-size: 48rpx;
  color: #ccc;
  font-weight: 300;
}

.game-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.game-header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.back-btn {
  padding: 16rpx 24rpx;
  background: #f0f0f0;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx;
}

.game-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.score {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.score-label {
  font-size: 26rpx;
  color: #999;
}

.score-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #1890ff;
}

.canvas-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
}

.game-area {
  width: 100%;
  max-width: 600rpx;
  height: 600rpx;
  background: #fff8e6;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.walnut {
  position: absolute;
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64rpx;
  cursor: pointer;
  transition: transform 0.1s;
  transform: translate(-50%, -50%);
  user-select: none;

  &:active {
    transform: translate(-50%, -50%) scale(0.9);
  }

  &.cracked {
    animation: crack 0.5s ease-out;
  }
}

@keyframes crack {
  0% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
  }
}

.walnut-icon {
  pointer-events: none;
}

.hint {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
