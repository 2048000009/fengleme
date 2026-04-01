export type ThemeMode = 'light' | 'dark' | 'system'

const THEME_KEY = 'fengleme_theme'

class ThemeManager {
  private currentMode: ThemeMode = 'system'
  private listeners: Array<(mode: ThemeMode) => void> = []

  constructor() {
    this.init()
  }

  private init() {
    const savedMode = this.getStoredMode()
    if (savedMode) {
      this.currentMode = savedMode
    }
    this.applyTheme(this.currentMode)
  }

  private getStoredMode(): ThemeMode {
    try {
      const data = uni.getStorageSync(THEME_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        return parsed.mode || 'system'
      }
    } catch (e) {
      console.error('Theme getStoredMode error:', e)
    }
    return 'system'
  }

  private storeMode(mode: ThemeMode) {
    try {
      uni.setStorageSync(THEME_KEY, JSON.stringify({ mode }))
    } catch (e) {
      console.error('Theme storeMode error:', e)
    }
  }

  getMode(): ThemeMode {
    return this.currentMode
  }

  getActualTheme(): 'light' | 'dark' {
    if (this.currentMode === 'system') {
      const systemInfo = uni.getSystemInfoSync()
      return systemInfo.theme === 'dark' ? 'dark' : 'light'
    }
    return this.currentMode
  }

  setMode(mode: ThemeMode) {
    this.currentMode = mode
    this.storeMode(mode)
    this.applyTheme(mode)
    this.notifyListeners()
  }

  private applyTheme(mode: ThemeMode) {
    const actualTheme = mode === 'system'
      ? (uni.getSystemInfoSync().theme === 'dark' ? 'dark' : 'light')
      : mode

    uni.setStorageSync('fengleme_actual_theme', actualTheme)

    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page && page.setData) {
        const themeClass = actualTheme === 'dark' ? 'dark' : ''
        page.setData({ themeClass })
      }
    })

    if (typeof document !== 'undefined') {
      const body = document.body || document.querySelector('body')
      if (body) {
        if (actualTheme === 'dark') {
          body.classList.add('dark')
        } else {
          body.classList.remove('dark')
        }
      }
    }
  }

  subscribe(listener: (mode: ThemeMode) => void) {
    this.listeners.push(listener)
  }

  unsubscribe(listener: (mode: ThemeMode) => void) {
    this.listeners = this.listeners.filter(l => l !== listener)
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentMode))
  }
}

export const themeManager = new ThemeManager()

export default themeManager
