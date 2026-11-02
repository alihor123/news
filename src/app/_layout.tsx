import { ProductProvider } from '@/context/ProductContext'
import { useStyles } from '@/hooks/useStyles'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export const unstable_settings = {
  anchor: '(tabs)'
}

export default function RootLayout() {
  const styles = useStyles((colors) => ({
    screen: {
      backgroundColor: colors.background
    },
    headerTitle: {
      color: colors.text
    }
  }))

  return (
    <ProductProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{
        animation: 'default',
        contentStyle: styles.screen,
        headerStyle: styles.screen,
        headerTintColor: styles.headerTitle.color,
        headerShadowVisible: false
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Товар' }} />
      </Stack>
    </ProductProvider>
  )
}
