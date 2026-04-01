<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { submitFeedback as submitFeedbackApi, getFeedbackList } from '@/api'
import { throttle } from '@/utils/debounce'

interface FeedbackItem {
  id: number
  type: string
  content: string
  contact?: string
  status: number
  reply?: string
  createTime: string
}

const feedbackTypes = [
  { value: 'bug', label: '功能异常', icon: '🐛' },
  { value: 'feature', label: '功能建议', icon: '💡' },
  { value: 'ui', label: '界面问题', icon: '🎨' },
  { value: 'other', label: '其他', icon: '📝' }
]

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待处理', color: '#FF9500' },
  1: { label: '处理中', color: '#007AFF' },
  2: { label: '已回复', color: '#22D7FF' }
}

const selectedType = ref('bug')
const feedbackContent = ref('')
const contact = ref('')
const submitting = ref(false)

// 反馈列表
const feedbackList = ref<FeedbackItem[]>([])
const loading = ref(false)
const page = ref(1)
const size = 20
const hasMore = ref(true)

const selectType = (type: string) => {
  selectedType.value = type
}

// 表单验证
const validateForm = (): boolean => {
  if (!feedbackContent.value.trim()) {
    uni.showToast({ title: '请输入反馈内容', icon: 'none' })
    return false
  }
  if (feedbackContent.value.trim().length < 5) {
    uni.showToast({ title: '反馈内容至少5个字符', icon: 'none' })
    return false
  }
  return true
}

const submit = throttle(async () => {
  if (!validateForm()) return
  if (submitting.value) return

  submitting.value = true

  try {
    await submitFeedbackApi(selectedType.value, feedbackContent.value.trim(), contact.value.trim())
    uni.showToast({ title: '提交成功，感谢反馈！', icon: 'success' })
    feedbackContent.value = ''
    contact.value = ''
    // 刷新列表
    page.value = 1
    hasMore.value = true
    await loadFeedbackList()
  } catch (error) {
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}, 1000)

// 加载反馈列表
const loadFeedbackList = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const res = await getFeedbackList(page.value, size)
    const list = (res as any).data || []
    if (page.value === 1) {
      feedbackList.value = list
    } else {
      feedbackList.value.push(...list)
    }
    if (list.length < size) {
      hasMore.value = false
    }
    page.value++
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 获取类型标签
const getTypeLabel = (type: string) => {
  const found = feedbackTypes.find(t => t.value === type)
  return found ? `${found.icon} ${found.label}` : type
}

// 获取状态信息
const getStatusInfo = (status: number) => {
  return statusMap[status] || { label: '未知', color: '#8E8E93' }
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  loadFeedbackList()
})
</script>

<template>
  <view class="container">
    <!-- 反馈表单 -->
    <view class="card">
      <view class="section-title">反馈类型</view>
      <view class="type-list">
        <view
          v-for="type in feedbackTypes"
          :key="type.value"
          class="type-item"
          :class="{ active: selectedType === type.value }"
          @click="selectType(type.value)"
        >
          <text class="type-icon">{{ type.icon }}</text>
          <text class="type-label">{{ type.label }}</text>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="section-title">反馈内容</view>
      <textarea
        class="feedback-textarea"
        v-model="feedbackContent"
        placeholder="请详细描述您遇到的问题或建议..."
        maxlength="500"
        :auto-height="true"
      />
      <view class="char-count">
        <text class="count-text">{{ feedbackContent.length }}/500</text>
      </view>
    </view>

    <view class="card">
      <view class="section-title">联系方式（选填）</view>
      <input
        class="contact-input"
        v-model="contact"
        placeholder="手机号/邮箱/QQ"
        maxlength="50"
      />
      <text class="contact-hint">留下联系方式，方便我们回复您</text>
    </view>

    <view class="submit-section">
      <view
        class="submit-btn"
        :class="{ disabled: !feedbackContent.trim() || submitting }"
        @click="submit"
      >
        <uni-icons type="paperplane" size="20" color="#ffffff" class="submit-icon"></uni-icons>
        <text class="submit-btn-text">{{ submitting ? '提交中...' : '提交反馈' }}</text>
      </view>
    </view>

    <!-- 反馈历史列表 -->
    <view class="list-section">
      <view class="list-header">
        <text class="list-title">反馈历史</text>
        <text class="list-count" v-if="feedbackList.length > 0">共 {{ feedbackList.length }} 条</text>
      </view>

      <view class="feedback-list" v-if="feedbackList.length > 0">
        <view
          v-for="item in feedbackList"
          :key="item.id"
          class="feedback-item"
        >
          <view class="feedback-header">
            <text class="feedback-type">{{ getTypeLabel(item.type) }}</text>
            <text class="feedback-status" :style="{ color: getStatusInfo(item.status).color }">
              {{ getStatusInfo(item.status).label }}
            </text>
          </view>
          <view class="feedback-content">{{ item.content }}</view>
          <view class="feedback-footer">
            <text class="feedback-time">{{ formatTime(item.createTime) }}</text>
          </view>
          <!-- 回复内容 -->
          <view class="feedback-reply" v-if="item.reply">
            <text class="reply-label">官方回复：</text>
            <text class="reply-content">{{ item.reply }}</text>
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="load-more" v-if="hasMore" @click="loadFeedbackList">
          <text class="load-more-text">{{ loading ? '加载中...' : '点击加载更多' }}</text>
        </view>
        <view class="no-more" v-else>
          <text class="no-more-text">没有更多了</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无反馈记录</text>
        <text class="empty-hint">您的反馈对我们很重要</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #F5F5F7;
  padding: 16rpx;
  padding-top: calc(16rpx + constant(safe-area-inset-top));
  padding-top: calc(16rpx + env(safe-area-inset-top));
  padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1C1C1E;
  margin-bottom: 20rpx;
}

.type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.type-item {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #F5F5F7;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s ease;

  &.active {
    background: rgba(34, 215, 255, 0.1);
    border-color: #22D7FF;
  }

  &:active {
    opacity: 0.8;
  }
}

.type-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.type-label {
  font-size: 26rpx;
  color: #1C1C1E;
}

.feedback-textarea {
  width: 100%;
  min-height: 240rpx;
  background: #F5F5F7;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #1C1C1E;
  line-height: 1.6;
}

.char-count {
  text-align: right;
  margin-top: 12rpx;
}

.count-text {
  font-size: 22rpx;
  color: #8E8E93;
}

.contact-input {
  width: 100%;
  height: 80rpx;
  background: #F5F5F7;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #1C1C1E;
}

.contact-hint {
  display: block;
  font-size: 22rpx;
  color: #8E8E93;
  margin-top: 12rpx;
}

.submit-section {
  margin-top: 40rpx;
  padding: 0 32rpx;
  padding-bottom: 40rpx;
}

.submit-btn {
  height: 88rpx;
  background: #22D7FF;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &.disabled {
    background: #E5E5EA;
    pointer-events: none;
  }

  &:active {
    opacity: 0.8;
  }
}

.submit-icon {
  margin-right: 12rpx;
}

.submit-btn-text {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 600;
}

// 列表区域
.list-section {
  margin-top: 24rpx;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16rpx 16rpx;
}

.list-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1C1C1E;
}

.list-count {
  font-size: 24rpx;
  color: #8E8E93;
}

.feedback-list {
  padding: 0 16rpx;
}

.feedback-item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.feedback-type {
  font-size: 26rpx;
  font-weight: 600;
  color: #1C1C1E;
}

.feedback-status {
  font-size: 24rpx;
  font-weight: 500;
}

.feedback-content {
  font-size: 28rpx;
  color: #3A3A3C;
  line-height: 1.6;
  margin-bottom: 16rpx;
  word-break: break-all;
}

.feedback-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feedback-time {
  font-size: 24rpx;
  color: #8E8E93;
}

.feedback-reply {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #F5F5F7;
  border-radius: 12rpx;
}

.reply-label {
  font-size: 24rpx;
  color: #22D7FF;
  font-weight: 600;
}

.reply-content {
  font-size: 26rpx;
  color: #3A3A3C;
  line-height: 1.5;
  margin-top: 8rpx;
  display: block;
}

.load-more,
.no-more {
  text-align: center;
  padding: 32rpx;
}

.load-more-text,
.no-more-text {
  font-size: 26rpx;
  color: #8E8E93;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #3A3A3C;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #8E8E93;
}
</style>
