import { ChevronRight, Star, StarFilled } from '@/assets/icons'
import { NewsContext } from '@/context/NewsContext'
import { useStyles } from '@/hooks/useStyles'
import { type Product } from '@/services/products.api'
import { Image } from 'expo-image'
import { useContext } from 'react'
import { Pressable, Text, View } from 'react-native'

type NewsCardProps = {
  article: Product
  onPress: () => void
}

export function NewsCard({ article, onPress }: NewsCardProps) {
  const styles = useStyles((colors) => ({
    article: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 12
    },
    articlePressed: {
      transform: [{ scale: 0.98 }]
    },
    articleImage: {
      width: 72,
      height: 72,
      borderRadius: 12,
      backgroundColor: colors.imagePlaceholder
    },
    articleInfo: {
      flex: 1,
      minWidth: 0,
      gap: 6
    },
    articleTitle: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600',
      color: colors.text
    },
    articleCategory: {
      fontSize: 14,
      color: colors.textSecondary
    },
    articleDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary
    },
    articleActions: {
      alignSelf: 'stretch',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 8
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
    },
    articleArrow: {
      width: 20,
      height: 20,
      tintColor: colors.textSecondary
    }
  }))

  const { favoriteNews, isFavoritesLoading, changeFavorite } = useContext(NewsContext)!
  const isFavorite = Boolean(favoriteNews[article.uuid])

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.article, pressed && styles.articlePressed]}>
      <Image
        source={{ uri: article.image_url }}
        style={styles.articleImage}
        contentFit="contain"
      />
      <View style={styles.articleInfo}>
        <Text style={styles.articleTitle} numberOfLines={2}>{article.name}</Text>
        <Text style={styles.articleCategory}>{article.category}</Text>
        <Text style={styles.articleDescription} numberOfLines={2}>{article.description}</Text>
      </View>
      <View style={styles.articleActions}>
        <Image source={ChevronRight} style={styles.articleArrow} tintColor={styles.articleArrow.tintColor} />
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
    </Pressable>
  )
}
