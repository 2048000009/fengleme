import { get, post } from '@/utils/request'

export interface CheckinStats {
  isCheckedIn: boolean
  todayCount: number
  continuousDays: number
  totalDays: number
  crazyPoints: number
  level: string
  lastCheckinDate?: string
}

export interface CheckinResult {
  points: number
  todayRank: number
  continuousDays: number
  totalDays: number
  crazyPoints: number
  level: string
  message: string
}

// 获取签到统计
export const getCheckinStats = () => {
  return get<CheckinStats>('/api/checkin/stats')
}

// 执行签到
export const doCheckin = () => {
  return post<CheckinResult>('/api/checkin/do')
}

// 签到历史
export const getCheckinHistory = (page = 1, size = 20) => {
  return get('/api/checkin/history', { page, size })
}
