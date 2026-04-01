<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { validatePhone, validateRequired } from '@/utils/validate'
import { getContacts, addContact, updateContact, deleteContact } from '@/api/rescue'

interface Contact {
  id: string
  name: string
  phone: string
  relationship: string
}

const contacts = ref<Contact[]>([])
const showAddModal = ref(false)
const editingContact = ref<Contact | null>(null)
const loading = ref(false)

const formData = ref({
  name: '',
  phone: '',
  relationship: ''
})

const loadContacts = async () => {
  loading.value = true
  try {
    const res = await getContacts()
    if (Array.isArray(res)) {
      contacts.value = res
    } else if (res && Array.isArray((res as any).data)) {
      contacts.value = (res as any).data
    }
  } catch (error) {
    console.error('加载联系人失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
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
  editingContact.value = contact
  formData.value = { ...contact }
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
    } else {
      await addContact(formData.value)
    }
    closeAddModal()
    await loadContacts()
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('保存联系人失败:', error)
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none'
    })
  }
}

const deleteContactHandler = (id: string) => {
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
          console.error('删除联系人失败:', error)
          uni.showToast({
            title: '删除失败，请重试',
            icon: 'none'
          })
        }
      }
    }
  })
}

const makeCall = (contact: Contact) => {
  uni.makePhoneCall({
    phoneNumber: contact.phone,
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

onMounted(() => {
  loadContacts()
})
</script>

<template>
  <view class="container">
    <view v-if="loading" class="loading-state">
      <text class="loading-icon">⏳</text>
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="contacts.length === 0" class="empty-state">
      <text class="empty-icon">📱</text>
      <text class="empty-text">暂无紧急联系人</text>
      <text class="empty-desc">添加联系人，关键时刻帮到你</text>
    </view>

    <view v-else class="contact-list">
      <view v-for="contact in contacts" :key="contact.id" class="contact-item">
        <view class="contact-info">
          <view class="contact-avatar">{{ contact.name.charAt(0) }}</view>
          <view class="contact-detail">
            <text class="contact-name">{{ contact.name }}</text>
            <text class="contact-meta">{{ contact.relationship }} · {{ contact.phone }}</text>
          </view>
        </view>
        <view class="contact-actions">
          <button class="action-btn call" @click="makeCall(contact)">呼叫</button>
          <button class="action-btn edit" @click="openEditModal(contact)">编辑</button>
          <button class="action-btn delete" @click="deleteContactHandler(contact.id)">删除</button>
        </view>
      </view>
    </view>

    <button class="add-btn" @click="openAddModal">
      + 添加紧急联系人
    </button>

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

  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: 30rpx;
  background-color: #f5f5f5;
  padding-bottom: 150rpx;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
}

.loading-icon,
.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.loading-text,
.empty-text {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
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
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.contact-info {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.contact-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #22D7FF 0%, #1890ff 100%);
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.contact-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.contact-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.contact-meta {
  font-size: 26rpx;
  color: #999;
}

.contact-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  border: none;
  font-weight: 500;

  &.call {
    background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
    color: #fff;
  }

  &.edit {
    background: #f0f0f0;
    color: #333;
  }

  &.delete {
    background: #fff1f0;
    color: #ff4d4f;
  }
}

.add-btn {
  position: fixed;
  bottom: 40rpx;
  left: 30rpx;
  right: 30rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #22D7FF 0%, #1890ff 100%);
  color: #fff;
  border: none;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 24rpx rgba(34, 215, 255, 0.3);
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

  &.cancel {
    background: #f0f0f0;
    color: #666;
  }

  &.confirm {
    background: linear-gradient(135deg, #22D7FF 0%, #1890ff 100%);
    color: #fff;
  }
}
</style>
