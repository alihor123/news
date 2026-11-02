import { NewsCard } from '@/components/NewsCard'
import { NewsContext } from '@/context/NewsContext'
import { useStyles } from '@/hooks/useStyles'
import { type Article } from '@/services/news.api'
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
    newsList: {
      flex: 1
    },
    newsListContent: {
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

  const { favoriteNews, isFavoritesLoading, setSelectedArticle } = useContext(NewsContext)!

  //Открытие статьи из избранного
  function openArticle(article: Article) {
    setSelectedArticle(article)

    router.push({
      pathname: '/article/[id]',
      params: { id: article.id }
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
            data={Object.values(favoriteNews)}
            keyExtractor={item => item.id}
            style={styles.newsList}
            contentContainerStyle={styles.newsListContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Избранных новостей пока нет</Text>
              </View>
            }
            renderItem={({ item }) => (
              <NewsCard article={item} onPress={() => openArticle(item)} />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  )
}
