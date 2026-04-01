import { get } from '@/utils/request'

export interface UploadResult {
  url: string
  name: string
}

export const uploadFile = (filePath: string): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'https://flm.lvafan.cn/api/common/upload',
      filePath,
      name: 'file',
      success: (res: any) => {
        const data = JSON.parse(res.data)
        if (data.code === 200) {
          resolve(data.data)
        } else {
          reject(data)
        }
      },
      fail: reject
    })
  })
}

export const getSystemConfig = () => {
  return get('/api/system/config')
}
