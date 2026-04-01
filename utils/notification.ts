import { storage } from '@/utils/storage'

const NOTIFICATION_KEY = 'checkin_notification_settings'

interface NotificationSettings {
  enabled: boolean
  time: string
  lastScheduledDate: string
}

export const notificationManager = {
  requestPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      // #ifdef APP-PLUS
      plus.android.requestPermissions(
        'android.permission.POST_NOTIFICATIONS',
        (result) => {
          resolve(result.granted && result.granted.length > 0)
        },
        (err) => {
          console.error('请求通知权限失败', err)
          resolve(false)
        }
      )
      // #endif
      
      // #ifndef APP-PLUS
      resolve(true)
      // #endif
    })
  },

  getSettings(): NotificationSettings | null {
    return storage.get(NOTIFICATION_KEY)
  },

  saveSettings(settings: Partial<NotificationSettings>): void {
    const current = this.getSettings() || {
      enabled: false,
      time: '20:30',
      lastScheduledDate: ''
    }
    storage.set(NOTIFICATION_KEY, { ...current, ...settings })
  },

  async scheduleDailyNotification(time: string): Promise<void> {
    if (!time) return
    
    const today = new Date().toISOString().split('T')[0]
    const settings = this.getSettings()
    
    if (settings?.lastScheduledDate === today) {
      console.log('今日已设置提醒')
      return
    }

    try {
      // #ifdef APP-PLUS
      const [hours, minutes] = time.split(':').map(Number)
      
      // 取消旧的通知
      plus.push.clear()
      
      // 创建本地消息
      plus.push.createMessage(
        '🤪 该签到啦！',
        {
          cover: true,
          sound: 'system',
          title: '疯了么 - 每日提醒'
        },
        () => {
          console.log('本地消息创建成功')
        }
      )
      
      // 设置定时触发（每天固定时间）
      const now = new Date()
      const targetTime = new Date()
      targetTime.setHours(hours, minutes, 0, 0)
      
      // 如果今天的时间已过，设置为明天
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1)
      }
      
      const delay = targetTime.getTime() - now.getTime()
      
      setTimeout(() => {
        this.showLocalNotification()
        // 设置第二天的提醒
        this.scheduleNextDayNotification(time)
      }, delay)
      
      this.saveSettings({ 
        enabled: true, 
        time,
        lastScheduledDate: today 
      })
      // #endif
      
      // #ifndef APP-PLUS
      console.log('非APP环境，使用模拟提醒')
      // #endif
      
    } catch (error) {
      console.error('设置提醒失败', error)
    }
  },

  showLocalNotification(): void {
    // #ifdef APP-PLUS
    plus.push.createMessage(
      '🤪 还没签到？快来证明你还活着！',
      {
        cover: true,
        sound: 'system',
        when: new Date(),
        title: '疯了么'
      }
    )
    // #endif
    
    // #ifdef H5
    if ('Notification' in window) {
      new Notification('疯了么', {
        body: '🤪 还没签到？快来证明你还活着！',
        icon: '/logo1.png'
      })
    }
    // #endif
  },

  scheduleNextDayNotification(time: string): void {
    const [hours, minutes] = time.split(':').map(Number)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(hours, minutes, 0, 0)
    
    const delay = tomorrow.getTime() - now.getTime()
    
    setTimeout(() => {
      this.showLocalNotification()
      this.scheduleNextDayNotification(time)
    }, delay)
  },

  cancelAllNotifications(): void {
    // #ifdef APP-PLUS
    plus.push.clear()
    // #endif
    this.saveSettings({ enabled: false })
  }
}

export default notificationManager
