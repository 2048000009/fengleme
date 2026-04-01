<script setup lang="ts">
import { ref, onMounted, onShow } from 'vue'
import { login, getUserInfo, setToken, getToken, isLogin } from '@/api'
import { getCheckinStats, doCheckin } from '@/api'
import { storage } from '@/utils/storage'
import taskSystem from '@/utils/taskSystem'

const isCheckedIn = ref(false)
const showQuoteModal = ref(false)
const currentQuote = ref('')
const showCertification = ref(false)
const certificationText = ref('')
const loading = ref(false)
const userInfo = ref<any>(null)
const checkinStats = ref<any>(null)
const checkinResult = ref<any>(null)

const checkinQuotes = [
  '签到成功！今天的你，比昨天更疯了一点 🎉',
  '恭喜签到！发疯的路上，你从不孤单 💪',
  '签到完成！今天也要元气满满地发疯哦 ✨',
  '签到成功！你的疯度已+1，继续加油 🚀',
  '签到啦！生活不易，发疯叹气 😤'
]

const certificationQuotes = [
  '欢迎加入疯友联盟，从今天起你就是我们的人了 🤝',
  '疯友认证成功！持证上岗，合法发疯 📜',
  '恭喜你成为正式疯友，发疯许可证已生效 🎫'
]

const loadData = async () => {
  try {
    if (isLogin()) {
      // 获取用户信息
      const userRes = await getUserInfo()
      userInfo.value = userRes.data
      
      // 获取签到统计
      const statsRes = await getCheckinStats()
      checkinStats.value = statsRes.data
      isCheckedIn.value = statsRes.data.isCheckedIn
    } else {
      // 加载匿名用户数据
      const anonymousData = storage.get('fengleme_anonymous_data')
      if (anonymousData) {
        checkinStats.value = {
          continuousDays: anonymousData.continuousDays || 0,
          totalDays: anonymousData.totalDays || 0,
          crazyPoints: anonymousData.crazyPoints || 0,
          level: anonymousData.level || '初入疯途',
          isCheckedIn: anonymousData.isCheckedIn || false
        }
        isCheckedIn.value = anonymousData.isCheckedIn || false
      } else {
        // 初始化匿名用户数据
        checkinStats.value = {
          continuousDays: 0,
          totalDays: 0,
          crazyPoints: 0,
          level: '初入疯途',
          isCheckedIn: false
        }
        isCheckedIn.value = false
      }
    }
  } catch (e) {
    console.error('加载数据失败', e)
  }
}

const checkIn = async () => {
  if (isCheckedIn.value) return
  
  loading.value = true
  try {
    if (isLogin()) {
      // 登录用户签到
      const res = await doCheckin()
      checkinResult.value = res.data
      isCheckedIn.value = true
      
      // 更新签到到任务系统
      taskSystem.completeTask('signIn')
      
      // 更新统计
      checkinStats.value.continuousDays = res.data.continuousDays
      checkinStats.value.totalDays = res.data.totalDays
      checkinStats.value.crazyPoints = res.data.crazyPoints
      checkinStats.value.level = res.data.level
    } else {
      // 匿名用户签到
      const anonymousData = storage.get('fengleme_anonymous_data') || {
        continuousDays: 0,
        totalDays: 0,
        crazyPoints: 0,
        level: '初入疯途',
        isCheckedIn: false,
        lastCheckinDate: ''
      }
      
      // 计算连续签到天数
      const today = new Date().toISOString().split('T')[0]
      let continuousDays = anonymousData.continuousDays
      if (anonymousData.lastCheckinDate) {
        const lastDate = new Date(anonymousData.lastCheckinDate)
        const todayDate = new Date(today)
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          continuousDays++
        } else if (diffDays > 1) {
          continuousDays = 1
        }
      } else {
        continuousDays = 1
      }
      
      // 更新数据
      const points = 15 // 固定奖励15疯度
      const newData = {
        continuousDays,
        totalDays: anonymousData.totalDays + 1,
        crazyPoints: anonymousData.crazyPoints + points,
        level: getAnonymousLevel(anonymousData.crazyPoints + points),
        isCheckedIn: true,
        lastCheckinDate: today
      }
      
      // 保存数据
      storage.set('fengleme_anonymous_data', newData)
      
      // 更新界面
      checkinResult.value = {
        continuousDays: newData.continuousDays,
        totalDays: newData.totalDays,
        crazyPoints: newData.crazyPoints,
        level: newData.level,
        points,
        message: `连续签到${newData.continuousDays}天！`,
        todayRank: Math.floor(Math.random() * 100) + 1
      }
      
      isCheckedIn.value = true
      checkinStats.value = {
        ...checkinStats.value,
        continuousDays: newData.continuousDays,
        totalDays: newData.totalDays,
        crazyPoints: newData.crazyPoints,
        level: newData.level,
        isCheckedIn: true
      }
    }
    
    const randomCertIndex = Math.floor(Math.random() * certificationQuotes.length)
    certificationText.value = certificationQuotes[randomCertIndex]
    
    const randomQuoteIndex = Math.floor(Math.random() * checkinQuotes.length)
    currentQuote.value = checkinQuotes[randomQuoteIndex]
    
    showCertification.value = true
  } catch (e) {
    console.error('签到失败', e)
  } finally {
    loading.value = false
  }
}

const getAnonymousLevel = (points: number): string => {
  if (points >= 1000) return '疯魔在世'
  if (points >= 500) return '疯癫大师'
  if (points >= 200) return '半疯半癫'
  if (points >= 100) return '初露疯芒'
  if (points >= 50) return '疯途新秀'
  return '初入疯途'
}

const closeCertification = () => {
  showCertification.value = false
  setTimeout(() => {
    showQuoteModal.value = true
  }, 300)
}

const closeModal = () => {
  showQuoteModal.value = false
}

onMounted(() => {
  loadData()
})

onShow(() => {
  loadData()
})
</script>

<template>
  <view class="container">
    <view class="main-section">
      <view 
        class="checkin-btn" 
        :class="{ 'checked': isCheckedIn }"
        @click="checkIn"
      >
        <view class="btn-inner">
          <image v-if="!isCheckedIn" class="btn-logo" src="/logo1.png" mode="aspectFit"></image>
          <template v-else>
            <text class="btn-icon-text">🤪</text>
            <text class="btn-label">{{ loading ? '签到中...' : '已发疯' }}</text>
          </template>
        </view>
        <text v-if="!isCheckedIn" class="btn-text">疯批签到</text>
      </view>
    </view>

    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-number">{{ checkinStats?.continuousDays || 0 }}</text>
        <text class="stat-label">连续发疯天数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-number">{{ checkinStats?.crazyPoints || 0 }}</text>
        <text class="stat-label">累计疯度</text>
      </view>
    </view>

    <view class="info-card">
      <view class="info-header">
        <text class="info-title">发疯指南</text>
      </view>
      <view class="info-content">
        <text class="info-line">每日点击按钮完成发疯签到</text>
        <text class="info-line">连续2天未签到，即刻自动联系紧急联系人</text>
      </view>
    </view>

    <view class="certification-mask" v-if="showCertification" @click="closeCertification">
      <view class="certification-modal bounce-in" @click.stop>
        <view class="cert-icon pulse">🏆</view>
        <text class="cert-title">疯友认证</text>
        <text class="cert-name">{{ checkinResult?.level || '初入疯途' }}</text>
        <text class="cert-desc">{{ certificationText }}</text>
        <view class="cert-points">
          <text class="points-label">本次获得</text>
          <text class="points-value">+{{ checkinResult?.points || 0 }}</text>
          <text class="points-unit">疯度</text>
        </view>
        <text class="cert-time-msg">{{ checkinResult?.message || '' }}</text>
        <text class="cert-rank-msg">你是今日第 {{ checkinResult?.todayRank || 1 }} 个发疯的疯友 🎉</text>
        <view class="cert-btn" @click="closeCertification">
          <text class="cert-btn-text">收下认证</text>
        </view>
      </view>
    </view>

    <view class="quote-modal-mask" v-if="showQuoteModal" @click="closeModal">
      <view class="quote-modal" @click.stop>
        <text class="modal-quote">{{ currentQuote }}</text>
        <view class="modal-btn" @click="closeModal">
          <text class="modal-btn-text">知道了</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #F5F5F7;
  display: flex;
  flex-direction: column;
  padding: 0;
  padding-top: calc(60rpx + constant(safe-area-inset-top));
  padding-top: calc(60rpx + env(safe-area-inset-top));
  padding-bottom: 120rpx;
}

.main-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 360rpx 0 40rpx;
}

.checkin-btn {
  width: 360rpx;
  height: 360rpx;
  border-radius: 50%;
  background: #22D7FF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 40rpx rgba(34, 215, 255, 0.4), 
              0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.checked {
    background: #C0C0C0;
    opacity: 0.6;
    pointer-events: none;
  }
}

.btn-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.btn-icon-text {
  font-size: 80rpx;
  margin-bottom: 8rpx;
}

.btn-logo {
  width: 160rpx;
  height: 160rpx;
  position: absolute;
  top: 90rpx;
}

.btn-label {
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 700;
}

.btn-text {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 700;
  position: absolute;
  bottom: 90rpx;
}

.stats-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 60rpx 80rpx;
  gap: 40rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 56rpx;
  font-weight: 800;
  color: #22D7FF;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #8E8E93;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #E5E5EA;
}

.info-card {
  background: transparent;
  border-radius: 24rpx;
  margin: 60rpx 32rpx 0;
  padding: 32rpx;
  box-shadow: none;
}

.info-header {
  margin-bottom: 16rpx;
}

.info-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1C1C1E;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.info-line {
  font-size: 26rpx;
  color: #8E8E93;
  line-height: 1.6;
}

.certification-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 48rpx;
}

.certification-modal {
  background: linear-gradient(180deg, #ffffff 0%, #F8FDFB 100%);
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  width: 100%;
  max-width: 560rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2rpx solid rgba(0, 212, 170, 0.2);
  box-shadow: 0 24rpx 48rpx rgba(0, 0, 0, 0.12);
}

.cert-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.cert-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1C1C1E;
  margin-bottom: 8rpx;
}

.cert-name {
  font-size: 36rpx;
  font-weight: 800;
  color: #00D4AA;
  margin-bottom: 16rpx;
}

.cert-desc {
  font-size: 26rpx;
  color: #8E8E93;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 24rpx;
}

.cert-points {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  background: linear-gradient(135deg, #00D4AA 0%, #00E6B8 100%);
  padding: 16rpx 32rpx;
  border-radius: 100rpx;
  margin-bottom: 16rpx;
}

.points-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.points-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #ffffff;
}

.points-unit {
  font-size: 24rpx;
  color: #ffffff;
}

.cert-time-msg {
  font-size: 24rpx;
  color: #8E8E93;
  margin-bottom: 16rpx;
}

.cert-rank-msg {
  font-size: 26rpx;
  color: #FF3B30;
  font-weight: 600;
  margin-bottom: 32rpx;
  text-align: center;
}

.cert-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #00D4AA 0%, #00B894 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cert-btn-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
}

.quote-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 998;
  padding: 48rpx;
}

.quote-modal {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  width: 100%;
  max-width: 560rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 16rpx 32rpx rgba(0, 0, 0, 0.1);
}

.modal-quote {
  font-size: 28rpx;
  color: #1C1C1E;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 32rpx;
}

.modal-btn {
  width: 100%;
  height: 88rpx;
  background: #00D4AA;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-btn-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}

@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.5); }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.bounce-in {
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
