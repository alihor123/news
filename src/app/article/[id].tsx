import { Star, StarFilled } from '@/assets/icons'
import { categoryNames } from '@/constants'
import { NewsContext } from '@/context/NewsContext'
import { timeFormating } from '@/helpers'
import { useStyles } from '@/hooks/useStyles'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useContext, useState } from 'react'
import { Linking, Pressable, ScrollView, Text, View } from 'react-native'
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
    articleMetadata: {
      fontSize: 14,
      lineHeight: 22,
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
      textAlign: 'center',
      fontSize: 16,
      color: colors.textSecondary
    }
  }))

  const { favoriteNews, selectedArticle, isFavoritesLoading, changeFavorite } = useContext(NewsContext)!
  const [imageRatio, setImageRatio] = useState(16 / 9)
  const article = selectedArticle

  if (!article) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Откройте статью из ленты или избранного</Text>
          <Pressable
            onPress={() => router.replace('/')}
            style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.retryText}>К ленте</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const isFavorite = Boolean(favoriteNews[article.id])

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {article.image?.startsWith('http') && (
          <Image
            source={{ uri: article.image }}
            style={[styles.articleImage, { aspectRatio: imageRatio }]}
            contentFit="contain"
            onLoad={({ source }) => {
              if (source.width > 0 && source.height > 0) {
                setImageRatio(source.width / source.height)
              }
            }}
          />
        )}
        {!article.image?.startsWith('http') && <View style={[styles.articleImage, { aspectRatio: imageRatio }]} />}

        <View style={styles.articleHeader}>
          <View style={styles.articleInfo}>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <Text style={styles.articleCategory}>{article.category.map(category => categoryNames[category] ?? category).join(', ')}</Text>
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

        <View>
          <Text style={styles.articleMetadata}>{new URL(article.url).hostname.replace(/^www\./, '')}</Text>
          <Text style={styles.articleMetadata}>{timeFormating(article.published)}</Text>
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionTitle}>Описание</Text>
          <Text style={styles.descriptionText}>{article.description}</Text>
        </View>
        <Pressable
          onPress={() => Linking.openURL(article.url)}
          style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.retryText}>Читать в источнике</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
