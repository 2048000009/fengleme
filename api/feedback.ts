import { get, post } from '@/utils/request'

// 提交反馈
export const submitFeedback = (type: string, content: string, contact?: string) => {
  return post('/api/feedback/submit', { type, content, contact })
}

// 反馈列表
export const getFeedbackList = (page = 1, size = 20) => {
  return get('/api/feedback/list', { page, size })
}
