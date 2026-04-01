import { post } from '@/utils/request'

export interface LifeCalculateRequest {
  birthDate: string
  lifestyle: 'steady' | 'occasional' | 'reckless'
}

export interface LifeCalculateResponse {
  years: number
  months: number
  totalMonths: number
  suggestion: string
}

export const calculateLifeBalance = (
  data: LifeCalculateRequest
): Promise<LifeCalculateResponse> => {
  return post('/api/life/calculate', data)
}
