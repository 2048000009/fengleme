import { get, post } from '@/utils/request'

export interface MessageItem {
  id: number
  title: string
  content: string
  type: string
  isRead: boolean
  createTime: string
}

// 消息列表
export const getMessageList = (page = 1, size = 20) => {
  return get<{ list: MessageItem[]; page: number; size: number }>('/api/messages/list', { page, size })
}

// 未读消息数量
export const getUnreadCount = () => {
  return get<{ count: number }>('/api/messages/unread')
}

// 标记已读
export const markMessageRead = (id: number) => {
  return post('/api/messages/read', { id })
}

// 标记全部已读
export const markAllRead = () => {
  return post('/api/messages/read-all')
}
