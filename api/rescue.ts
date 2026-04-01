import { post, get } from '@/utils/request'

export interface Contact {
  id: string
  name: string
  phone: string
  relationship: string
}

export interface SOSParams {
  contacts: string[]
  location?: {
    lat: number
    lng: number
    address: string
  }
  message?: string
}

export const sendSOS = (data: SOSParams) => {
  return post('/api/rescue/sos', data)
}

export const getContacts = (): Promise<Contact[]> => {
  return get('/api/rescue/contacts')
}

export const addContact = (data: Omit<Contact, 'id'>) => {
  return post('/api/rescue/contacts', data)
}

export const updateContact = (id: string, data: Partial<Contact>) => {
  return post(`/api/rescue/contacts/${id}`, data)
}

export const deleteContact = (id: string) => {
  return post(`/api/rescue/contacts/${id}/delete`, {})
}

export const getHotlines = () => {
  return get('/api/rescue/hotlines')
}
