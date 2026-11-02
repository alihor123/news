import { Platform, ToastAndroid } from 'react-native'

export function showMessage(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT)
  }
}

export function timeFormating(date: string) {
  const formattedDate = date.replace(' ', 'T').replace(' +0000', 'Z')
  return new Date(formattedDate).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
export function timeAgoFormating(date: string) {
  const formattedDate = date.replace(' ', 'T').replace(' +0000', 'Z')
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(formattedDate).getTime()) / 60000))

  if (minutes < 1) return 'Только что'
  if (minutes < 60) return `${minutes} мин. назад`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ч. назад`

  return `${Math.floor(hours / 24)} дн. назад`
}
