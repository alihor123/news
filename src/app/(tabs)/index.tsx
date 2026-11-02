import { ArrowDown, Search } from '@/assets/icons'
import { ProductCard } from '@/components/ProductCard'
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
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 6
    },
    sortText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary
    },
    sortIcon: {
      width: 18,
      height: 18,
      tintColor: colors.primary
    },
    sortIconReversed: {
      transform: [{ rotate: '180deg' }]
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

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [sort, setSort] = useState<'price_asc' | 'price_desc'>('price_asc')
  const [filter, setFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isErrorLoading, setIsErrorLoading] = useState(false)
  const [isNextPageLoading, setIsNextPageLoading] = useState(false)
  const productsRequestRef = useRef(0)
  const isProductsLoadingRef = useRef(false)

  //Загрузка каталога и продуктов при старте
  async function loadCatalog() {
    const request = ++productsRequestRef.current
    isProductsLoadingRef.current = true
    setIsLoading(true)
    setIsErrorLoading(false)
    setIsNextPageLoading(false)

    try {
      const [newCategories, data] = await Promise.all([
        getCategories(),
        getProducts({ search: search.trim(), category: filter ?? undefined, sort })
      ])

      if (request !== productsRequestRef.current) return

      setCategories(newCategories)
      setProducts(data.data)
      setPage(data.meta.current_page)
      setTotalPages(data.meta.total_pages)
    }
    catch {
      if (request === productsRequestRef.current) {
        setIsErrorLoading(true)
      }
    }
    finally {
      if (request === productsRequestRef.current) {
        isProductsLoadingRef.current = false
        setIsLoading(false)
      }
    }
  }

  //Обновление товаров при изменении поиска, категории или сортировки
  async function loadProducts() {
    const request = ++productsRequestRef.current
    isProductsLoadingRef.current = true
    setIsLoading(true)
    setIsErrorLoading(false)
    setIsNextPageLoading(false)

    try {
      const data = await getProducts({ search: search.trim(), category: filter ?? undefined, sort })

      if (request !== productsRequestRef.current) return

      setProducts(data.data)
      setPage(data.meta.current_page)
      setTotalPages(data.meta.total_pages)
    }
    catch {
      if (request === productsRequestRef.current) {
        setIsErrorLoading(true)
      }
    }
    finally {
      if (request === productsRequestRef.current) {
        isProductsLoadingRef.current = false
        setIsLoading(false)
      }
    }
  }

  //Первоначальная загрузка и обновление товаров при сортировке или фильтрации
  useEffect(
    () => {
      isProductsLoadingRef.current = true

      const timer = setTimeout(() => {
        if (categories.length === 0) {
          loadCatalog()
        }
        else {
          loadProducts()
        }
      }, 200)

      return () => {
        clearTimeout(timer)
        productsRequestRef.current += 1
      }
    },
    [search, filter, sort]
  )

  //Смена сортировки по цене
  function changeSort() {
    if (sort === 'price_asc') {
      setSort('price_desc')
    }
    else {
      setSort('price_asc')
    }
  }

  //Загрузка следующей страницы при прокрутке
  async function loadNextPage() {
    if (isProductsLoadingRef.current || page >= totalPages) return

    const request = ++productsRequestRef.current
    isProductsLoadingRef.current = true
    setIsNextPageLoading(true)

    try {
      const data = await getProducts({
        search: search.trim(),
        category: filter ?? undefined,
        sort,
        page: page + 1
      })

      if (request !== productsRequestRef.current) return

      setProducts(previousProducts => [...previousProducts, ...data.data])
      setPage(data.meta.current_page)
      setTotalPages(data.meta.total_pages)
    }
    catch (error) {
      if (request === productsRequestRef.current) {
        showMessage(error instanceof ApiError ? error.message : 'Не удалось загрузить следующую страницу')
      }
    }
    finally {
      if (request === productsRequestRef.current) {
        isProductsLoadingRef.current = false
        setIsNextPageLoading(false)
      }
    }
  }

  //Открытие экрана конкретного товара
  function openProduct(uuid: string) {
    router.push({
      pathname: '/product/[id]',
      params: { id: uuid }
    })
  }

  //Анимация первоначальной загрузки и отображение ошибки
  function renderCatalogStatus() {
    return (
      <View style={styles.empty}>
        {isLoading && <ActivityIndicator size="large" color={styles.loader.color} />}
        {!isLoading && isErrorLoading && (
          <>
            <Text style={styles.emptyText}>Не удалось загрузить каталог</Text>
            <Pressable
              onPress={loadCatalog}
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
        {renderCatalogStatus()}
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Продукты</Text>
          <Pressable
            onPress={changeSort}
            style={({ pressed }) => [styles.sortButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.sortText}>{sort === 'price_asc' ? 'Дешевле' : 'Дороже'}</Text>
            <Image
              source={ArrowDown}
              style={[styles.sortIcon, sort === 'price_desc' && styles.sortIconReversed]}
              tintColor={styles.sortIcon.tintColor}
            />
          </Pressable>
        </View>

        <View style={styles.search}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholder="Поиск товаров"
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

        {(isLoading || isErrorLoading) && renderCatalogStatus()}
        {!isLoading && !isErrorLoading && (
          <FlatList
            data={products}
            keyboardShouldPersistTaps="handled"
            keyExtractor={item => item.uuid}
            style={styles.productList}
            contentContainerStyle={styles.productListContent}
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
              <ProductCard
                product={item}
                onPress={() => openProduct(item.uuid)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  )
}
