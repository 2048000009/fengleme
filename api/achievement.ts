import { get, post } from '@/utils/request'

export interface Achievement {
  id: number
  code: string
  name: string
  description: string
  icon: string
  type: string
  condition: any
  reward_points: number
  is_achieved: boolean
  is_received: boolean
}

export interface AchievementReward {
  reward_points: number
}

export const getAchievementList = () => {
  return get<Achievement[]>('/api/achievement/list')
}

export const getMyAchievements = () => {
  return get<Achievement[]>('/api/achievement/myAchievements')
}

export const receiveAchievementReward = (achievementId: number) => {
  return post<AchievementReward>('/api/achievement/receiveReward', { achievement_id: achievementId })
}

export const checkAchievements = () => {
  return post('/api/achievement/checkAchievements')
}
