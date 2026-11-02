import { Star, StarFilled } from '@/assets/icons'
import { NewsContext } from '@/context/NewsContext'
import { useStyles } from '@/hooks/useStyles'
import { getProduct, type Product } from '@/services/products.api'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ArticleScreen() {
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
    articleImage: {
      width: '100%',
      height: 240,
      borderRadius: 16,
      backgroundColor: colors.imagePlaceholder
    },
    articleInfo: {
      flex: 1,
      gap: 8
    },
    articleTitle: {
      fontSize: 26,
      lineHeight: 34,
      fontWeight: '700',
      color: colors.text
    },
    articleCategory: {
      fontSize: 16,
      color: colors.textSecondary
    },
    articleHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12
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

  const { favoriteNews, isFavoritesLoading, changeFavorite } = useContext(NewsContext)!
  const { id } = useLocalSearchParams<{ id: string }>()
  const [article, setArticle] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isErrorLoading, setIsErrorLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  //Загрузка статьи по UUID и повторная попытка
  useEffect(() => {
    let isActive = true

    async function loadArticle() {
      setIsLoading(true)
      setIsErrorLoading(false)

      try {
        const data = await getProduct(id)

        if (isActive) setArticle(data)
      }
      catch {
        if (isActive) setIsErrorLoading(true)
      }
      finally {
        if (isActive) setIsLoading(false)
      }
    }

    const timer = setTimeout(loadArticle, 0)

    return () => {
      clearTimeout(timer)
      isActive = false
    }
  }, [id, retryCount])

  //Повторная загрузка статьи после ошибки
  function retryLoadArticle() {
    setIsLoading(true)
    setIsErrorLoading(false)
    setRetryCount(previousCount => previousCount + 1)
  }

  if (isLoading || isErrorLoading || !article) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.empty}>
          {isLoading && <ActivityIndicator size="large" color={styles.loader.color} />}
          {!isLoading && isErrorLoading && (
            <>
              <Text style={styles.emptyText}>Не удалось загрузить статью</Text>
              <Pressable
                onPress={retryLoadArticle}
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

  const isFavorite = Boolean(favoriteNews[article.uuid])

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Image source={{ uri: article.image_url }} style={styles.articleImage} contentFit="contain" />

        <View style={styles.articleHeader}>
          <View style={styles.articleInfo}>
            <Text style={styles.articleTitle}>{article.name}</Text>
            <Text style={styles.articleCategory}>{article.category}</Text>
          </View>
          <Pressable
            disabled={isFavoritesLoading}
            hitSlop={8}
            onPress={() => changeFavorite(article)}
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
          <Text style={styles.descriptionText}>{article.description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
