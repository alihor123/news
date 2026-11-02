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
