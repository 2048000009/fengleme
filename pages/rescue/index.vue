<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  getContacts, 
  addContact, 
  updateContact, 
  deleteContact, 
  sendSOS, 
  getHotlines,
  type Contact 
} from '@/api/rescue'
import { validatePhone, validateRequired } from '@/utils/validate'

const contacts = ref<Contact[]>([])
const hotlines = ref<Array<{ name: string; phone: string; description?: string }>>([])
const showAddModal = ref(false)
const showHotlinesModal = ref(false)
const editingContact = ref<Contact | null>(null)
const loading = ref(false)
const sendingSOS = ref(false)

const formData = ref({
  name: '',
  phone: '',
  relationship: ''
})

// 加载联系人列表
const loadContacts = async () => {
  try {
    loading.value = true
    const data = await getContacts()
    contacts.value = data
  } catch (error) {
    uni.showToast({
      title: '加载联系人失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 加载心理热线
const loadHotlines = async () => {
  try {
    const data = await getHotlines()
    hotlines.value = data
  } catch (error) {
    uni.showToast({
      title: '加载热线失败',
      icon: 'none'
    })
  }
}

// 打开添加联系人弹窗
const openAddModal = () => {
  editingContact.value = null
  formData.value = { name: '', phone: '', relationship: '' }
  showAddModal.value = true
}

// 打开编辑联系人弹窗
const openEditModal = (contact: Contact) => {
  editingContact.value = contact
  formData.value = { ...contact }
  showAddModal.value = true
}

// 关闭添加联系人弹窗
const closeAddModal = () => {
  showAddModal.value = false
  editingContact.value = null
}

// 保存联系人
const saveContact = async () => {
  if (!validateRequired(formData.value.name)) {
    uni.showToast({
      title: '请输入姓名',
      icon: 'none'
    })
    return
  }

  if (formData.value.name.length < 2 || formData.value.name.length > 10) {
    uni.showToast({
      title: '姓名长度应为2-10位',
      icon: 'none'
    })
    return
  }

  if (!validatePhone(formData.value.phone)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }

  if (formData.value.relationship && formData.value.relationship.length > 10) {
    uni.showToast({
      title: '关系描述不能超过10个字',
      icon: 'none'
    })
    return
  }

  try {
    if (editingContact.value) {
      await updateContact(editingContact.value.id, formData.value)
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await addContact(formData.value)
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
    await loadContacts()
    closeAddModal()
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
}

// 删除联系人
const handleDeleteContact = (id: string) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个联系人吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteContact(id)
          await loadContacts()
          uni.showToast({
            title: '已删除',
            icon: 'success'
          })
        } catch (error) {
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 拨打电话
const makeCall = (phone: string) => {
  uni.makePhoneCall({
    phoneNumber: phone,
    success: () => {
      console.log('拨打成功')
    },
    fail: (err) => {
      console.error('拨打失败:', err)
      uni.showToast({
        title: '拨打失败，请重试',
        icon: 'none'
      })
    }
  })
}

// 发送SOS
const handleSendSOS = async () => {
  if (contacts.value.length === 0) {
    uni.showToast({
      title: '请先添加紧急联系人',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '确认发送SOS',
    content: '将向所有紧急联系人发送求助信息，确定吗？',
    confirmColor: '#ff4d4f',
    success: async (res) => {
      if (res.confirm) {
        try {
          sendingSOS.value = true
          
          // 获取位置信息
          let location = undefined
          try {
            const locRes = await uni.getLocation({ type: 'gcj02' })
            location = {
              lat: locRes.latitude,
              lng: locRes.longitude,
              address: ''
            }
            // 尝试获取地址
            try {
              const geoRes = await uni.request({
                url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${locRes.latitude},${locRes.longitude}&key=YOUR_KEY`,
                method: 'GET'
              })
              if (geoRes.data?.result?.address) {
                location.address = geoRes.data.result.address
              }
            } catch (e) {
              console.log('获取地址失败')
            }
          } catch (e) {
            console.log('获取位置失败')
          }

          await sendSOS({
            contacts: contacts.value.map(c => c.phone),
            location,
            message: '我在紧急情况下需要帮助，请尽快联系我！'
          })

          uni.showToast({
            title: 'SOS已发送',
            icon: 'success'
          })
        } catch (error) {
          uni.showToast({
            title: '发送失败',
            icon: 'none'
          })
        } finally {
          sendingSOS.value = false
        }
      }
    }
  })
}

// 打开热线弹窗
const openHotlinesModal = () => {
  showHotlinesModal.value = true
  loadHotlines()
}

// 关闭热线弹窗
const closeHotlinesModal = () => {
  showHotlinesModal.value = false
}

// 跳转到小游戏
const goToGames = () => {
  uni.navigateTo({
    url: '/pages/rescue/games'
  })
}

// 跳转到专业干预
const goToProfessional = () => {
  uni.navigateTo({
    url: '/pages/rescue/professional'
  })
}

onMounted(() => {
  loadContacts()
})
</script>

<template>
  <view class="container">
    <!-- SOS紧急按钮 -->
    <view class="sos-section">
      <view class="sos-btn" :class="{ sending: sendingSOS }" @click="handleSendSOS">
        <text class="sos-text">SOS</text>
        <text class="sos-desc">紧急求助</text>
      </view>
      <text class="sos-tip">点击向紧急联系人发送求助信息</text>
    </view>

    <!-- 功能入口 -->
    <view class="feature-section">
      <view class="feature-item" @click="goToGames">
        <uni-icons type="gift" size="28" color="#FF6B6B" class="feature-icon"></uni-icons>
        <text class="feature-name">在线镇静剂</text>
        <text class="feature-desc">小游戏放松</text>
      </view>
      <view class="feature-item" @click="openHotlinesModal">
        <uni-icons type="phone" size="28" color="#52C41A" class="feature-icon"></uni-icons>
        <text class="feature-name">心理热线</text>
        <text class="feature-desc">专业援助电话</text>
      </view>
      <view class="feature-item" @click="goToProfessional">
        <uni-icons type="heart" size="28" color="#22D7FF" class="feature-icon"></uni-icons>
        <text class="feature-name">专业干预</text>
        <text class="feature-desc">心理咨询服务</text>
      </view>
    </view>

    <!-- 紧急联系人 -->
    <view class="contacts-section">
      <view class="section-header">
        <view class="section-title-wrapper">
          <uni-icons type="contact" size="20" color="#333" class="section-title-icon"></uni-icons>
          <text class="section-title">紧急联系人</text>
        </view>
        <text class="section-action" @click="openAddModal">
          <uni-icons type="plus" size="16" color="#1890ff"></uni-icons>
          <text>添加</text>
        </text>
      </view>

      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="contacts.length === 0" class="empty-state">
        <uni-icons type="personadd" size="50" color="#CCC" class="empty-icon"></uni-icons>
        <text class="empty-text">暂无紧急联系人</text>
        <text class="empty-desc">添加联系人，关键时刻帮到你</text>
      </view>

      <view v-else class="contact-list">
        <view v-for="contact in contacts" :key="contact.id" class="contact-item">
          <view class="contact-info">
            <view class="contact-avatar">{{ contact.name.charAt(0) }}</view>
            <view class="contact-detail">
              <text class="contact-name">{{ contact.name }}</text>
              <text class="contact-meta">{{ contact.relationship || '紧急联系人' }} · {{ contact.phone }}</text>
            </view>
          </view>
          <view class="contact-actions">
            <button class="action-btn call" @click="makeCall(contact.phone)">呼叫</button>
            <button class="action-btn edit" @click="openEditModal(contact)">编辑</button>
            <button class="action-btn delete" @click="handleDeleteContact(contact.id)">删除</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加/编辑联系人弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingContact ? '编辑联系人' : '添加联系人' }}</text>
          <text class="modal-close" @click="closeAddModal">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">姓名</text>
            <input class="form-input" v-model="formData.name" placeholder="请输入姓名" />
          </view>
          <view class="form-item">
            <text class="form-label">电话</text>
            <input class="form-input" v-model="formData.phone" type="number" placeholder="请输入电话" />
          </view>
          <view class="form-item">
            <text class="form-label">关系</text>
            <input class="form-input" v-model="formData.relationship" placeholder="如：家人、朋友" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="closeAddModal">取消</button>
          <button class="modal-btn confirm" @click="saveContact">保存</button>
        </view>
      </view>
    </view>

    <!-- 心理热线弹窗 -->
    <view v-if="showHotlinesModal" class="modal-overlay" @click="closeHotlinesModal">
      <view class="modal-content hotlines-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">心理援助热线</text>
          <text class="modal-close" @click="closeHotlinesModal">×</text>
        </view>
        <view class="modal-body">
          <view v-if="hotlines.length === 0" class="hotline-list">
            <view class="hotline-item" @click="makeCall('400-161-9995')">
              <view class="hotline-info">
                <text class="hotline-name">全国心理援助热线</text>
                <text class="hotline-desc">24小时心理危机干预</text>
              </view>
              <text class="hotline-phone">400-161-9995</text>
              <text class="hotline-arrow">›</text>
            </view>
            <view class="hotline-item" @click="makeCall('010-82951332')">
              <view class="hotline-info">
                <text class="hotline-name">北京心理危机研究与干预中心</text>
                <text class="hotline-desc">24小时服务</text>
              </view>
              <text class="hotline-phone">010-82951332</text>
              <text class="hotline-arrow">›</text>
            </view>
            <view class="hotline-item" @click="makeCall('021-12320')">
              <view class="hotline-info">
                <text class="hotline-name">上海市心理援助热线</text>
                <text class="hotline-desc">24小时服务</text>
              </view>
              <text class="hotline-phone">021-12320</text>
              <text class="hotline-arrow">›</text>
            </view>
          </view>
          <view v-else class="hotline-list">
            <view v-for="(hotline, index) in hotlines" :key="index" class="hotline-item" @click="makeCall(hotline.phone)">
              <view class="hotline-info">
                <text class="hotline-name">{{ hotline.name }}</text>
                <text v-if="hotline.description" class="hotline-desc">{{ hotline.description }}</text>
              </view>
              <text class="hotline-phone">{{ hotline.phone }}</text>
              <text class="hotline-arrow">›</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn confirm" @click="closeHotlinesModal">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff1f0 0%, #f5f5f5 30%);
  padding: 30rpx;
  padding-bottom: 50rpx;
}

// SOS按钮区域
.sos-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
}

.sos-btn {
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 40rpx rgba(255, 77, 79, 0.4);
  animation: pulse 2s ease-in-out infinite;
  
  &.sending {
    animation: none;
    opacity: 0.7;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 12rpx 40rpx rgba(255, 77, 79, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 16rpx 50rpx rgba(255, 77, 79, 0.5);
  }
}

.sos-text {
  font-size: 64rpx;
  font-weight: 900;
  color: #fff;
  letter-spacing: 4rpx;
}

.sos-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 8rpx;
}

.sos-tip {
  font-size: 26rpx;
  color: #999;
  margin-top: 30rpx;
}

// 功能入口
.feature-section {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.feature-item {
  flex: 1;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.feature-icon {
  margin-bottom: 16rpx;
}

.feature-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.feature-desc {
  font-size: 22rpx;
  color: #999;
}

// 联系人区域
.contacts-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
}

.section-title-icon {
  margin-right: 8rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.section-action {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #1890ff;
  font-weight: 500;
}

.loading-state {
  text-align: center;
  padding: 60rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.contact-item {
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 24rpx;
}

.contact-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.contact-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.contact-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.contact-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.contact-meta {
  font-size: 24rpx;
  color: #999;
}

.contact-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  height: 64rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  border: none;
  font-weight: 500;

  &.call {
    background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
    color: #fff;
  }

  &.edit {
    background: #e6f7ff;
    color: #1890ff;
  }

  &.delete {
    background: #fff1f0;
    color: #ff4d4f;
  }
}

// 弹窗
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
}

.modal-content {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  
  &.hotlines-modal {
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.modal-body {
  padding: 30rpx;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 30rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  border: none;
  font-weight: bold;

  &.cancel {
    background: #f0f0f0;
    color: #666;
  }

  &.confirm {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    color: #fff;
  }
}

// 热线列表
.hotline-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.hotline-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
}

.hotline-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.hotline-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.hotline-desc {
  font-size: 24rpx;
  color: #999;
}

.hotline-phone {
  font-size: 28rpx;
  color: #1890ff;
  font-weight: 600;
  margin-right: 16rpx;
}

.hotline-arrow {
  font-size: 36rpx;
  color: #ccc;
}
</style>
