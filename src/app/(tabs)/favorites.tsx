import { ProductCard } from '@/components/ProductCard'
import { ProductContext } from '@/context/ProductContext'
import { useStyles } from '@/hooks/useStyles'
import { router } from 'expo-router'
import { useContext } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Favorites() {
  const styles = useStyles((colors) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    content: {
      flex: 1,
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
      paddingVertical: 24,
      gap: 20
    },
    title: {
      paddingHorizontal: 24,
      fontSize: 26,
      fontWeight: '700',
      color: colors.text
    },
    productList: {
      flex: 1
    },
    productListContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      gap: 12
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
      color: colors.textSecondary
    },
    loader: {
      color: colors.primary
    }
  }))

  const { favoriteProducts, isFavoritesLoading } = useContext(ProductContext)!

  //Открытие товара из избранного
  function openProduct(uuid: string) {
    router.push({
      pathname: '/product/[id]',
      params: { id: uuid }
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <Text style={styles.title}>Избранное</Text>
        {isFavoritesLoading && (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color={styles.loader.color} />
          </View>
        )}
        {!isFavoritesLoading && (
          <FlatList
            data={Object.values(favoriteProducts)}
            keyExtractor={item => item.uuid}
            style={styles.productList}
            contentContainerStyle={styles.productListContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Избранных товаров пока нет</Text>
              </View>
            }
            renderItem={({ item }) => (
              <ProductCard product={item} onPress={() => openProduct(item.uuid)} />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  )
}
