import { storage } from '@/utils/storage'
import { syncAnonymousData } from '@/api'

const ANONYMOUS_DATA_KEY = 'fengleme_anonymous_data'
const SYNCED_FLAG_KEY = 'fengleme_anonymous_synced'

interface AnonymousData {
  continuousDays: number
  totalDays: number
  crazyPoints: number
  level: string
  isCheckedIn: boolean
  lastCheckinDate: string
}

export const hasAnonymousData = (): boolean => {
  const data = storage.get(ANONYMOUS_DATA_KEY)
  return data && (data.totalDays > 0 || data.crazyPoints > 0)
}

export const hasSynced = (): boolean => {
  return storage.get(SYNCED_FLAG_KEY) === true
}

export const markAsSynced = (): void => {
  storage.set(SYNCED_FLAG_KEY, true)
}

export const getAnonymousData = (): AnonymousData | null => {
  return storage.get(ANONYMOUS_DATA_KEY)
}

export const clearAnonymousData = (): void => {
  storage.remove(ANONYMOUS_DATA_KEY)
}

export const syncToServer = async (): Promise<boolean> => {
  try {
    if (!hasAnonymousData()) {
      return true
    }
    
    if (hasSynced()) {
      return true
    }
    
    const data = getAnonymousData()
    if (!data) {
      return true
    }
    
    await syncAnonymousData(data)
    markAsSynced()
    clearAnonymousData()
    
    return true
  } catch (error) {
    console.error('同步匿名数据失败', error)
    return false
  }
}
