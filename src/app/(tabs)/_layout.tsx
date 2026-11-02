import { Catalog, Star, StarFilled } from '@/assets/icons'
import { useStyles } from '@/hooks/useStyles'
import { Image } from 'expo-image'
import { TopTabs } from 'expo-router/js-top-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  const styles = useStyles((colors) => ({
    screen: {
      backgroundColor: colors.background
    },
    tabBar: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      elevation: 0,
      shadowOpacity: 0,
      height: 64 + insets.bottom,
      paddingTop: 6,
      paddingBottom: insets.bottom
    },
    tabItem: {
      height: 58,
      paddingVertical: 4
    },
    tabIndicator: {
      height: 0,
      backgroundColor: 'transparent'
    },
    tabLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600',
      margin: 0,
      textTransform: 'none'
    },
    tabIcon: {
      width: 24,
      height: 24
    },
    activeTab: {
      color: colors.primary
    },
    inactiveTab: {
      color: colors.textSecondary
    }
  }))

  return (
    <TopTabs tabBarPosition="bottom" screenOptions={{
      swipeEnabled: true,
      animationEnabled: true,
      lazy: false,
      lazyPreloadDistance: 1,
      sceneStyle: styles.screen,
      tabBarStyle: styles.tabBar,
      tabBarItemStyle: styles.tabItem,
      tabBarIndicatorStyle: styles.tabIndicator,
      tabBarShowIcon: true,
      tabBarPressColor: 'transparent',
      tabBarPressOpacity: 1,
      tabBarLabelStyle: styles.tabLabel,
      tabBarActiveTintColor: styles.activeTab.color,
      tabBarInactiveTintColor: styles.inactiveTab.color
    }}>
      <TopTabs.Screen name="index" options={{
        title: 'Каталог',
        tabBarIcon: ({ focused }) => (
          <Image source={Catalog} style={styles.tabIcon} tintColor={focused ? styles.activeTab.color : styles.inactiveTab.color} />
        )
      }} />
      <TopTabs.Screen name="favorites" options={{
        title: 'Избранное',
        tabBarIcon: ({ focused }) => (
          <Image source={focused ? StarFilled : Star} style={styles.tabIcon} tintColor={focused ? styles.activeTab.color : styles.inactiveTab.color} />
        )
      }} />
    </TopTabs>
  )
}
