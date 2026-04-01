import { post } from '@/utils/request'

export interface CheckSensitiveWordsRequest {
  text: string
}

export interface CheckSensitiveWordsResponse {
  hasSensitiveWords: boolean
  matchedWords: string[]
}

export const checkSensitiveWords = (
  data: CheckSensitiveWordsRequest
): Promise<CheckSensitiveWordsResponse> => {
  return post('/api/safety/check-sensitive-words', data)
}
