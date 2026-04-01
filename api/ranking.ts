import { get } from '@/utils/request'

export interface RankUser {
  id: number
  rank: number
  nickname: string
  avatar: string
  points: number
  level: number
  continuousDays: number
}

// 排行榜列表
export const getRankingList = (type: 'points' | 'mood' | 'risk' | 'lying' = 'points', page = 1, size = 50) => {
  return get<{ list: RankUser[]; page: number; size: number; type: string }>('/api/ranking/list', { type, page, size })
}

// 我的排名
export const getMyRank = (type: 'points' | 'mood' | 'risk' | 'lying' = 'points') => {
  return get<RankUser>('/api/ranking/my', { type })
}
