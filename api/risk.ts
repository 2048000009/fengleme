import { post } from '@/utils/request'

export interface RiskCalculateRequest {
  answers: Array<{
    score: number
    type: string
  }>
}

export interface RiskItem {
  score: number
  label: string
}

export interface RiskCalculateResponse {
  legal: RiskItem
  social: RiskItem
  medical: RiskItem
  total: number
  conclusion: string
  alternatives: string[]
  comment: string
}

export const calculateRisk = (
  data: RiskCalculateRequest
) => {
  return post<RiskCalculateResponse>('/api/risk/calculate', data)
}
