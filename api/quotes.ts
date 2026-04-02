import { get, post } from '@/utils/request'
import type { QuotesConfig } from '@/utils/quotes'

// 获取文案配置
export const getQuotes = () => {
  return get<QuotesConfig>('/api/quotes')
}

// 刷新文案缓存
export const refreshQuotes = () => {
  return post('/api/quotes/refresh')
}

// 更新文案（管理员接口）
export const updateQuotes = (data: Partial<QuotesConfig>) => {
  return post('/api/quotes/update', data)
}
