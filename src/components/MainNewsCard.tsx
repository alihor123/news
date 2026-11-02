import { Star, StarFilled } from '@/assets/icons'
import { categoryNames } from '@/constants'
import { NewsContext } from '@/context/NewsContext'
import { timeAgoFormating } from '@/helpers'
import { useStyles } from '@/hooks/useStyles'
import { type Article } from '@/services/news.api'
import { Image } from 'expo-image'
import { useContext, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

type MainNewsCardProps = {
  article: Article
  onPress: () => void
}

export function MainNewsCard({ article, onPress }: MainNewsCardProps) {
  const styles = useStyles((colors) => ({
    article: {
      paddingVertical: 8,
      gap: 12
    },
    articlePressed: {
      transform: [{ scale: 0.98 }]
    },
    articleImage: {
      width: '100%',
      borderRadius: 12,
      backgroundColor: colors.imagePlaceholder
    },
    articleInfo: {
      gap: 6
    },
    articleTitle: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600',
      color: colors.text
    },
    articleCategory: {
      flexShrink: 1,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textSecondary
    },
    articleMetadata: {
      flexShrink: 0,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textSecondary
    },
    articleHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    },
    articleLabel: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text
    },
    articleDescription: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary
    },
    favoriteButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center'
    },
    favoriteIcon: {
      width: 24,
      height: 24,
      tintColor: colors.textSecondary
    },
    favoriteSelectedIcon: {
      tintColor: colors.rating
    },
    buttonPressed: {
      opacity: 0.6
    }
  }))

  const { favoriteNews, isFavoritesLoading, changeFavorite } = useContext(NewsContext)!
  const [imageRatio, setImageRatio] = useState(16 / 9)
  const isFavorite = Boolean(favoriteNews[article.id])

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.article, pressed && styles.articlePressed]}>
      <View style={styles.articleHeader}>
        <Text style={styles.articleLabel}>Главная новость</Text>
        <Pressable
          disabled={isFavoritesLoading}
          hitSlop={8}
          onPress={event => {
            event.stopPropagation()
            changeFavorite(article)
          }}
          style={({ pressed }) => [styles.favoriteButton, pressed && styles.buttonPressed]}
        >
          <Image
            source={isFavorite ? StarFilled : Star}
            style={styles.favoriteIcon}
            tintColor={isFavorite ? styles.favoriteSelectedIcon.tintColor : styles.favoriteIcon.tintColor}
          />
        </Pressable>
      </View>
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
      <View style={styles.articleInfo}>
        <Text style={styles.articleTitle} numberOfLines={3}>{article.title}</Text>
        {article.description && (
          <Text style={styles.articleDescription} numberOfLines={3}>{article.description}</Text>
        )}
        {article.category.length > 0 && (
          <Text style={styles.articleCategory} numberOfLines={1}>{article.category.map(category => categoryNames[category] ?? category).join(', ')}</Text>
        )}
        <Text style={styles.articleMetadata} numberOfLines={1}>{timeAgoFormating(article.published)}</Text>
        <Text style={styles.articleMetadata} numberOfLines={1}>{new URL(article.url).hostname.replace(/^www\./, '')}</Text>
      </View>

    </Pressable>
  )
}
