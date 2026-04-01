<script setup lang="ts">
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'
import taskSystem from '@/utils/taskSystem'
import { STORAGE_KEYS } from '@/utils/constants'
import { calculateRisk } from '@/api'

const HISTORY_KEY = STORAGE_KEYS.RISK_HISTORY
const STATS_KEY = STORAGE_KEYS.USAGE_STATS

type Step = 'question' | 'result'

const currentStep = ref<Step>('question')
const currentQuestion = ref(0)
const answers = ref<number[]>([])
const loading = ref(false)

// API返回的结果
const riskResult = ref<{
  legal: number
  social: number
  medical: number
  total: number
  conclusion: string
  alternatives: string[]
  comment: string
} | null>(null)

const riskQuestions = [
  { 
    question: '最近是否经常对着空气自言自语？', 
    options: ['从不', '偶尔', '经常', '一直在说话'], 
    scores: [0, 10, 20, 30],
    type: 'social'
  },
  { 
    question: '是否会在公共场合突然大笑或自言自语？', 
    options: ['从不', '偶尔', '经常', '已经不在乎别人眼光了'], 
    scores: [0, 10, 20, 30],
    type: 'social'
  },
  { 
    question: '是否经常在脑子里和假想的人对话？', 
    options: ['从不', '偶尔', '经常', '他们经常回话'], 
    scores: [0, 10, 20, 30],
    type: 'medical'
  },
  { 
    question: '是否会在深夜突然想通人生然后第二天又忘了？', 
    options: ['从不', '偶尔', '经常', '每天都在重复'], 
    scores: [0, 10, 20, 30],
    type: 'medical'
  },
  { 
    question: '是否会对着镜子里的自己说话或做表情？', 
    options: ['从不', '偶尔', '经常', '镜子里的人是朋友'], 
    scores: [0, 10, 20, 30],
    type: 'social'
  },
  { 
    question: '是否会在床上躺着想事情然后突然坐起来？', 
    options: ['从不', '偶尔', '经常', '已经坐起来无数次了'], 
    scores: [0, 10, 20, 30],
    type: 'medical'
  },
  { 
    question: '是否会对着手机屏幕傻笑然后意识到自己在笑？', 
    options: ['从不', '偶尔', '经常', '一直在笑'], 
    scores: [0, 10, 20, 30],
    type: 'social'
  },
  { 
    question: '是否会在洗澡时突然想通人生然后出来又忘了？', 
    options: ['从不', '偶尔', '经常', '洗澡时是哲学家'], 
    scores: [0, 10, 20, 30],
    type: 'medical'
  }
]

const selectAnswer = (score: number) => {
  uni.vibrateShort({ type: 'light' })
  answers.value.push(score)
  
  if (currentQuestion.value < riskQuestions.length - 1) {
    currentQuestion.value++
  } else {
    calculateResult()
  }
}

const calculateResult = async () => {
  loading.value = true
  
  try {
    // 构建answers数组，包含score和type
    const answersData = answers.value.map((score, index) => ({
      score,
      type: riskQuestions[index].type
    }))
    
    // 调用后端API
    const result = await calculateRisk({ answers: answersData })
    riskResult.value = result
    
    saveHistory()
    updateStats()
    currentStep.value = 'result'
  } catch (error) {
    uni.showToast({ title: '计算失败，请重试', icon: 'none' })
    console.error('Risk calculation error:', error)
  } finally {
    loading.value = false
  }
}

const getRiskLevel = computed(() => {
  if (!riskResult.value) return { text: '', color: '#999999', desc: '' }
  
  const total = riskResult.value.total
  if (total <= 25) return { text: '安全', color: '#10b981', desc: '您是标准正常人，继续保持！' }
  if (total <= 50) return { text: '低危', color: '#22c55e', desc: '轻微戏精体质，日常小疯怡情。' }
  if (total <= 75) return { text: '中危', color: '#f59e0b', desc: '戏精本精，日常行为迷惑。' }
  return { text: '高危', color: '#ef4444', desc: '满级迷惑行为，建议原地放假！' }
})

const saveHistory = () => {
  if (!riskResult.value) return
  
  const history = storage.get<Array<{ date: string; score: number; label: string }>>(HISTORY_KEY) || []
  history.unshift({
    date: new Date().toISOString(),
    score: riskResult.value.total,
    label: riskResult.value.conclusion
  })
  storage.set(HISTORY_KEY, history.slice(0, 50))
}

const updateStats = () => {
  const stats = storage.get<{ riskCheckCount: number }>(STATS_KEY) || { riskCheckCount: 0 }
  stats.riskCheckCount = (stats.riskCheckCount || 0) + 1
  storage.set(STATS_KEY, stats)
  taskSystem.completeTask('riskTest')
}

const resetTest = () => {
  uni.vibrateShort({ type: 'light' })
  currentStep.value = 'question'
  currentQuestion.value = 0
  answers.value = []
  riskResult.value = null
}

const prevQuestion = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
    answers.value.pop()
  }
}

const saveImage = () => {
  if (!riskResult.value) return
  
  uni.showLoading({ title: '生成图片中...' })
  
  const query = uni.createSelectorQuery()
  query.select('.result-card').boundingClientRect()
  query.exec(async (res) => {
    if (!res || !res[0]) {
      uni.hideLoading()
      uni.showToast({ title: '生成图片失败', icon: 'none' })
      return
    }
    
    try {
      const canvasId = 'riskCanvas'
      const ctx = uni.createCanvasContext(canvasId)
      
      const canvasWidth = 750
      const canvasHeight = 1200
      
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      
      ctx.fillStyle = '#666666'
      ctx.font = '32px sans-serif'
      ctx.fillText('疯险自检结果', 50, 60)
      
      ctx.fillStyle = getRiskLevel.value.color
      ctx.font = 'bold 80px sans-serif'
      ctx.fillText(riskResult.value.total.toString(), 50, 200)
      
      ctx.fillStyle = '#999999'
      ctx.font = '32px sans-serif'
      ctx.fillText('分', 150, 200)
      
      ctx.fillStyle = getRiskLevel.value.color
      ctx.font = 'bold 48px sans-serif'
      ctx.fillText(getRiskLevel.value.text, 50, 300)
      
      ctx.fillStyle = '#666666'
      ctx.font = '36px sans-serif'
      ctx.fillText('疯险标签：' + riskResult.value.conclusion, 50, 380)
      
      ctx.fillStyle = '#999999'
      ctx.font = '28px sans-serif'
      const descLines = wrapText(ctx, getRiskLevel.value.desc, 50, 460, 650)
      descLines.forEach((line, index) => {
        ctx.fillText(line, 50, 460 + index * 40)
      })
      
      ctx.fillStyle = '#666666'
      ctx.font = 'bold 36px sans-serif'
      ctx.fillText('详细评分', 50, 600)
      
      const scoreItems = [
        { label: '法律风险', value: riskResult.value.legal, color: '#3b82f6' },
        { label: '社交风险', value: riskResult.value.social, color: '#f59e0b' },
        { label: '健康风险', value: riskResult.value.medical, color: '#ef4444' }
      ]
      
      scoreItems.forEach((item, index) => {
        const y = 680 + index * 120
        ctx.fillStyle = '#999999'
        ctx.font = '28px sans-serif'
        ctx.fillText(item.label, 50, y)
        
        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(50, y + 20, 600, 20)
        
        ctx.fillStyle = item.color
        ctx.fillRect(50, y + 20, 600 * (item.value / 100), 20)
        
        ctx.fillStyle = '#666666'
        ctx.font = 'bold 32px sans-serif'
        ctx.fillText(item.value.toString(), 670, y + 10)
      })
      
      ctx.fillStyle = '#cccccc'
      ctx.font = '24px sans-serif'
      ctx.fillText('—— 疯了么 App', 50, 1150)
      
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
  })
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
  if (!riskResult.value) return
  
  taskSystem.completeTask('share')
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    title: `我的疯险等级是「${riskResult.value.conclusion}」，风险指数${riskResult.value.total}分`,
    summary: '来测测你的疯险等级吧！',
    success: () => {
      uni.showToast({ title: '分享成功', icon: 'success' })
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
      <view v-if="currentStep === 'question'" class="question-section">
        <view class="page-header">
          <text class="page-title">疯险行为自检</text>
          <text class="page-subtitle">请根据最近两周的真实情况回答</text>
        </view>

        <view class="progress-bar">
          <view 
            v-for="i in riskQuestions.length" 
            :key="i" 
            class="progress-dot"
            :class="{ 
              active: i === currentQuestion + 1, 
              completed: i <= currentQuestion 
            }"
          ></view>
        </view>

        <view class="question-card">
          <view class="question-header">
            <text class="question-number">第 {{ currentQuestion + 1 }} / {{ riskQuestions.length }} 题</text>
          </view>
          
          <text class="question-text">{{ riskQuestions[currentQuestion].question }}</text>
          
          <view class="options-list">
            <view
              v-for="(option, index) in riskQuestions[currentQuestion].options"
              :key="index"
              class="option-item"
              :class="{ disabled: loading }"
              @click="!loading && selectAnswer(riskQuestions[currentQuestion].scores[index])"
            >
              <view class="option-index">{{ ['A', 'B', 'C', 'D'][index] }}</view>
              <text class="option-text">{{ option }}</text>
            </view>
          </view>
        </view>

        <view v-if="currentQuestion > 0" class="back-btn" @click="prevQuestion">
          <text class="back-text">← 上一题</text>
        </view>

        <!-- 加载状态 -->
        <view v-if="loading" class="loading-overlay">
          <view class="loading-spinner"></view>
          <text class="loading-text">正在计算中...</text>
        </view>
      </view>

      <view v-if="currentStep === 'result' && riskResult" class="result-section">
        <view class="result-card">
          <view class="result-header">
            <text class="result-label">疯险评估结果</text>
          </view>
          
          <view class="score-display">
            <view class="score-circle" :style="{ 
              background: `conic-gradient(${getRiskLevel.color} ${riskResult.total * 3.6}deg, rgba(255,255,255,0.3) ${riskResult.total * 3.6}deg)` 
            }">
              <view class="score-inner">
                <text class="score-number" :style="{ color: getRiskLevel.color }">{{ riskResult.total }}</text>
                <text class="score-unit">分</text>
              </view>
            </view>
          </view>

          <view class="level-badge" :style="{ background: 'rgba(255,255,255,0.6)' }">
            <view class="level-dot" :style="{ background: getRiskLevel.color }"></view>
            <text class="level-text" :style="{ color: getRiskLevel.color }">{{ getRiskLevel.text }}</text>
          </view>

          <view class="label-card">
            <text class="label-title">你的疯险标签</text>
            <text class="label-text">{{ riskResult.conclusion }}</text>
          </view>

          <view class="desc-box">
            <text class="desc-text">{{ getRiskLevel.desc }}</text>
          </view>

          <!-- 详细评分 -->
          <view class="detail-scores">
            <view class="detail-item">
              <text class="detail-label">法律风险</text>
              <view class="detail-bar">
                <view class="detail-fill" :style="{ width: riskResult.legal + '%', background: '#3b82f6' }"></view>
              </view>
              <text class="detail-value">{{ riskResult.legal }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">社交风险</text>
              <view class="detail-bar">
                <view class="detail-fill" :style="{ width: riskResult.social + '%', background: '#f59e0b' }"></view>
              </view>
              <text class="detail-value">{{ riskResult.social }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">健康风险</text>
              <view class="detail-bar">
                <view class="detail-fill" :style="{ width: riskResult.medical + '%', background: '#ef4444' }"></view>
              </view>
              <text class="detail-value">{{ riskResult.medical }}</text>
            </view>
          </view>

          <!-- 建议替代方案 -->
          <view v-if="riskResult.alternatives && riskResult.alternatives.length > 0" class="alternatives-box">
            <text class="alternatives-title">建议替代方案</text>
            <view class="alternatives-list">
              <text v-for="(alt, idx) in riskResult.alternatives" :key="idx" class="alternative-item">
                {{ idx + 1 }}. {{ alt }}
              </text>
            </view>
          </view>

          <!-- 评论 -->
          <view v-if="riskResult.comment" class="comment-box">
            <text class="comment-title">专业点评</text>
            <text class="comment-text">{{ riskResult.comment }}</text>
          </view>

          <view class="progress-section">
            <view class="progress-bar-h">
              <view class="progress-fill" :style="{ width: riskResult.total + '%', background: getRiskLevel.color }"></view>
            </view>
            <view class="progress-labels">
              <text>安全</text>
              <text>低危</text>
              <text>中危</text>
              <text>高危</text>
            </view>
          </view>
        </view>

        <view class="action-buttons">
          <view class="action-btn secondary" @click="resetTest">
            <text class="btn-text">重新测试</text>
          </view>
          <view class="action-btn primary" @click="saveImage">
            <text class="btn-text">保存图片</text>
          </view>
          <view class="action-btn accent" @click="shareResult">
            <text class="btn-text">分享结果</text>
          </view>
        </view>
      </view>
    </view>
    
    <canvas canvas-id="riskCanvas" style="position: fixed; left: -9999px; width: 750px; height: 1200px;"></canvas>
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
  background: rgba(245, 158, 11, 0.25);
  top: -150rpx;
  right: -100rpx;
}

.blob-2 {
  width: 400rpx;
  height: 400rpx;
  background: rgba(239, 68, 68, 0.2);
  bottom: 200rpx;
  left: -120rpx;
}

.blob-3 {
  width: 350rpx;
  height: 350rpx;
  background: rgba(249, 115, 22, 0.2);
  bottom: -100rpx;
  right: -80rpx;
}

.content {
  position: relative;
  z-index: 1;
  padding: 30rpx;
  padding-top: calc(30rpx + constant(safe-area-inset-top));
  padding-top: calc(30rpx + env(safe-area-inset-top));
}

.question-section, .result-section {
  position: relative;
  z-index: 1;
}

.page-header {
  padding: 20rpx 0 32rpx;
  text-align: center;
}

.page-title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 8rpx;
}

.page-subtitle {
  display: block;
  font-size: 26rpx;
  color: #666666;
}

.progress-bar {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 32rpx;
}

.progress-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
  
  &.active {
    width: 40rpx;
    border-radius: 8rpx;
    background: rgba(245, 158, 11, 0.8);
    border: none;
  }
  
  &.completed {
    background: rgba(245, 158, 11, 0.8);
    border: none;
  }
}

.question-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);
  border-radius: 28rpx;
  padding: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 24rpx;
}

.question-header {
  margin-bottom: 24rpx;
}

.question-number {
  font-size: 26rpx;
  color: #666666;
}

.question-text {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.6;
  margin-bottom: 32rpx;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  
  &:active {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.4);
  }
  
  &.disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}

.option-index {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
  margin-right: 16rpx;
}

.option-text {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.back-btn {
  text-align: center;
  padding: 20rpx;
}

.back-text {
  font-size: 28rpx;
  color: #666666;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(245, 158, 11, 0.2);
  border-top-color: rgba(245, 158, 11, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #666666;
}

.result-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(40rpx);
  -webkit-backdrop-filter: blur(40rpx);
  border-radius: 28rpx;
  padding: 48rpx 32rpx;
  text-align: center;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 24rpx;
}

.result-header {
  margin-bottom: 32rpx;
}

.result-label {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
}

.score-display {
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.score-circle {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-inner {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-number {
  font-size: 56rpx;
  font-weight: 800;
  line-height: 1;
}

.score-unit {
  font-size: 24rpx;
  color: #999999;
  margin-top: 4rpx;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 28rpx;
  border-radius: 100rpx;
  margin-bottom: 24rpx;
}

.level-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}

.level-text {
  font-size: 28rpx;
  font-weight: 600;
}

.label-card {
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.label-title {
  display: block;
  font-size: 24rpx;
  color: #888888;
  margin-bottom: 8rpx;
}

.label-text {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.desc-box {
  padding: 20rpx 24rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.desc-text {
  font-size: 26rpx;
  color: #333333;
  line-height: 1.6;
}

.detail-scores {
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  width: 120rpx;
  font-size: 24rpx;
  color: #666666;
  text-align: left;
}

.detail-bar {
  flex: 1;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6rpx;
  overflow: hidden;
  margin: 0 16rpx;
}

.detail-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.5s ease;
}

.detail-value {
  width: 60rpx;
  font-size: 24rpx;
  color: #333333;
  font-weight: 600;
  text-align: right;
}

.alternatives-box {
  padding: 24rpx;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  text-align: left;
}

.alternatives-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #22c55e;
  margin-bottom: 12rpx;
}

.alternatives-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.alternative-item {
  font-size: 24rpx;
  color: #333333;
  line-height: 1.5;
}

.comment-box {
  padding: 24rpx;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  text-align: left;
}

.comment-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #f59e0b;
  margin-bottom: 12rpx;
}

.comment-text {
  font-size: 24rpx;
  color: #333333;
  line-height: 1.6;
}

.progress-section {
  padding: 0 16rpx;
}

.progress-bar-h {
  height: 16rpx;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.progress-fill {
  height: 100%;
  border-radius: 8rpx;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: #999999;
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
    background: rgba(245, 158, 11, 0.85);
    backdrop-filter: blur(20rpx);
    -webkit-backdrop-filter: blur(20rpx);
    
    .btn-text {
      color: #fff;
    }
  }
  
  &.accent {
    background: rgba(239, 68, 68, 0.85);
    backdrop-filter: blur(20rpx);
    -webkit-backdrop-filter: blur(20rpx);
    
    .btn-text {
      color: #fff;
    }
  }
}

.btn-text {
  font-size: 28rpx;
  font-weight: 600;
}
</style>
