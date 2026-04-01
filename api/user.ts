import { get, post } from '@/utils/request'
import { storage } from '../utils/storage'

const USER_INFO_KEY = 'fengleme_user_info'
const OPENID_KEY = 'fengleme_openid'

export interface UserInfo {
  id: number
  nickname: string
  avatar: string
  phone?: string
  email?: string
  gender: number
  signature: string
  crazy_points: number
  continuous_days: number
  total_days: number
  level: string
  last_checkin_date?: string
  join_date: string
}

export interface CheckinSettings {
  safetyDays: number
  reminderEnabled: boolean
  reminderTime: string
  reminderMethod: 'email' | 'push'
}

export interface SmsCodeResult {
  expire_time: number
  code?: string
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
  isNewUser?: boolean
}

export const register = (data: {
  nickname: string
  phone: string
  email: string
  password: string
}) => {
  return post<{ token: string; userInfo: UserInfo }>('/api/user/register', data)
}

export const login = (phone: string, password: string) => {
  return post<{ token: string; userInfo: UserInfo }>('/api/user/login', {
    phone,
    password
  })
}

export const sendSmsCode = (phone: string, type: 'login' | 'register' | 'reset' | 'bind' = 'login') => {
  return post<SmsCodeResult>('/api/auth/sendSmsCode', { phone, type })
}

export const loginBySms = (phone: string, code: string) => {
  return post<LoginResult>('/api/auth/loginBySms', { phone, code })
}

export const resetPassword = (phone: string, code: string, newPassword: string, confirmPassword: string) => {
  return post('/api/auth/resetPassword', { phone, code, newPassword, confirmPassword })
}

export const getUserInfo = () => {
  return get<UserInfo>('/api/user/info')
}

export const updateUserInfo = (data: Partial<UserInfo>) => {
  return post('/api/user/update', data)
}

export const bindEmail = (email: string) => {
  return post('/api/user/bind-email', { email })
}

export const bindPhone = (phone: string) => {
  return post('/api/user/bind-phone', { phone })
}

export const logout = () => {
  return post('/api/user/logout')
}

export const clearLoginData = () => {
  storage.remove('token')
  storage.remove(USER_INFO_KEY)
  storage.remove(OPENID_KEY)
}

export const setToken = (token: string) => {
  storage.set('token', token)
}

export const getToken = () => {
  return storage.get('token')
}

export const clearToken = () => {
  storage.remove('token')
}

export const isLogin = () => {
  return !!storage.get('token')
}

export const getCheckinSettings = () => {
  return get<CheckinSettings>('/api/user/getCheckinSettings')
}

export const saveCheckinSettings = (data: Partial<CheckinSettings>) => {
  return post('/api/user/saveCheckinSettings', data)
}

export const changePassword = (data: {
  oldPassword: string
  newPassword: string
}) => {
  return post('/api/user/changePassword', data)
}

export const syncAnonymousData = (data: {
  continuousDays: number
  totalDays: number
  crazyPoints: number
  level: string
  lastCheckinDate: string
}) => {
  return post('/api/user/syncAnonymousData', data)
}
