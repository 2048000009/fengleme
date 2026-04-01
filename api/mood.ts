import { post } from '@/utils/request'

interface ResponseData<T = any> {
  code: number
  message: string
  data: T
}

export interface MoodCalculateRequest {
  text: string
  emotionTags: string[]
}

export interface MoodCalculateResponse {
  index: number
  level: 'normal' | 'mild' | 'moderate' | 'severe'
  levelText: string
  comment: string
}

export const calculateMoodIndex = (
  data: MoodCalculateRequest
): Promise<ResponseData<MoodCalculateResponse>> => {
  return post('/api/mood/calculate', data)
}
