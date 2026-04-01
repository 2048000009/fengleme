<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  getContacts, 
  addContact, 
  updateContact, 
  deleteContact, 
  sendSOS,
  type Contact 
} from '@/api/rescue'
import { validatePhone, validateRequired } from '@/utils/validate'

const contacts = ref<Contact[]>([])
const showAddModal = ref(false)
const editingContact = ref<Contact | null>(null)
const loading = ref(false)
const sendingSOS = ref(false)

// 发疯文字相关
const currentCrazyText = ref('')
const showTextAnimation = ref(false)
const textPosition = ref({ x: 0, y: 0 })

const crazyTexts = [
  '我疯了！',
  '发疯中...',
  '别管我！',
  '我要发疯！',
  '疯了疯了！',
  '啊啊啊！',
  '我很好！',
  '无所谓！',
  '随便吧！',
  '就这样！',
  '开心！',
  '快乐！',
  '自由！',
  '解放！',
  '解脱！'
]

const formData = ref({
  name: '',
  phone: '',
  relationship: ''
})

const getSafeName = (name: string | undefined) => {
  return name || '疯友'
}

const getInitial = (name: string | undefined) => {
  const safeName = getSafeName(name)
  return safeName.charAt(0) || '疯'
}

const safeContacts = computed(() => {
  if (!Array.isArray(contacts.value)) return []
  return contacts.value.filter(contact => contact && typeof contact === 'object')
})

const loadContacts = async () => {
  try {
    loading.value = true
    const data = await getContacts()
    if (Array.isArray(data)) {
      contacts.value = data.map(contact => ({
        id: contact.id || '',
        name: contact.name || '',
        phone: contact.phone || '',
        relationship: contact.relationship || ''
      }))
    } else {
      contacts.value = []
    }
  } catch (error) {
    console.error('加载联系人失败', error)
    contacts.value = []
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  editingContact.value = null
  formData.value = { name: '', phone: '', relationship: '' }
  showAddModal.value = true
}

const openEditModal = (contact: Contact) => {
  if (!contact) return
  editingContact.value = contact
  formData.value = {
    name: contact.name || '',
    phone: contact.phone || '',
    relationship: contact.relationship || ''
  }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  editingContact.value = null
}

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

const handleDeleteContact = (id: string) => {
  if (!id) return
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

const handleSOSClick = (e: any) => {
  const randomText = crazyTexts[Math.floor(Math.random() * crazyTexts.length)]
  currentCrazyText.value = randomText
  
  textPosition.value = {
    x: Math.random() * 100 - 50,
    y: -Math.random() * 100 - 50
  }
  
  showTextAnimation.value = true
  
  uni.vibrateShort({ type: 'light' })
  
  setTimeout(() => {
    showTextAnimation.value = false
  }, 800)
}

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
          
          let location = undefined
          try {
            const locRes = await uni.getLocation({ type: 'gcj02' })
            location = {
              lat: locRes.latitude,
              lng: locRes.longitude,
              address: ''
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

onMounted(() => {
  loadContacts()
})
</script>

<template>
  <view class="container">
    <view class="hero-section">
      <text class="hero-icon">🚨</text>
      <text class="hero-title">疯友急救中心</text>
      <text class="hero-subtitle">紧急心理援助与互助</text>
    </view>

    <view class="sos-card">
      <view class="sos-wrapper">
        <view 
          class="sos-btn" 
          :class="{ sending: sendingSOS }" 
          @click="handleSOSClick"
          @longpress="handleSendSOS"
        >
          <text class="sos-main">SOS</text>
        </view>
        
        <view 
          v-if="showTextAnimation" 
          class="crazy-text"
          :style="{ transform: `translate(${textPosition.x}px, ${textPosition.y}px)` }"
        >
          {{ currentCrazyText }}
        </view>
      </view>
      <text class="sos-tip">点击发疯 · 长按发送SOS</text>
    </view>

    <view class="contacts-card">
      <view class="section-header">
        <text class="section-prefix">📱</text>
        <text class="section-title">一、疯友急救</text>
      </view>
      <text class="section-desc">一键呼叫信任的疯友，获取及时支援</text>

      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="contacts.length === 0" class="empty-state">
        <text class="empty-icon">📱</text>
        <text class="empty-text">暂无疯友联系人</text>
        <text class="empty-desc">添加联系人，关键时刻帮到你</text>
      </view>

      <view v-else class="contact-list">
        <view v-for="contact in safeContacts" :key="contact.id" class="contact-item">
          <view class="contact-avatar">{{ getInitial(contact.name) }}</view>
          <view class="contact-info">
            <text class="contact-name">{{ getSafeName(contact.name) }}</text>
            <text class="contact-meta">{{ contact.relationship || '疯友' }}</text>
          </view>
          <view class="contact-phone">
            <text class="phone-text">{{ contact.phone ? contact.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '' }}</text>
          </view>
          <view class="contact-actions">
            <text class="action-edit" @click="openEditModal(contact)">编辑</text>
            <text class="action-delete" @click="handleDeleteContact(contact.id)">删除</text>
          </view>
        </view>
      </view>

      <view class="add-btn" @click="openAddModal">
        <text class="add-icon">+</text>
        <text class="add-text">添加紧急联系人</text>
      </view>
    </view>

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
            <input class="form-input" v-model="formData.relationship" placeholder="如：疯友、家人" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="closeAddModal">取消</button>
          <button class="modal-btn confirm" @click="saveContact">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60rpx;
}

.hero-section {
  background: linear-gradient(180deg, #ff4d4f 0%, #ff7875 100%);
  padding: 40rpx 30rpx 50rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.hero-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12rpx;
}

.hero-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.sos-card {
  background: #fff;
  margin: 30rpx;
  border-radius: 24rpx;
  padding: 50rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 30rpx rgba(255, 77, 79, 0.2);
  position: relative;
}

.sos-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sos-btn {
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 48rpx rgba(255, 77, 79, 0.4);
  transition: transform 0.1s ease;
  position: relative;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.sending {
    opacity: 0.7;
  }
}

.sos-main {
  font-size: 80rpx;
  font-weight: bold;
  color: #fff;
  letter-spacing: 8rpx;
}

.crazy-text {
  position: absolute;
  font-size: 32rpx;
  font-weight: 700;
  color: #ff4d4f;
  white-space: nowrap;
  pointer-events: none;
  animation: floatUp 0.8s ease-out forwards;
  z-index: 10;
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100rpx) scale(1.2);
  }
}

.sos-tip {
  font-size: 26rpx;
  color: #ff4d4f;
  margin-top: 30rpx;
  font-weight: 500;
}

.contacts-card {
  background: #fff;
  margin: 0 30rpx 30rpx;
  border-radius: 24rpx;
  padding: 30rpx;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.section-prefix {
  font-size: 40rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.section-desc {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 30rpx;
  display: block;
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
  font-size: 100rpx;
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
  margin-bottom: 30rpx;
}

.contact-item {
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.contact-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-info {
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

.contact-phone {
  flex-shrink: 0;
}

.phone-text {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.contact-actions {
  display: flex;
  gap: 20rpx;
  flex-shrink: 0;
}

.action-edit {
  font-size: 26rpx;
  color: #1890ff;
  font-weight: 500;
}

.action-delete {
  font-size: 26rpx;
  color: #ff4d4f;
  font-weight: 500;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 30rpx;
  border: 2rpx dashed #ff4d4f;
  border-radius: 16rpx;
}

.add-icon {
  font-size: 36rpx;
  color: #ff4d4f;
  font-weight: 300;
}

.add-text {
  font-size: 28rpx;
  color: #ff4d4f;
  font-weight: 500;
}

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
  line-height: 80rpx;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &.cancel {
    background: #f0f0f0;
    color: #666;
  }

  &.confirm {
    background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
    color: #fff;
  }

  &::after {
    border: none;
  }
}
</style>
