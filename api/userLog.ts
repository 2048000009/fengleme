import { get, post } from '@/utils/request'

export interface UserLog {
  id: number
  user_id: number
  action: string
  module: string
  description: string
  params?: any
  ip: string
  user_agent: string
  device_type: string
  app_version: string
  create_time: string
}

export interface UserLogStatistics {
  total: number
  actionStats: Array<{ action: string; count: number }>
  moduleStats: Array<{ module: string; count: number }>
  dailyStats: Array<{ date: string; count: number }>
}

export const recordUserLog = (data: {
  action: string
  module: string
  description?: string
  params?: any
  device_type?: string
  app_version?: string
}) => {
  return post('/api/userLog/record', data)
}

export const getMyLogs = (params?: {
  page?: number
  size?: number
  action?: string
  module?: string
}) => {
  return get<{
    list: UserLog[]
    total: number
    page: number
    size: number
  }>('/api/userLog/myLogs', params)
}

export const getUserLogStatistics = (days = 30) => {
  return get<UserLogStatistics>('/api/userLog/statistics', { days })
}
