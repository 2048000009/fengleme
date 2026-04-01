const ENV = import.meta.env.MODE || 'development'

const API_CONFIG = {
  development: 'https://flm.lvafan.cn',
  staging: 'https://flm.lvafan.cn',
  production: 'https://flm.lvafan.cn'
}

export const BASE_URL = API_CONFIG[ENV] || API_CONFIG.production

export const TENCENT_MAP_KEY = 'YOUR_KEY'
