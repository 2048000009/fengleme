import { get } from '@/utils/request'

export interface StatisticsOverview {
  todayCheckin: boolean
  monthCheckins: number
  lastMonthCheckins: number
  totalCheckins: number
  crazyPoints: number
  continuousDays: number
  level: string
  unreadMessages: number
  riskChecks: number
  latestRiskScore: number
  moodTests: number
}

export interface TrendData {
  date: string
  points: number
  checkin: boolean
}

export interface HourData {
  hour: number
  count: number
  label: string
}

export interface RiskTrendData {
  date: string
  legalScore: number
  socialScore: number
  medicalScore: number
  totalScore: number
  conclusion: string
}

export interface MoodTrendData {
  date: string
  index: number
  level: string
  levelText: string
}

export interface RankingHistoryData {
  date: string
  rank: number
  points: number
}

export const getStatisticsOverview = () => {
  return get<StatisticsOverview>('/api/statistics/overview')
}

export const getCheckinTrend = (days = 30) => {
  return get<TrendData[]>('/api/statistics/checkinTrend', { days })
}

export const getCheckinHourDistribution = () => {
  return get<HourData[]>('/api/statistics/checkinHourDistribution')
}

export const getRiskTrend = (days = 30) => {
  return get<RiskTrendData[]>('/api/statistics/riskTrend', { days })
}

export const getMoodTrend = (days = 30) => {
  return get<MoodTrendData[]>('/api/statistics/moodTrend', { days })
}

export const getRankingHistory = (days = 7) => {
  return get<RankingHistoryData[]>('/api/statistics/rankingHistory', { days })
}
