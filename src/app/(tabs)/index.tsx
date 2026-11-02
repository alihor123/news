import { Search } from '@/assets/icons'
import { NewsCard } from '@/components/NewsCard'
import { showMessage } from '@/helpers'
import { useStyles } from '@/hooks/useStyles'
import { getCategories, getProducts, type Category, type Product } from '@/services/products.api'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ApiError } from '@/services/api'

export default function Index() {
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      gap: 12
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text
    },
    search: {
      marginHorizontal: 24,
      position: 'relative'
    },
    searchInput: {
      height: 52,
      paddingLeft: 48,
      paddingRight: 20,
      borderRadius: 999,
      backgroundColor: colors.surfaceSoft,
      fontSize: 16,
      color: colors.text
    },
    searchIcon: {
      position: 'absolute',
      left: 16,
      top: 16,
      width: 20,
      height: 20,
      tintColor: colors.textSecondary
    },
    placeholder: {
      color: colors.textSecondary
    },
    categories: {
      flexGrow: 0
    },
    categoriesContent: {
      paddingHorizontal: 24,
      gap: 8
    },
    category: {
      height: 38,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSoft
    },
    categorySelected: {
      backgroundColor: colors.primary
    },
    categoryText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text
    },
    categorySelectedText: {
      color: colors.onPrimary
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
      textAlign: 'center',
      fontSize: 16,
      color: colors.textSecondary
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
    listFooter: {
      height: 48,
      alignItems: 'center',
      justifyContent: 'center'
    },
    buttonPressed: {
      opacity: 0.6
    }
  }))

  const [news, setNews] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isErrorLoading, setIsErrorLoading] = useState(false)
  const [isNextPageLoading, setIsNextPageLoading] = useState(false)
  const newsRequestRef = useRef(0)
  const isNewsLoadingRef = useRef(false)

  //Загрузка ленты и категорий при старте
  async function loadFeed() {
    const request = ++newsRequestRef.current
    isNewsLoadingRef.current = true
    setIsLoading(true)
    setIsErrorLoading(false)
    setIsNextPageLoading(false)

    try {
      const [newCategories, data] = await Promise.all([
        getCategories(),
        getProducts({ search: search.trim(), category: filter ?? undefined })
      ])

      if (request !== newsRequestRef.current) return

      setCategories(newCategories)
      setNews(data.data)
      setPage(data.meta.current_page)
      setTotalPages(data.meta.total_pages)
    }
    catch {
      if (request === newsRequestRef.current) {
        setIsErrorLoading(true)
      }
    }
    finally {
      if (request === newsRequestRef.current) {
        isNewsLoadingRef.current = false
        setIsLoading(false)
      }
    }
  }

  //Обновление новостей при изменении поиска или категории
  async function loadNews() {
    const request = ++newsRequestRef.current
    isNewsLoadingRef.current = true
    setIsLoading(true)
    setIsErrorLoading(false)
    setIsNextPageLoading(false)

    try {
      const data = await getProducts({ search: search.trim(), category: filter ?? undefined })

      if (request !== newsRequestRef.current) return

      setNews(data.data)
      setPage(data.meta.current_page)
      setTotalPages(data.meta.total_pages)
    }
    catch {
      if (request === newsRequestRef.current) {
        setIsErrorLoading(true)
      }
    }
    finally {
      if (request === newsRequestRef.current) {
        isNewsLoadingRef.current = false
        setIsLoading(false)
      }
    }
  }

  //Первоначальная загрузка и обновление новостей при поиске или фильтрации
  useEffect(
    () => {
      isNewsLoadingRef.current = true

      const timer = setTimeout(() => {
        if (categories.length === 0) {
          loadFeed()
        }
        else {
          loadNews()
        }
      }, 200)

      return () => {
        clearTimeout(timer)
        newsRequestRef.current += 1
      }
    },
    [search, filter]
  )

  //Загрузка следующей страницы при прокрутке
  async function loadNextPage() {
    if (isNewsLoadingRef.current || page >= totalPages) return

    const request = ++newsRequestRef.current
    isNewsLoadingRef.current = true
    setIsNextPageLoading(true)

    try {
      const data = await getProducts({
        search: search.trim(),
        category: filter ?? undefined,
        page: page + 1
      })

      if (request !== newsRequestRef.current) return

      setNews(previousNews => [...previousNews, ...data.data])
      setPage(data.meta.current_page)
      setTotalPages(data.meta.total_pages)
    }
    catch (error) {
      if (request === newsRequestRef.current) {
        showMessage(error instanceof ApiError ? error.message : 'Не удалось загрузить следующую страницу')
      }
    }
    finally {
      if (request === newsRequestRef.current) {
        isNewsLoadingRef.current = false
        setIsNextPageLoading(false)
      }
    }
  }

  //Открытие экрана конкретной статьи
  function openArticle(uuid: string) {
    router.push({
      pathname: '/article/[id]',
      params: { id: uuid }
    })
  }

  //Анимация первоначальной загрузки и отображение ошибки
  function renderFeedStatus() {
    return (
      <View style={styles.empty}>
        {isLoading && <ActivityIndicator size="large" color={styles.loader.color} />}
        {!isLoading && isErrorLoading && (
          <>
            <Text style={styles.emptyText}>Не удалось загрузить новости</Text>
            <Pressable
              onPress={loadFeed}
              style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.retryText}>Повторить</Text>
            </Pressable>
          </>
        )}
      </View>
    )
  }

  if (categories.length === 0 && (isLoading || isErrorLoading)) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {renderFeedStatus()}
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Новости</Text>
        </View>

        <View style={styles.search}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholder="Поиск новостей"
            placeholderTextColor={styles.placeholder.color}
          />
          <Image
            source={Search}
            style={styles.searchIcon}
            tintColor={styles.searchIcon.tintColor}
            pointerEvents="none"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={styles.categoriesContent}
        >
          <Pressable
            onPress={() => setFilter(null)}
            style={({ pressed }) => [
              styles.category,
              filter === null && styles.categorySelected,
              pressed && styles.buttonPressed
            ]}
          >
            <Text style={[styles.categoryText, filter === null && styles.categorySelectedText]}>Все</Text>
          </Pressable>
          {categories.map(category => (
            <Pressable
              key={category.id}
              onPress={() => setFilter(category.slug)}
              style={({ pressed }) => [
                styles.category,
                filter === category.slug && styles.categorySelected,
                pressed && styles.buttonPressed
              ]}
            >
              <Text style={[
                styles.categoryText,
                filter === category.slug && styles.categorySelectedText
              ]}>
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {(isLoading || isErrorLoading) && renderFeedStatus()}
        {!isLoading && !isErrorLoading && (
          <FlatList
            data={news}
            keyboardShouldPersistTaps="handled"
            keyExtractor={item => item.uuid}
            style={styles.newsList}
            contentContainerStyle={styles.newsListContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Ничего не найдено</Text>
              </View>
            }
            onEndReached={loadNextPage}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              <View style={styles.listFooter}>
                {isNextPageLoading && <ActivityIndicator color={styles.loader.color} />}
              </View>
            }
            renderItem={({ item }) => (
              <NewsCard
                article={item}
                onPress={() => openArticle(item.uuid)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  )
}
