export const sensitiveWords = [
  '自残',
  '自杀',
  '跳楼',
  '割腕',
  '杀人',
  '放火',
  '上吊',
  '服毒',
  '安眠药',
  '农药',
  '结束生命',
  '不想活',
  '活够了',
  '了断',
  '轻生',
  '绝食',
  '跳河',
  '卧轨',
  '自焚',
  '自缢'
]

export const checkSensitiveWords = (text: string): boolean => {
  if (!text || text.trim() === '') return false
  
  for (const word of sensitiveWords) {
    if (text.includes(word)) {
      return true
    }
  }
  return false
}

export const getMatchedWords = (text: string): string[] => {
  const matches: string[] = []
  if (!text || text.trim() === '') return matches
  
  for (const word of sensitiveWords) {
    if (text.includes(word)) {
      matches.push(word)
    }
  }
  return matches
}

export const hotlineNumbers = {
  national: '400-161-9995',
  beijing: '010-82951332',
  shanghai: '021-12320',
  guangzhou: '020-81899120'
}
