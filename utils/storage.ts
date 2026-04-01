const STORAGE_PREFIX = 'fengleme_'

export const storage = {
  set(key: string, value: any): void {
    try {
      const prefixedKey = STORAGE_PREFIX + key
      const data = JSON.stringify({
        value,
        timestamp: Date.now()
      })
      uni.setStorageSync(prefixedKey, data)
    } catch (e) {
      console.error('Storage set error:', e)
      uni.showToast({
        title: '存储失败',
        icon: 'none',
        duration: 1500
      })
    }
  },

  get<T = any>(key: string, maxAge?: number): T | null {
    try {
      const prefixedKey = STORAGE_PREFIX + key
      const data = uni.getStorageSync(prefixedKey)
      if (data) {
        const parsed = JSON.parse(data)
        
        if (maxAge && parsed.timestamp) {
          const age = Date.now() - parsed.timestamp
          if (age > maxAge) {
            this.remove(key)
            return null
          }
        }
        
        return parsed.value
      }
      return null
    } catch (e) {
      console.error('Storage get error:', e)
      return null
    }
  },

  remove(key: string): void {
    try {
      const prefixedKey = STORAGE_PREFIX + key
      uni.removeStorageSync(prefixedKey)
    } catch (e) {
      console.error('Storage remove error:', e)
    }
  },

  clear(): void {
    try {
      const info = uni.getStorageInfoSync()
      info.keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          uni.removeStorageSync(key)
        }
      })
    } catch (e) {
      console.error('Storage clear error:', e)
    }
  },

  getInfo(): UniApp.GetStorageInfoSuccess {
    try {
      return uni.getStorageInfoSync()
    } catch (e) {
      console.error('Storage getInfo error:', e)
      return {
        keys: [],
        currentSize: 0,
        limitSize: 0
      }
    }
  },

  setAsync(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const prefixedKey = STORAGE_PREFIX + key
        const data = JSON.stringify({
          value,
          timestamp: Date.now()
        })
        uni.setStorage({
          key: prefixedKey,
          data,
          success: () => resolve(),
          fail: (err) => reject(err)
        })
      } catch (e) {
        reject(e)
      }
    })
  },

  getAsync<T = any>(key: string, maxAge?: number): Promise<T | null> {
    return new Promise((resolve, reject) => {
      try {
        const prefixedKey = STORAGE_PREFIX + key
        uni.getStorage({
          key: prefixedKey,
          success: (res) => {
            try {
              const parsed = JSON.parse(res.data as string)
              
              if (maxAge && parsed.timestamp) {
                const age = Date.now() - parsed.timestamp
                if (age > maxAge) {
                  this.remove(key)
                  resolve(null)
                  return
                }
              }
              
              resolve(parsed.value)
            } catch (e) {
              resolve(null)
            }
          },
          fail: () => resolve(null)
        })
      } catch (e) {
        resolve(null)
      }
    })
  }
}

export default storage
