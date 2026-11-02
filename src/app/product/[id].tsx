import { Star, StarFilled } from '@/assets/icons'
import { ProductContext } from '@/context/ProductContext'
import { useStyles } from '@/hooks/useStyles'
import { getProduct, type Product } from '@/services/products.api'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProductScreen() {
  const styles = useStyles((colors) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    scroll: {
      flex: 1
    },
    content: {
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
      padding: 24,
      gap: 20
    },
    productImage: {
      width: '100%',
      height: 240,
      borderRadius: 16,
      backgroundColor: colors.imagePlaceholder
    },
    productInfo: {
      gap: 8
    },
    productTitle: {
      fontSize: 26,
      lineHeight: 34,
      fontWeight: '700',
      color: colors.text
    },
    productCategory: {
      fontSize: 16,
      color: colors.textSecondary
    },
    productDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    },
    productPrice: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.primary
    },
    favoriteButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center'
    },
    favoriteIcon: {
      width: 28,
      height: 28,
      tintColor: colors.textSecondary
    },
    favoriteSelectedIcon: {
      tintColor: colors.rating
    },
    loader: {
      color: colors.primary
    },
    retryButton: {
      marginTop: 16,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 999,
      backgroundColor: colors.primary
    },
    retryText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onPrimary
    },
    buttonPressed: {
      opacity: 0.6
    },
    description: {
      gap: 12
    },
    descriptionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text
    },
    descriptionText: {
      fontSize: 16,
      lineHeight: 25,
      color: colors.text
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary
    }
  }))

  const { favoriteProducts, isFavoritesLoading, changeFavorite } = useContext(ProductContext)!
  const { id } = useLocalSearchParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isErrorLoading, setIsErrorLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  //Загрузка товара по UUID и повторная попытка
  useEffect(() => {
    let isActive = true

    async function loadProduct() {
      setIsLoading(true)
      setIsErrorLoading(false)

      try {
        const data = await getProduct(id)

        if (isActive) setProduct(data)
      }
      catch {
        if (isActive) setIsErrorLoading(true)
      }
      finally {
        if (isActive) setIsLoading(false)
      }
    }

    const timer = setTimeout(loadProduct, 0)

    return () => {
      clearTimeout(timer)
      isActive = false
    }
  }, [id, retryCount])

  //Повторная загрузка товара после ошибки
  function retryLoadProduct() {
    setIsLoading(true)
    setIsErrorLoading(false)
    setRetryCount(previousCount => previousCount + 1)
  }

  if (isLoading || isErrorLoading || !product) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.empty}>
          {isLoading && <ActivityIndicator size="large" color={styles.loader.color} />}
          {!isLoading && isErrorLoading && (
            <>
              <Text style={styles.emptyText}>Не удалось загрузить товар</Text>
              <Pressable
                onPress={retryLoadProduct}
                style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.retryText}>Повторить</Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    )
  }

  const isFavorite = Boolean(favoriteProducts[product.uuid])

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Image source={{ uri: product.image_url }} style={styles.productImage} contentFit="contain" />

        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
        </View>

        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>
            {(product.price / 100).toLocaleString('ru-RU', { style: 'currency', currency: product.currency })}
          </Text>
          <Pressable
            disabled={isFavoritesLoading}
            hitSlop={8}
            onPress={() => changeFavorite(product)}
            style={({ pressed }) => [styles.favoriteButton, pressed && styles.buttonPressed]}
          >
            <Image
              source={isFavorite ? StarFilled : Star}
              style={styles.favoriteIcon}
              tintColor={isFavorite ? styles.favoriteSelectedIcon.tintColor : styles.favoriteIcon.tintColor}
            />
          </Pressable>
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionTitle}>Описание</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
