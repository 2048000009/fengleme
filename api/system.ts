import { get, post } from '@/utils/request'

export interface SystemConfig {
  appName: string
  appVersion: string
  checkinStartHour: number
  checkinEndHour: number
}

export interface AppVersion {
  id: number
  version: string
  versionCode: number
  platform: string
  title: string
  description: string
  downloadUrl: string
  isForce: boolean
  status: number
  createTime: string
}

export interface CheckUpdateResult {
  hasUpdate: boolean
  version?: string
  versionCode?: number
  title?: string
  description?: string
  downloadUrl?: string
  isForce?: boolean
  message: string
}

export interface SystemMessage {
  id: number
  title: string
  content: string
  type: string
  targetType: string
  targetUsers?: string
  isPush: boolean
  pushTime?: string
  status: number
  createTime: string
}

export interface MessageListResult {
  list: SystemMessage[]
  total: number
  page: number
  size: number
}

export const getSystemConfig = () => {
  return get<SystemConfig>('/api/system/config')
}

export const checkAppUpdate = (platform: string, versionCode: number) => {
  return get<CheckUpdateResult>('/api/system/checkUpdate', { platform, versionCode })
}

export const getSystemMessages = (page = 1, size = 20) => {
  return get<MessageListResult>('/api/system/messages', { page, size })
}
