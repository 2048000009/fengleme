<script setup lang="ts">
import { ref } from 'vue'

const expandedId = ref<number | null>(null)

const faqList = [
  {
    id: 1,
    question: '"疯了么"是什么？',
    answer: '🤪 "疯了么"是一款趣味心理健康签到APP！\n\n我们用轻松幽默的方式帮助大家：\n• 每天记录"我还活着"\n• 通过发疯释放压力\n• 建立规律的打卡习惯\n• 让关心你的人知道你安好\n\n与严肃的生存签到不同，我们把"发疯"变成了一种积极的生活态度～'
  },
  {
    id: 2,
    question: '疯批签到怎么玩？',
    answer: '🎮 超简单！首页有个大大的圆形按钮：\n\n1️⃣ 点击"疯批签到"按钮\n2️⃣ 获得15疯度奖励\n3️⃣ 查看你的疯友认证等级\n4️⃣ 收到一句治愈的疯言疯语\n\n💡 小技巧：每天固定时间签到，连续签到奖励更多哦！\n\n未登录也能签到，但数据只保存在本地。登录后数据同步云端更安全～'
  },
  {
    id: 3,
    question: '疯情指数和等级怎么算的？',
    answer: '📊 你的"疯度"这样计算：\n\n🔹 每日签到：+15疯度\n🔹 连续签到：有额外加成\n🔹 完成任务：获得额外积分\n\n🏆 等级体系：\n• 初入疯途 (0-49)\n• 疯途新秀 (50-99)\n• 初露疯芒 (100-199)\n• 半疯半癫 (200-499)\n• 疯癫大师 (500-999)\n• 疯魔在世 (1000+)\n\n越疯越强！看看你能达到什么等级～'
  },
  {
    id: 4,
    question: '签到设置里的安全天数是什么？',
    answer: '⚙️ 安全天数 = 连续未签到的容忍限度\n\n默认设置为3天，意思是：\n• 第1天没签：提醒你一下\n• 第2天没签：再提醒\n• 第3天还没签：通知紧急联系人！\n\n你可以根据自己的情况调整（1-7天）：\n• 记忆力差 → 设长一点\n• 需要严格监控 → 设短一点\n\n💡 配合每日提醒使用效果更好！'
  },
  {
    id: 5,
    question: '疯友院是干嘛的？',
    answer: '🚨 疯友院 = 你的紧急救援中心！\n\n主要功能：\n\n📱 紧急联系人管理\n• 添加信任的人作为紧急联系人\n• 设置姓名、电话、关系\n• 建议2-3位\n\n🆘 SOS求助按钮\n• 点击：随机显示发疯文字（解压）\n• 长按：向所有联系人发送SOS求助\n\n⚠️ 注意：需要登录才能使用此功能！'
  },
  {
    id: 6,
    question: '疯神榜是什么？',
    answer: '🏆 疯神榜 = 发疯排行榜！\n\n看看谁是最疯狂的疯友：\n• 按疯情指数排名\n• 展示连续签到天数\n• 显示总签到次数\n\n🎯 排行规则：\n• 疯情指数越高排名越靠前\n• 同分按连续签到排序\n• 实时更新\n\n想上榜？坚持每天签到，完成更多任务！'
  },
  {
    id: 7,
    question: '任务中心有什么任务？',
    answer: '✅ 任务中心帮你赚更多疯度！\n\n日常任务：\n• 每日签到（必做）\n• 分享给好友\n• 完善个人资料\n\n成就任务：\n• 连续签到7天\n• 连续签到30天\n• 累计签到100次\n• 达到特定等级\n\n🎁 完成任务可获得额外疯度奖励，加速升级！'
  },
  {
    id: 8,
    question: '在线镇静剂是什么？',
    answer: '🎮 在线镇静剂 = 解压小游戏！\n\n当你情绪不稳定时可以来这里：\n• 打地鼠式发泄\n• 解谜放松\n• 冥想引导\n\n适用场景：\n😤 工作压力太大\n😰 焦虑失眠\n😵 想要发泄\n😴 需要放松\n\n💊 这是你的精神急救包，随时来一颗！'
  },
  {
    id: 9,
    question: '未登录和登录的区别？',
    answer: '📱 未登录（体验模式）：\n✅ 可以正常签到\n✅ 数据存本地\n❌ 不能用疯友院\n❌ 不能用签到设置\n❌ 数据换机丢失\n\n🔐 登录后（完整模式）：\n✅ 所有功能解锁\n✅ 数据同步云端\n✅ 多端互通\n✅ 更安全可靠\n\n💡 建议：体验满意后尽快注册登录，保护你的数据！'
  },
  {
    id: 10,
    question: '遇到问题怎么办？',
    answer: '💬 我们随时在！\n\n反馈渠道：\n1️⃣ 个人中心 → 宝贵意见\n2️⃣ 详细描述问题\n3️⃣ 我们会认真处理\n\n🎁 参与反馈可能获得：\n• 疯情指数奖励\n• 专属称号\n• 新功能优先体验权\n\n让我们一起把"疯了么"变得更好！有任何建议都欢迎提出～'
  }
]

const toggleExpand = (id: number) => {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <view class="container">
    <view class="header-section">
      <text class="header-icon">🤪</text>
      <text class="header-title">疯友问答</text>
      <text class="header-subtitle">关于"疯了么"你想知道的都在这里</text>
    </view>

    <view class="faq-list">
      <view 
        v-for="item in faqList" 
        :key="item.id"
        class="faq-item"
        :class="{ expanded: expandedId === item.id }"
        @click="toggleExpand(item.id)"
      >
        <view class="faq-question">
          <view class="question-content">
            <text class="question-icon">Q{{ item.id }}</text>
            <text class="question-text">{{ item.question }}</text>
          </view>
          <view class="arrow" :class="{ rotated: expandedId === item.id }">
            <text class="arrow-text">▼</text>
          </view>
        </view>
        
        <view v-if="expandedId === item.id" class="faq-answer">
          <text class="answer-text">{{ item.answer }}</text>
        </view>
      </view>
    </view>

    <view class="footer-section">
      <text class="footer-text">还有其他问题？</text>
      <view class="feedback-btn" @click="() => uni.navigateTo({ url: '/pages/feedback/index' })">
        <text class="feedback-btn-text">联系我们 →</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #F5F5F7;
}

.header-section {
  background: linear-gradient(180deg, #22D7FF 0%, #00C8EB 100%);
  padding: 60rpx 40rpx 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.header-title {
  font-size: 44rpx;
  font-weight: 800;
  color: #FFFFFF;
  margin-bottom: 12rpx;
}

.header-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

.faq-list {
  padding: 32rpx;
  margin-top: -40rpx;
}

.faq-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  
  &.expanded {
    box-shadow: 0 8rpx 24rpx rgba(34, 215, 255, 0.15);
  }
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  
  &:active {
    background: #F8F8F8;
  }
}

.question-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 20rpx;
}

.question-icon {
  font-size: 28rpx;
  font-weight: 800;
  color: #22D7FF;
  width: 50rpx;
  height: 50rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
  line-height: 1.4;
  flex: 1;
}

.arrow {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
  
  &.rotated {
    transform: rotate(180deg);
    background: #22D7FF;
    
    .arrow-text {
      color: #FFFFFF;
    }
  }
}

.arrow-text {
  font-size: 24rpx;
  color: #999;
}

.faq-answer {
  padding: 0 32rpx 32rpx;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.answer-text {
  font-size: 27rpx;
  color: #666;
  line-height: 1.8;
  white-space: pre-line;
}

.footer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 32rpx;
  gap: 24rpx;
}

.footer-text {
  font-size: 28rpx;
  color: #999;
}

.feedback-btn {
  padding: 24rpx 64rpx;
  background: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
  border-radius: 48rpx;
  box-shadow: 0 6rpx 20rpx rgba(34, 215, 255, 0.35);
  
  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.feedback-btn-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
