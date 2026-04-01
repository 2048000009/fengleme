import { post } from '@/utils/request'

export const sendTestReminder = () => {
  return post('/api/reminder/test')
}
