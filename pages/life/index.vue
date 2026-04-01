<script setup lang="ts">
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'
import taskSystem from '@/utils/taskSystem'
import { STORAGE_KEYS } from '@/utils/constants'
import { validateDate } from '@/utils/validate'
import { calculateLifeBalance } from '@/api'

const HISTORY_KEY = STORAGE_KEYS.LIFE_HISTORY
const STATS_KEY = STORAGE_KEYS.USAGE_STATS

type LifestyleType = 'steady' | 'occasional' | 'reckless'

const showResult = ref(false)
const loading = ref(false)

const birthDate = ref('')
const lifestyle = ref<LifestyleType>('steady')

interface LifeBalanceResult {
  years: number
  months: number
  totalMonths: number
  suggestion: string
}

const resultData = ref<LifeBalanceResult>({
  years: 0,
  months: 0,
  totalMonths: 0,
  suggestion: ''
})

const lifestyleOptions = [
  { label: '稳健型', value: 'steady', desc: '规律作息，健康生活' },
  { label: '偶尔放纵', value: 'occasional', desc: '适度放松，劳逸结合' },
  { label: '及时行乐', value: 'reckless', desc: '活在当下，享受人生' }
]

const onDateChange = (e: any) => {
  birthDate.value = e.detail.value
}

const calculate = async () => {
  if (!validateDate(birthDate.value)) {
    uni.showToast({ title: '请选择有效的出生日期', icon: 'none' })
    return
  }

  uni.vibrateShort({ type: 'medium' })
  loading.value = true

  try {
    const response = await calculateLifeBalance({
      birthDate: birthDate.value,
      lifestyle: lifestyle.value
    })

    resultData.value = response
    saveHistory()
    updateStats()
    showResult.value = true
  } catch (error) {
    uni.showToast({ title: '计算失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const saveHistory = () => {
  const history = storage.get<Array<{ date: string; type: string; totalMonths: number }>>(HISTORY_KEY) || []
  history.unshift({
    date: new Date().toISOString(),
    type: lifestyle.value,
    totalMonths: resultData.value.totalMonths
  })
  storage.set(HISTORY_KEY, history.slice(0, 50))
}

const updateStats = () => {
  const stats = storage.get<{ lifeCalcCount: number }>(STATS_KEY) || { lifeCalcCount: 0 }
  stats.lifeCalcCount = (stats.lifeCalcCount || 0) + 1
  storage.set(STATS_KEY, stats)
}

const reset = () => {
  uni.vibrateShort({ type: 'light' })
  showResult.value = false
  birthDate.value = ''
  lifestyle.value = 'steady'
}

const saveImage = () => {
  if (!resultData.value || resultData.value.totalMonths === 0) return
  
  uni.showLoading({ title: '生成图片中...' })
  
  try {
    const canvasId = 'lifeCanvas'
    const ctx = uni.createCanvasContext(canvasId)
    
    const canvasWidth = 750
    const canvasHeight = 1000
    
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    ctx.fillStyle = '#666666'
    ctx.font = '32px sans-serif'
    ctx.fillText('人生余额计算结果', 50, 60)
    
    ctx.fillStyle = '#002fa7'
    ctx.font = 'bold 100px sans-serif'
    ctx.fillText(resultData.value.years.toString(), 50, 200)
    
    ctx.fillStyle = '#999999'
    ctx.font = '36px sans-serif'
    ctx.fillText('年', 180, 200)
    
    ctx.fillStyle = '#002fa7'
    ctx.font = 'bold 80px sans-serif'
    ctx.fillText(resultData.value.months.toString(), 250, 200)
    
    ctx.fillStyle = '#999999'
    ctx.font = '36px sans-serif'
    ctx.fillText('个月', 380, 200)
    
    ctx.fillStyle = '#666666'
    ctx.font = '32px sans-serif'
    ctx.fillText('人生余额', 50, 300)
    
    const lifestyleLabel = lifestyleOptions.find(l => l.value === lifestyle.value)?.label || ''
    ctx.fillStyle = '#999999'
    ctx.font = '28px sans-serif'
    ctx.fillText('生活方式：' + lifestyleLabel, 50, 380)
    
    ctx.fillStyle = '#666666'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('建议', 50, 460)
    
    ctx.fillStyle = '#999999'
    ctx.font = '28px sans-serif'
    const suggestionLines = wrapText(ctx, resultData.value.suggestion, 50, 520, 650)
    suggestionLines.forEach((line, index) => {
      ctx.fillText(line, 50, 520 + index * 40)
    })
    
    ctx.fillStyle = '#cccccc'
    ctx.font = '24px sans-serif'
    ctx.fillText('—— 疯了么 App', 50, 950)
    
    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvasId: canvasId,
          width: canvasWidth,
          height: canvasHeight,
          destWidth: canvasWidth,
          destHeight: canvasHeight,
          success: (res) => {
            uni.hideLoading()
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                uni.showToast({ title: '保存成功', icon: 'success' })
              },
              fail: () => {
                uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
              }
            })
          },
          fail: () => {
            uni.hideLoading()
            uni.showToast({ title: '生成图片失败', icon: 'none' })
          }
        })
      }, 500)
    })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '生成图片失败', icon: 'none' })
  }
}

const wrapText = (ctx: any, text: string, x: number, y: number, maxWidth: number) => {
  const words = text.split('')
  const lines = []
  let currentLine = words[0]
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const width = ctx.measureText(currentLine + word).width
    if (width < maxWidth) {
      currentLine += word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)
  return lines
}

const shareResult = () => {
  const lifestyleLabel = lifestyleOptions.find(l => l.value === lifestyle.value)?.label || ''
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    title: `我的人生余额：还有 ${resultData.value.years}年${resultData.value.months}个月`,
    summary: `生活方式：${lifestyleLabel}。${resultData.value.suggestion}`,
    success: () => {
      uni.showToast({ title: '分享成功', icon: 'success' })
      taskSystem.completeTask('share')
    },
    fail: () => {
      uni.showToast({ title: '分享失败', icon: 'none' })
    }
  })
}
</script>

<template>
  <view class="container">
    <view class="bg-layer">
      <view class="gradient-blob blob-1"></view>
      <view class="gradient-blob blob-2"></view>
      <view class="gradient-blob blob-3"></view>
    </view>

    <view class="content">
      <view class="header">
        <text class="header-title">人生计算器</text>
        <text class="header-subtitle">计算你的人生余额</text>
      </view>

      <view v-if="!showResult" class="input-section">
        <view class="input-card">
          <view class="input-item">
            <view class="item-header">
              <text class="item-icon">📅</text>
              <text class="item-title">出生日期</text>
            </view>
            <picker mode="date" :value="birthDate" @change="onDateChange">
              <view class="picker-display" :class="{ active: birthDate }">
                <text class="picker-text">{{ birthDate || '请选择出生日期' }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>

          <view class="input-item">
            <view class="item-header">
              <text class="item-icon">🎯</text>
              <text class="item-title">生活方式</text>
            </view>
            <view class="lifestyle-options">
              <view
                v-for="opt in lifestyleOptions"
                :key="opt.value"
                class="lifestyle-item"
                :class="{ active: lifestyle === opt.value }"
                @click="lifestyle = opt.value as LifestyleType"
              >
                <text class="lifestyle-label">{{ opt.label }}</text>
                <text class="lifestyle-desc">{{ opt.desc }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="submit-btn" :class="{ loading: loading }" @click="calculate">
          <text class="btn-text">{{ loading ? '计算中...' : '开始计算' }}</text>
        </view>
      </view>

      <view v-if="showResult" class="result-section">
        <view class="result-card">
          <view class="result-header">
            <text class="result-title">人生余额</text>
          </view>

          <view class="time-display">
            <view class="time-item">
              <text class="time-value">{{ resultData.years }}</text>
              <text class="time-unit">年</text>
            </view>
            <view class="time-item">
              <text class="time-value">{{ resultData.months }}</text>
              <text class="time-unit">月</text>
            </view>
          </view>

          <view class="total-months">
            <text class="total-label">总计</text>
            <text class="total-value">{{ resultData.totalMonths }} 个月</text>
          </view>

          <view class="result-desc">
            <text class="desc-text">{{ resultData.suggestion }}</text>
          </view>
        </view>

        <view class="action-buttons">
          <view class="action-btn secondary" @click="reset">
            <text class="btn-text">重新计算</text>
          </view>
          <view class="action-btn primary" @click="saveImage">
            <text class="btn-text">保存图片</text>
          </view>
          <view class="action-btn accent" @click="shareResult">
            <text class="btn-text">分享</text>
          </view>
        </view>
      </view>
      
      <canvas canvas-id="lifeCanvas" style="position: fixed; left: -9999px; width: 750px; height: 1000px;"></canvas>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.bg-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 50%, #d5dbe3 100%);
  z-index: 0;
}

.gradient-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80rpx);
}

.blob-1 {
  width: 500rpx;
  height: 500rpx;
  background: rgba(34, 215, 255, 0.25);
  top: -150rpx;
  right: -100rpx;
}

.blob-2 {
  width: 400rpx;
  height: 400rpx;
  background: rgba(0, 47, 167, 0.2);
  bottom: 200rpx;
  left: -120rpx;
}

.blob-3 {
  width: 350rpx;
  height: 350rpx;
  background: rgba(0, 47, 167, 0.2);
  bottom: -100rpx;
  right: -80rpx;
}

.content {
  position: relative;
  z-index: 1;
  padding: 30rpx;
  padding-top: calc(30rpx + constant(safe-area-inset-top));
  padding-top: calc(30rpx + env(safe-area-inset-top));
  padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

.header {
  text-align: center;
  padding: 20rpx 0 24rpx;
}

.header-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 6rpx;
}

.header-subtitle {
  display: block;
  font-size: 24rpx;
  color: #666666;
}

.input-section, .result-section {
  position: relative;
  z-index: 1;
}

.input-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
}

.input-item {
  padding: 16rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.5);
  }
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.item-icon {
  font-size: 24rpx;
  margin-right: 10rpx;
}

.item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a2e;
}

.picker-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  
  &.active {
    background: rgba(34, 215, 255, 0.15);
    border-color: rgba(34, 215, 255, 0.4);
  }
}

.picker-text {
  font-size: 28rpx;
  color: #333333;
}

.picker-arrow {
  font-size: 32rpx;
  color: #999999;
}

.lifestyle-options {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.lifestyle-item {
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  gap: 4rpx;

  &.active {
    background: rgba(34, 215, 255, 0.85);

    .lifestyle-label, .lifestyle-desc {
      color: #fff;
    }
  }
}

.lifestyle-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.lifestyle-desc {
  font-size: 24rpx;
  color: #666666;
}

.submit-btn {
  height: 96rpx;
  background: #22D7FF;
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.85;
    transform: scale(0.98);
  }

  &.loading {
    opacity: 0.7;
    pointer-events: none;
  }

  .btn-text {
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
  }
}

.result-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);
  border-radius: 28rpx;
  padding: 40rpx 32rpx;
  text-align: center;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  margin-bottom: 20rpx;
}

.result-header {
  margin-bottom: 32rpx;
}

.result-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.time-display {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.time-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 32rpx;
  background: rgba(0, 47, 167, 0.15);
  border-radius: 16rpx;
}

.time-value {
  font-size: 48rpx;
  font-weight: 800;
  color: #22D7FF;
  line-height: 1;
}

.time-unit {
  font-size: 24rpx;
  color: #22D7FF;
  margin-top: 4rpx;
}

.total-months {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background: rgba(0, 47, 167, 0.1);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.total-label {
  font-size: 26rpx;
  color: #666666;
}

.total-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #22D7FF;
}

.result-desc {
  padding: 20rpx 24rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16rpx;
}

.desc-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    opacity: 0.85;
    transform: scale(0.98);
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(40rpx);
    -webkit-backdrop-filter: blur(40rpx);
    border: 1rpx solid rgba(255, 255, 255, 0.5);
    
    .btn-text {
      color: #333333;
    }
  }
  
  &.primary {
    background: #22D7FF;
    
    .btn-text {
      color: #fff;
    }
  }
  
  &.accent {
    background: rgba(245, 87, 108, 0.85);
    
    .btn-text {
      color: #fff;
    }
  }
  
  .btn-text {
    font-size: 28rpx;
    font-weight: 600;
  }
}
</style>
