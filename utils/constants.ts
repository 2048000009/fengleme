export const STORAGE_KEYS = {
  CHECKIN_DATA: 'checkin_data',
  CHECKIN_HISTORY: 'checkin_history',
  DAILY_CHECKIN_COUNT: 'daily_checkin_count',
  MOOD_HISTORY: 'mood_history',
  RISK_HISTORY: 'risk_history',
  LIFE_HISTORY: 'life_history',
  USAGE_STATS: 'usage_stats',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  TASK_SYSTEM_DATA: 'task_system_data',
  THEME: 'theme',
  ACTUAL_THEME: 'actual_theme'
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]
