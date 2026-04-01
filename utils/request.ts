interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
  timeout?: number
  showLoading?: boolean
  showError?: boolean
}

interface ResponseData<T = any> {
  code: number
  message: string
  data: T
}

import { BASE_URL } from './config'
import { storage } from './storage'

const getToken = () => {
  return storage.get('token')
}

let loadingCount = 0

const showLoading = () => {
  loadingCount++
  if (loadingCount === 1) {
    uni.showLoading({
      title: '加载中...',
      mask: true
    })
  }
}

const hideLoading = () => {
  loadingCount--
  if (loadingCount <= 0) {
    loadingCount = 0
    uni.hideLoading()
  }
}

const getNetworkType = (): Promise<string> => {
  return new Promise((resolve) => {
    uni.getNetworkType({
      success: (res) => {
        resolve(res.networkType)
      },
      fail: () => {
        resolve('unknown')
      }
    })
  })
}

const request = <T = any>(config: RequestConfig): Promise<ResponseData<T>> => {
  const { showLoading: needLoading = true, showError: needShowError = true } = config

  if (needLoading) {
    showLoading()
  }

  const token = getToken()
  const headers: any = {
    'Content-Type': 'application/json',
    ...config.header
  }

  if (token) {
    headers['Authorization'] = 'Bearer ' + token
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + config.url,
      method: config.method || 'GET',
      data: config.data || {},
      header: headers,
      timeout: config.timeout || 15000,
      success: async (res: any) => {
        if (needLoading) {
          hideLoading()
        }

        const { statusCode, data } = res
        
        // 检查是否返回了 HTML 而不是 JSON
        if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
          console.error('服务器返回了 HTML 而不是 JSON:', data.substring(0, 200))
          const errorMsg = `服务器错误 (${statusCode}): 请检查 API 端点是否正确配置`
          if (needShowError) {
            uni.showToast({
              title: '服务器配置错误',
              icon: 'none',
              duration: 3000
            })
          }
          reject({ code: statusCode, message: errorMsg, data: data })
          return
        }
        
        if (statusCode === 200) {
          // 检查 data 是否为对象且有 code 属性
          if (data && typeof data === 'object' && data.code === 200) {
            resolve(data)
          } else if (data && typeof data === 'object') {
            if (needShowError) {
              uni.showToast({
                title: data.message || '请求失败',
                icon: 'none',
                duration: 2000
              })
            }
            reject(data)
          } else {
            const errorMsg = '服务器返回格式错误'
            if (needShowError) {
              uni.showToast({
                title: errorMsg,
                icon: 'none',
                duration: 2000
              })
            }
            reject({ code: 500, message: errorMsg, data: data })
          }
        } else if (statusCode === 401) {
          // 清除登录状态
          storage.remove('token')
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          })
          // 延迟跳转到首页（登录页）
          setTimeout(() => {
            uni.switchTab({ url: '/pages/index/index' })
          }, 1500)
          reject(res)
        } else {
          if (needShowError) {
            uni.showToast({
              title: `网络错误: ${statusCode}`,
              icon: 'none',
              duration: 2000
            })
          }
          reject(res)
        }
      },
      fail: async (err) => {
        if (needLoading) {
          hideLoading()
        }

        const networkType = await getNetworkType()
        let errorMsg = '网络连接失败'
        
        if (networkType === 'none') {
          errorMsg = '网络不可用，请检查网络设置'
        }

        if (needShowError) {
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          })
        }
        reject(err)
      }
    })
  })
}

export const get = <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) => {
  return request<T>({
    url,
    method: 'GET',
    data,
    ...config
  })
}

export const post = <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) => {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...config
  })
}

export const put = <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) => {
  return request<T>({
    url,
    method: 'PUT',
    data,
    ...config
  })
}

export const del = <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) => {
  return request<T>({
    url,
    method: 'DELETE',
    data,
    ...config
  })
}

export default request
