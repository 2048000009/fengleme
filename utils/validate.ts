export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateRequired = (value: string): boolean => {
  return value && value.trim().length > 0
}

export const validateDate = (date: string): boolean => {
  if (!date) return false
  const dateObj = new Date(date)
  return !isNaN(dateObj.getTime()) && dateObj < new Date()
}
