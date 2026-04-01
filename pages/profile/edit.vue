<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storage } from '@/utils/storage'
import { logout as logoutApi, clearToken, getUserInfo, updateUserInfo, bindPhone, bindEmail } from '@/api'
import { debounce } from '@/utils/debounce'

const USER_INFO_KEY = 'fengleme_user_info'

interface UserInfo {
  id: number
  nickname: string
  avatar: string
  gender: number
  signature: string
  phone?: string
  email?: string
  isLogin: boolean
}

const userInfo = ref<UserInfo>({
  id: 0,
  nickname: '',
  avatar: '',
  gender: 0,
  signature: '',
  isLogin: false
})

const tempNickname = ref('')
const tempSignature = ref('')
const tempPhone = ref('')
const tempEmail = ref('')
const showGenderPicker = ref(false)
const showPhoneInput = ref(false)
const showEmailInput = ref(false)

const genderMap = {
  0: 'secret',
  1: 'male',
  2: 'female'
}

const reverseGenderMap = {
  secret: 0,
  male: 1,
  female: 2
}

onMounted(async () => {
  const saved = storage.get<UserInfo>(USER_INFO_KEY)
  if (saved && saved.isLogin) {
    try {
      const res = await getUserInfo()
      userInfo.value = {
        ...res.data,
        isLogin: true
      }
      tempNickname.value = userInfo.value.nickname
      tempSignature.value = userInfo.value.signature || ''
      tempPhone.value = userInfo.value.phone || ''
      tempEmail.value = userInfo.value.email || ''
      storage.set(USER_INFO_KEY, userInfo.value)
    } catch (e) {
      console.error('获取用户信息失败', e)
      userInfo.value = saved
      tempNickname.value = saved.nickname
      tempSignature.value = saved.signature || ''
      tempPhone.value = saved.phone || ''
      tempEmail.value = saved.email || ''
    }
  } else {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      userInfo.value.avatar = res.tempFilePaths[0]
      saveUserInfo()
    }
  })
}

const saveNickname = debounce(async () => {
  if (tempNickname.value.trim()) {
    try {
      await updateUserInfo({ nickname: tempNickname.value.trim() })
      userInfo.value.nickname = tempNickname.value.trim()
      storage.set(USER_INFO_KEY, userInfo.value)
      uni.showToast({ title: '保存成功', icon: 'success' })
    } catch (e) {
      console.error('保存昵称失败', e)
    }
  }
}, 1000)

const selectGender = (genderStr: 'male' | 'female' | 'secret') => {
  const genderNum = reverseGenderMap[genderStr]
  userInfo.value.gender = genderNum
  showGenderPicker.value = false
  saveUserInfo()
}

const saveBio = debounce(async () => {
  try {
    await updateUserInfo({ signature: tempSignature.value.trim() })
    userInfo.value.signature = tempSignature.value.trim()
    storage.set(USER_INFO_KEY, userInfo.value)
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (e) {
    console.error('保存签名失败', e)
  }
}, 1000)

const saveUserInfo = async () => {
  try {
    await updateUserInfo({
      avatar: userInfo.value.avatar,
      gender: userInfo.value.gender
    })
    storage.set(USER_INFO_KEY, userInfo.value)
  } catch (e) {
    console.error('保存用户信息失败', e)
  }
}

const logout = async () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await logoutApi()
        } catch (e) {
          console.error('退出登录失败', e)
        }
        
        clearToken()
        userInfo.value.isLogin = false
        storage.set(USER_INFO_KEY, userInfo.value)
        
        uni.showToast({ title: '已退出登录', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' })
        }, 1500)
      }
    }
  })
}

const goBack = () => {
  uni.navigateBack()
}

const getGenderText = (genderNum: number) => {
  const map: Record<string, string> = {
    '1': '男',
    '2': '女',
    '0': '保密'
  }
  return map[String(genderNum)] || '保密'
}

const getCurrentGenderStr = () => {
  return genderMap[userInfo.value.gender] || 'secret'
}

const savePhone = async () => {
  if (!tempPhone.value.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(tempPhone.value.trim())) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }
  try {
    uni.showLoading({ title: '保存中...' })
    await bindPhone(tempPhone.value.trim())
    userInfo.value.phone = tempPhone.value.trim()
    storage.set(USER_INFO_KEY, userInfo.value)
    showPhoneInput.value = false
    uni.showToast({ title: '手机号绑定成功', icon: 'success' })
  } catch (e) {
    console.error('绑定手机号失败', e)
  } finally {
    uni.hideLoading()
  }
}

const saveEmail = async () => {
  if (!tempEmail.value.trim()) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(tempEmail.value.trim())) {
    uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
    return
  }
  try {
    uni.showLoading({ title: '保存中...' })
    await bindEmail(tempEmail.value.trim())
    userInfo.value.email = tempEmail.value.trim()
    storage.set(USER_INFO_KEY, userInfo.value)
    showEmailInput.value = false
    uni.showToast({ title: '邮箱绑定成功', icon: 'success' })
  } catch (e) {
    console.error('绑定邮箱失败', e)
  } finally {
    uni.hideLoading()
  }
}
</script>

<template>
  <view class="container">
    <view class="card">
      <view class="section-title-wrapper">
        <uni-icons type="image" size="18" color="#22D7FF" class="section-icon"></uni-icons>
        <text class="section-title">头像</text>
      </view>
      <view class="avatar-section" @click="chooseAvatar">
        <view class="avatar">
          <image v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar-img" mode="aspectFill" />
          <text v-else class="avatar-text">疯</text>
        </view>
        <text class="avatar-hint">点击更换头像</text>
      </view>
    </view>

    <view class="card">
      <view class="section-title-wrapper">
        <uni-icons type="person" size="18" color="#007AFF" class="section-icon"></uni-icons>
        <text class="section-title">昵称</text>
      </view>
      <view class="input-section">
        <input 
          class="input" 
          v-model="tempNickname" 
          placeholder="请输入昵称" 
          maxlength="20"
        />
        <view class="save-btn" @click="saveNickname">
          <text class="save-btn-text">保存</text>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="section-title-wrapper">
        <uni-icons type="contact" size="18" color="#FF9500" class="section-icon"></uni-icons>
        <text class="section-title">性别</text>
      </view>
      <view class="gender-display" @click="showGenderPicker = true">
        <text class="gender-text">{{ getGenderText(userInfo.gender) }}</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="card">
      <view class="section-title-wrapper">
        <uni-icons type="chatbubble" size="18" color="#52C41A" class="section-icon"></uni-icons>
        <text class="section-title">个性签名</text>
      </view>
      <view class="input-section">
        <textarea 
          class="textarea" 
          v-model="tempSignature" 
          placeholder="写点什么吧..." 
          maxlength="100"
          :auto-height="true"
        />
        <view class="save-btn" @click="saveBio">
          <text class="save-btn-text">保存</text>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="section-title-wrapper">
        <uni-icons type="phone" size="18" color="#FF6B6B" class="section-icon"></uni-icons>
        <text class="section-title">手机号</text>
      </view>
      <view class="contact-display" @click="showPhoneInput = true">
        <text class="contact-text">{{ userInfo.phone || '未绑定' }}</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="card">
      <view class="section-title-wrapper">
        <uni-icons type="email" size="18" color="#8E8E93" class="section-icon"></uni-icons>
        <text class="section-title">邮箱</text>
      </view>
      <view class="contact-display" @click="showEmailInput = true">
        <text class="contact-text">{{ userInfo.email || '未绑定' }}</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="logout-section">
      <view class="logout-btn" @click="logout">
        <uni-icons type="close" size="20" color="#ffffff" class="logout-icon"></uni-icons>
        <text class="logout-btn-text">退出登录</text>
      </view>
    </view>

    <view class="modal-mask" v-if="showGenderPicker" @click="showGenderPicker = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择性别</text>
        </view>
        <view class="gender-options">
          <view class="gender-option" @click="selectGender('male')">
            <text class="gender-option-text">男</text>
            <view v-if="getCurrentGenderStr() === 'male'" class="gender-check">✓</view>
          </view>
          <view class="gender-option" @click="selectGender('female')">
            <text class="gender-option-text">女</text>
            <view v-if="getCurrentGenderStr() === 'female'" class="gender-check">✓</view>
          </view>
          <view class="gender-option" @click="selectGender('secret')">
            <text class="gender-option-text">保密</text>
            <view v-if="getCurrentGenderStr() === 'secret'" class="gender-check">✓</view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showGenderPicker = false">
            <text class="modal-btn-text">取消</text>
          </view>
        </view>
      </view>
    </view>

    <view class="modal-mask" v-if="showPhoneInput" @click="showPhoneInput = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">绑定手机号</text>
        </view>
        <view class="input-modal-body">
          <input 
            class="modal-input" 
            v-model="tempPhone" 
            placeholder="请输入手机号" 
            maxlength="11"
            type="number"
          />
        </view>
        <view class="modal-footer">
          <view class="modal-btn-group">
            <view class="modal-btn cancel" @click="showPhoneInput = false">
              <text class="modal-btn-text">取消</text>
            </view>
            <view class="modal-btn confirm" @click="savePhone">
              <text class="modal-btn-text confirm-text">确定</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="modal-mask" v-if="showEmailInput" @click="showEmailInput = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">绑定邮箱</text>
        </view>
        <view class="input-modal-body">
          <input 
            class="modal-input" 
            v-model="tempEmail" 
            placeholder="请输入邮箱地址" 
            maxlength="50"
            type="text"
          />
        </view>
        <view class="modal-footer">
          <view class="modal-btn-group">
            <view class="modal-btn cancel" @click="showEmailInput = false">
              <text class="modal-btn-text">取消</text>
            </view>
            <view class="modal-btn confirm" @click="saveEmail">
              <text class="modal-btn-text confirm-text">确定</text>
            </view>
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

.section-title-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-icon {
  margin-right: 12rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1C1C1E;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  background: #22D7FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-text {
  font-size: 56rpx;
  color: #ffffff;
  font-weight: 700;
}

.avatar-hint {
  font-size: 24rpx;
  color: #8E8E93;
}

.input-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.input {
  flex: 1;
  height: 80rpx;
  background: #F5F5F7;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #1C1C1E;
}

.textarea {
  flex: 1;
  min-height: 120rpx;
  background: #F5F5F7;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #1C1C1E;
  line-height: 1.6;
}

.save-btn {
  padding: 16rpx 32rpx;
  background: #22D7FF;
  border-radius: 12rpx;
}

.save-btn-text {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 600;
}

.gender-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
}

.gender-text {
  font-size: 28rpx;
  color: #1C1C1E;
}

.arrow {
  font-size: 32rpx;
  color: #C7C7CC;
}

.contact-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
}

.contact-text {
  font-size: 28rpx;
  color: #1C1C1E;
}

.input-modal-body {
  padding: 32rpx;
}

.modal-input {
  width: 100%;
  height: 88rpx;
  background: #F5F5F7;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #1C1C1E;
}

.modal-btn-group {
  display: flex;
  gap: 16rpx;
}

.modal-btn.confirm {
  background: #22D7FF;
  flex: 1;
}

.modal-btn-text.confirm-text {
  color: #ffffff;
}

.logout-section {
  margin-top: 40rpx;
  padding: 0 32rpx;
}

.logout-btn {
  height: 88rpx;
  background: #FF3B30;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-icon {
  margin-right: 12rpx;
}

.logout-btn-text {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 600;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  width: 100%;
  padding-bottom: calc(32rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.modal-header {
  padding: 32rpx;
  border-bottom: 1rpx solid #F2F2F7;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1C1C1E;
  text-align: center;
  display: block;
}

.gender-options {
  padding: 16rpx 0;
}

.gender-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #F2F2F7;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #F5F5F7;
  }
}

.gender-option-text {
  font-size: 30rpx;
  color: #1C1C1E;
}

.gender-check {
  width: 40rpx;
  height: 40rpx;
  background: #22D7FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 700;
}

.modal-footer {
  padding: 16rpx 32rpx;
}

.modal-btn {
  height: 88rpx;
  background: #F2F2F7;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-btn-text {
  font-size: 30rpx;
  color: #1C1C1E;
  font-weight: 600;
}
</style>
