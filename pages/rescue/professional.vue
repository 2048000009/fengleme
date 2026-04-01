<script setup lang="ts">
const goToConsult = () => {
  uni.showModal({
    title: '温馨提示',
    content: '即将跳转到专业心理咨询平台',
    confirmText: '继续',
    success: (res) => {
      if (res.confirm) {
        uni.navigateTo({
          url: '/pages/rescue/webview?url=https://www.baidu.com'
        })
      }
    }
  })
}
</script>

<template>
  <view class="container">
    <view class="header">
      <view class="icon-wrapper">
        <text class="icon">💚</text>
      </view>
      <text class="title">专业干预直通车</text>
      <text class="subtitle">寻求专业帮助是勇敢的表现</text>
    </view>

    <view class="content">
      <view class="info-card">
        <view class="info-item">
          <text class="info-icon">📞</text>
          <view class="info-text">
            <text class="info-title">全国心理援助热线</text>
            <text class="info-desc">400-161-9995</text>
          </view>
        </view>
        <view class="info-item">
          <text class="info-icon">🌐</text>
          <view class="info-text">
            <text class="info-title">在线心理咨询</text>
            <text class="info-desc">专业心理咨询师一对一</text>
          </view>
        </view>
      </view>

      <view class="tips-card">
        <text class="tips-title">温馨提示</text>
        <view class="tips-list">
          <view class="tip-item">
            <text class="tip-dot">•</text>
            <text class="tip-text">如果你正在经历困难，请记住你不是一个人</text>
          </view>
          <view class="tip-item">
            <text class="tip-dot">•</text>
            <text class="tip-text">寻求帮助是力量的象征，不是软弱的表现</text>
          </view>
          <view class="tip-item">
            <text class="tip-dot">•</text>
            <text class="tip-text">专业的心理支持可以帮助你更好地应对挑战</text>
          </view>
        </view>
      </view>
    </view>

    <view class="footer">
      <button class="consult-btn" @click="goToConsult">
        立即咨询
      </button>
      <text class="footer-tip">建议寻求专业帮助是勇敢的表现</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #52c41a 0%, #f5f5f5 35%);
  display: flex;
  flex-direction: column;
  padding-bottom: 180rpx;
}

.header {
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
}

.icon-wrapper {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30rpx;
}

.icon {
  font-size: 80rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.content {
  flex: 1;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.info-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.info-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;

  &:first-child {
    padding-top: 0;
    border-bottom: 1rpx solid #f0f0f0;
  }

  &:last-child {
    padding-bottom: 0;
  }
}

.info-icon {
  font-size: 60rpx;
  margin-right: 24rpx;
}

.info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.info-desc {
  font-size: 26rpx;
  color: #666;
}

.tips-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.tips-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.tip-item {
  display: flex;
  align-items: flex-start;
}

.tip-dot {
  font-size: 32rpx;
  color: #52c41a;
  margin-right: 16rpx;
  line-height: 1.4;
}

.tip-text {
  flex: 1;
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx;
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.consult-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  font-size: 34rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 24rpx rgba(82, 196, 26, 0.3);
  margin-bottom: 16rpx;
}

.footer-tip {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}
</style>
