<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCheckinSettings, saveCheckinSettings, type CheckinSettings } from '@/api/user'

const safetyDays = ref(3)
const reminderEnabled = ref(true)
const reminderTime = ref('20:30')
const reminderMethod = ref<'email' | 'push'>('push')
const isLoading = ref(false)
const isSaving = ref(false)

const loadSettings = async () => {
  isLoading.value = true
  try {
    const res = await getCheckinSettings()
    if (res.data) {
      safetyDays.value = res.data.safetyDays
      reminderEnabled.value = res.data.reminderEnabled
      reminderTime.value = res.data.reminderTime
      reminderMethod.value = res.data.reminderMethod as 'email' | 'push'
    }
  } catch (error) {
    console.error('加载设置失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

const saveSettings = async () => {
  isSaving.value = true
  try {
    await saveCheckinSettings({
      safetyDays: safetyDays.value,
      reminderEnabled: reminderEnabled.value,
      reminderTime: reminderTime.value,
      reminderMethod: reminderMethod.value
    })
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('保存设置失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  } finally {
    isSaving.value = false
  }
}

const onSafetyDaysChange = (e: any) => {
  safetyDays.value = Math.round(e.detail.value / 16.67) + 1
  if (safetyDays.value < 1) safetyDays.value = 1
  if (safetyDays.value > 7) safetyDays.value = 7
  saveSettings()
}

const onReminderToggle = () => {
  reminderEnabled.value = !reminderEnabled.value
  saveSettings()
}

const onTimeClick = () => {
  uni.showActionSheet({
    itemList: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'],
    success: (res) => {
      const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30']
      reminderTime.value = times[res.tapIndex]
      saveSettings()
    }
  })
}

const selectReminderMethod = (method: 'email' | 'push') => {
  reminderMethod.value = method
  saveSettings()
}

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <view class="container">
    <view class="content">
      <view class="card">
        <view class="card-title">安全天数设置</view>
        <view class="card-subtitle">超过此天数未签到将通知紧急联系人</view>
        
        <view class="days-display">
          <text class="days-number">{{ safetyDays }}</text>
          <text class="days-unit">天</text>
        </view>
        
        <view class="slider-container">
          <slider 
            class="slider"
            :value="(safetyDays - 1) * (100 / 6)"
            min="0"
            max="100"
            :step="100 / 6"
            activeColor="#22D7FF"
            backgroundColor="#E5E5EA"
            block-size="20"
            @change="onSafetyDaysChange"
          />
          <view class="slider-labels">
            <text class="slider-label">1天</text>
            <text class="slider-label">7天</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">每日提醒</view>
        
        <view class="reminder-toggle">
          <view class="toggle-left">
            <view class="toggle-label">启用提醒</view>
            <view class="toggle-desc">每日定时提醒您签到</view>
          </view>
          <view 
            class="toggle-switch"
            :class="{ active: reminderEnabled }"
            @click="onReminderToggle"
          >
            <view class="toggle-dot"></view>
          </view>
        </view>
        
        <view class="divider"></view>
        
        <view class="time-picker" @click="onTimeClick">
          <view class="time-label">提醒时间</view>
          <view class="time-value">
            <text class="time-text">{{ reminderTime }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">提醒方式</view>
        
        <view class="method-option" @click="selectReminderMethod('email')">
          <view class="method-label">邮件</view>
          <view 
            class="method-radio"
            :class="{ active: reminderMethod === 'email' }"
          >
            <view v-if="reminderMethod === 'email'" class="radio-check"></view>
          </view>
        </view>
        
        <view class="divider"></view>
        
        <view class="method-option" @click="selectReminderMethod('push')">
          <view class="method-label">APP推送</view>
          <view 
            class="method-radio"
            :class="{ active: reminderMethod === 'push' }"
          >
            <view v-if="reminderMethod === 'push'" class="radio-check"></view>
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
}

.content {
  padding: 32rpx;
}

.card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1C1C1E;
  margin-bottom: 8rpx;
  display: block;
}

.card-subtitle {
  font-size: 24rpx;
  color: #8E8E93;
  margin-bottom: 32rpx;
  display: block;
}

.days-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 32rpx;
}

.days-number {
  font-size: 80rpx;
  font-weight: 700;
  color: #22D7FF;
  line-height: 1;
}

.days-unit {
  font-size: 28rpx;
  color: #1C1C1E;
  margin-left: 8rpx;
}

.slider-container {
  padding: 0 16rpx;
}

.slider {
  width: 100%;
  height: 8rpx;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 16rpx;
}

.slider-label {
  font-size: 24rpx;
  color: #8E8E93;
}

.reminder-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-left {
  flex: 1;
}

.toggle-label {
  font-size: 28rpx;
  color: #1C1C1E;
  display: block;
  margin-bottom: 4rpx;
}

.toggle-desc {
  font-size: 24rpx;
  color: #8E8E93;
  display: block;
}

.toggle-switch {
  width: 104rpx;
  height: 56rpx;
  background: #E5E5EA;
  border-radius: 28rpx;
  position: relative;
  transition: all 0.3s ease;

  &.active {
    background: #22D7FF;
  }
}

.toggle-dot {
  width: 48rpx;
  height: 48rpx;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  .toggle-switch.active & {
    left: 52rpx;
  }
}

.divider {
  height: 2rpx;
  background: #F5F5F7;
  margin: 32rpx 0;
}

.time-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-label {
  font-size: 28rpx;
  color: #1C1C1E;
}

.time-value {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.time-text {
  font-size: 28rpx;
  color: #8E8E93;
}

.arrow {
  font-size: 36rpx;
  color: #C7C7CC;
  font-weight: 300;
}

.method-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}

.method-label {
  font-size: 28rpx;
  color: #1C1C1E;
}

.method-radio {
  width: 44rpx;
  height: 44rpx;
  border: 3rpx solid #C7C7CC;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &.active {
    border-color: #22D7FF;
  }
}

.radio-check {
  width: 24rpx;
  height: 24rpx;
  background: #22D7FF;
  border-radius: 50%;
}
</style>
